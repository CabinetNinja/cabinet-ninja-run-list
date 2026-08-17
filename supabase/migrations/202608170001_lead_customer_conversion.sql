-- Phase 1C extension: atomic lead-to-customer conversion.
-- This migration is intentionally pending local work. It is not a production
-- deployment instruction and must be reviewed before any production use.
-- Additive only: existing leads, jobs, CN numbers, files, and history remain.

alter table public.leads
  add column if not exists converted_at timestamptz,
  add column if not exists converted_by uuid references auth.users(id) on delete set null,
  add column if not exists customer_id text references public.customers(id) on delete set null,
  add column if not exists job_id text references public.jobs(id) on delete set null,
  add column if not exists conversion_context jsonb not null default '{}'::jsonb,
  add column if not exists scope text,
  add column if not exists budget text,
  add column if not exists location_details text,
  add column if not exists enquiry_attachments jsonb not null default '[]'::jsonb;

alter table public.jobs
  add column if not exists source_lead_id text references public.leads(id) on delete set null,
  add column if not exists scope text,
  add column if not exists budget text,
  add column if not exists location_details text,
  add column if not exists notes text,
  add column if not exists enquiry_attachments jsonb not null default '[]'::jsonb,
  add column if not exists enquiry_context jsonb not null default '{}'::jsonb;

create index if not exists leads_customer_id_idx on public.leads (customer_id);
create index if not exists leads_job_id_idx on public.leads (job_id);
create index if not exists jobs_source_lead_id_idx on public.jobs (source_lead_id);
create unique index if not exists leads_job_id_unique_idx
  on public.leads (job_id)
  where job_id is not null;
create unique index if not exists jobs_source_lead_id_unique_idx
  on public.jobs (source_lead_id)
  where source_lead_id is not null;

