-- Phase 1C: internal customer foundation.
-- Additive only: existing jobs, IDs, and CN-#### numbers are preserved.

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

do $$
begin
  create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_staff_updated_at();
exception
  when duplicate_object then null;
end
$$;

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
