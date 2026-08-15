-- Phase 1C: internal customer foundation.
-- Additive only: existing jobs, IDs, CN-#### numbers, and files are preserved.
-- UUID is the customer identity. Automatic customer-number allocation is deferred;
-- customer_number is an optional manual reference with a unique non-empty value.

create table if not exists public.customers (
  id text primary key default gen_random_uuid()::text,
  customer_number text not null default '',
  display_name text not null default '',
  company_name text,
  phone text,
  email text,
  address text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.jobs
  add column if not exists customer_id text references public.customers(id) on delete set null;

create unique index if not exists customers_customer_number_unique_idx
  on public.customers (customer_number)
  where customer_number <> '';

create index if not exists customers_display_name_idx
  on public.customers (lower(display_name))
  where active = true;

create index if not exists jobs_customer_id_idx
  on public.jobs (customer_id);

create or replace function public.can_manage_customer_links()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select public.has_cabinet_ninja_role(array['owner_admin', 'office']::public.cabinet_ninja_role[]);
$$;

revoke all on function public.can_manage_customer_links() from public;
grant execute on function public.can_manage_customer_links() to authenticated;

create or replace function public.set_customer_audit_fields()
returns trigger
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
begin
  new.updated_at = now();
  if auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.created_by = auth.uid();
    elsif tg_op = 'UPDATE' then
      new.created_by = old.created_by;
    end if;
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before insert or update on public.customers
for each row execute function public.set_customer_audit_fields();

create or replace function public.enforce_customer_job_link_boundary()
returns trigger
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
begin
  if (tg_op = 'INSERT' and new.customer_id is not null)
     or (tg_op = 'UPDATE' and new.customer_id is distinct from old.customer_id) then
    if not public.can_manage_customer_links() then
      raise exception 'Only Owner/Admin or Office may change a job customer link.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_customer_link_boundary on public.jobs;
create trigger jobs_customer_link_boundary
before insert or update on public.jobs
for each row execute function public.enforce_customer_job_link_boundary();

alter table public.customers enable row level security;

revoke all on public.customers from anon;
revoke all on public.customers from public;
grant select on public.customers to authenticated;
grant insert, update on public.customers to authenticated;

drop policy if exists "internal staff can read customers" on public.customers;
create policy "internal staff can read customers"
on public.customers for select to authenticated
using (public.can_read_operational_data());

drop policy if exists "owner and office create customers" on public.customers;
create policy "owner and office create customers"
on public.customers for insert to authenticated
with check (public.has_cabinet_ninja_role(array['owner_admin', 'office']::public.cabinet_ninja_role[]));

drop policy if exists "owner and office update customers" on public.customers;
create policy "owner and office update customers"
on public.customers for update to authenticated
using (public.has_cabinet_ninja_role(array['owner_admin', 'office']::public.cabinet_ninja_role[]))
with check (public.has_cabinet_ninja_role(array['owner_admin', 'office']::public.cabinet_ninja_role[]));