-- Canonicalisation mirrors app.js canonicalNzPhone: remove punctuation, then
-- represent NZ international 64/0064 numbers in the local 0-prefixed form.
create or replace function public.canonical_nz_phone(p_phone text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  with digits as (
    select regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g') as value
  )
  select case
    when value = '' then null
    when value like '0064%' then '0' || substring(value from 5)
    when value like '64%' then '0' || substring(value from 3)
    else value
  end
  from digits;
$$;

revoke all on function public.canonical_nz_phone(text) from public;
grant execute on function public.canonical_nz_phone(text) to authenticated;

create or replace function public.convert_lead_to_customer(
  p_lead_id text,
  p_customer_mode text,
  p_existing_customer_id text default null,
  p_customer_contact jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
declare
  v_lead public.leads%rowtype;
  v_customer public.customers%rowtype;
  v_job public.jobs%rowtype;
  v_existing_job public.jobs%rowtype;
  v_candidate_ids text[];
  v_customer_id text;
  v_job_id text;
  v_job_number text;
  v_next_number integer;
  v_context jsonb;
  v_is_idempotent boolean := false;
  v_display_name text;
  v_company_name text;
  v_phone text;
  v_email text;
  v_address text;
  v_match_name text;
  v_match_address text;
begin
  if coalesce(public.can_manage_customer_links(), false) is not true then
    raise exception 'Only Owner/Admin or Office may convert a lead.' using errcode = '42501';
  end if;

  p_customer_contact := coalesce(p_customer_contact, '{}'::jsonb);

  -- Serialises retries and concurrent clicks for the same lead. A second
  -- caller waits for the first transaction and then receives its result.
  perform pg_advisory_xact_lock(hashtextextended('lead-conversion:' || p_lead_id, 0));

  select * into v_lead
  from public.leads
  where id = p_lead_id
  for update;
  if not found then
    raise exception 'Lead % was not found.', p_lead_id using errcode = 'P0002';
  end if;

  if v_lead.customer_id is not null and v_lead.job_id is not null then
    select * into v_customer from public.customers where id = v_lead.customer_id;
    select * into v_job from public.jobs where id = v_lead.job_id;
    if v_customer.id is not null and v_job.id is not null then
      v_is_idempotent := true;
    end if;
  end if;

  if not v_is_idempotent then
    if p_customer_mode not in ('link_existing', 'create_new') then
      raise exception 'Choose whether to link an existing customer or create a new customer.' using errcode = '22023';
    end if;

    v_display_name := case
      when p_customer_contact ? 'display_name' then nullif(trim(coalesce(p_customer_contact->>'display_name', '')), '')
      else nullif(trim(coalesce(nullif(trim(v_lead.client_name), ''), nullif(trim(v_lead.lead_name), ''))), '')
    end;
    v_phone := case
      when p_customer_contact ? 'phone' then nullif(trim(coalesce(p_customer_contact->>'phone', '')), '')
      else nullif(trim(v_lead.phone), '')
    end;
    v_email := case
      when p_customer_contact ? 'email' then nullif(trim(coalesce(p_customer_contact->>'email', '')), '')
      else nullif(trim(v_lead.email), '')
    end;
    v_address := case
      when p_customer_contact ? 'address' then nullif(trim(coalesce(p_customer_contact->>'address', '')), '')
      else nullif(trim(coalesce(nullif(trim(v_lead.location_details), ''), nullif(trim(v_lead.location), ''))), '')
    end;
    v_match_name := v_display_name;
    v_match_address := v_address;

    select coalesce(array_agg(c.id order by c.updated_at desc), '{}'::text[])
    into v_candidate_ids
    from public.customers c
    where (
      nullif(lower(trim(v_email)), '') is not null
      and nullif(lower(trim(c.email)), '') = lower(trim(v_email))
    ) or (
      public.canonical_nz_phone(v_phone) is not null
      and public.canonical_nz_phone(c.phone) = public.canonical_nz_phone(v_phone)
    ) or (
      v_match_name is not null
      and nullif(lower(trim(c.display_name)), '') = lower(trim(v_match_name))
    ) or (
      v_match_address is not null
      and nullif(lower(trim(c.address)), '') = lower(trim(v_match_address))
    );

    if p_customer_mode = 'link_existing' then
      if p_existing_customer_id is null or not (p_existing_customer_id = any(v_candidate_ids)) then
        raise exception 'Select one of the detected matching customers before linking.' using errcode = '22023';
      end if;
      select * into v_customer from public.customers where id = p_existing_customer_id for update;
      if not found then
        raise exception 'The selected customer no longer exists.' using errcode = 'P0002';
      end if;
    else
      if p_existing_customer_id is not null then
        raise exception 'A new-customer conversion cannot include an existing customer id.' using errcode = '22023';
      end if;
      v_company_name := nullif(trim(coalesce(p_customer_contact->>'company_name', '')), '');
      insert into public.customers (display_name, company_name, phone, email, address, notes)
      values (
        coalesce(v_display_name, 'Unnamed customer'),
        v_company_name,
        v_phone,
        v_email,
        v_address,
        nullif(trim(coalesce(p_customer_contact->>'customer_notes', '')), '')
      )
      returning * into v_customer;
    end if;

    v_context := coalesce(v_lead.conversion_context, '{}'::jsonb) || jsonb_build_object(
      'source_lead_id', v_lead.id,
      'lead_number', v_lead.lead_number,
      'lead_name', v_lead.lead_name,
      'source', v_lead.source,
      'scope', coalesce(p_customer_contact->>'scope', v_lead.scope),
      'budget', coalesce(p_customer_contact->>'budget', v_lead.budget),
      'location_details', coalesce(nullif(p_customer_contact->>'location_details', ''), nullif(trim(v_lead.location_details), ''), nullif(trim(v_lead.location), '')),
      'notes', coalesce(p_customer_contact->>'notes', v_lead.notes),
      'attachments', coalesce(v_lead.enquiry_attachments, '[]'::jsonb)
    );

    if v_lead.converted_job_id is not null then
      select * into v_existing_job from public.jobs where id = v_lead.converted_job_id for update;
    end if;

    if v_existing_job.id is not null then
      v_job_id := v_existing_job.id;
      update public.jobs
      set customer_id = v_customer.id,
          source_lead_id = v_lead.id,
          scope = v_context->>'scope',
          budget = v_context->>'budget',
          location_details = v_context->>'location_details',
          notes = v_context->>'notes',
          enquiry_attachments = coalesce(v_lead.enquiry_attachments, '[]'::jsonb),
          enquiry_context = v_context,
          updated_at = now()
      where id = v_existing_job.id
      returning * into v_job;
    else
      if v_lead.lead_number ~* '^CNL-[0-9]+$' then
        v_job_number := 'CN-' || substring(v_lead.lead_number from 5);
      end if;
      if v_job_number is null or exists (select 1 from public.jobs where job_number = v_job_number) then
        select coalesce(max((substring(job_number from 4))::integer), 0) + 1
        into v_next_number
        from public.jobs
        where job_number ~ '^CN-[0-9]+$';
        v_job_number := 'CN-' || lpad(v_next_number::text, 4, '0');
        while exists (select 1 from public.jobs where job_number = v_job_number) loop
          v_next_number := v_next_number + 1;
          v_job_number := 'CN-' || lpad(v_next_number::text, 4, '0');
        end loop;
      end if;
      insert into public.jobs (
        job_number, client_name, job_name, location, status, priority,
        next_action, next_action_due_date, target_install_date, customer_id,
        active, source_lead_id, scope, budget, location_details, notes,
        enquiry_attachments, enquiry_context
      )
      values (
        v_job_number,
        coalesce(v_customer.display_name, nullif(trim(v_lead.client_name), ''), nullif(trim(v_lead.lead_name), ''), ''),
        coalesce(nullif(trim(v_lead.lead_name), ''), nullif(trim(v_lead.client_name), ''), ''),
        coalesce(v_lead.location, ''),
        'job_accepted',
        v_lead.priority,
        v_lead.next_action,
        v_lead.next_action_due_date,
        null,
        v_customer.id,
        true,
        v_lead.id,
        v_context->>'scope',
        v_context->>'budget',
        v_context->>'location_details',
        v_context->>'notes',
        coalesce(v_lead.enquiry_attachments, '[]'::jsonb),
        v_context
      )
      returning * into v_job;
    end if;

    update public.leads
    set status = 'converted',
        active = false,
        converted_at = now(),
        converted_by = auth.uid(),
        customer_id = v_customer.id,
        job_id = v_job.id,
        converted_job_id = v_job.id,
        conversion_context = v_context,
        updated_at = now()
    where id = v_lead.id
    returning * into v_lead;
  end if;

  return jsonb_build_object(
    'idempotent', v_is_idempotent,
    'lead', to_jsonb(v_lead),
    'customer', to_jsonb(v_customer),
    'job', to_jsonb(v_job)
  );
end;
$$;

revoke all on function public.convert_lead_to_customer(text, text, text, jsonb) from public;
grant execute on function public.convert_lead_to_customer(text, text, text, jsonb) to authenticated;
