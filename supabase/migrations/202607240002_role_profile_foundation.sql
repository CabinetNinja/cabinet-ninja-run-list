-- Phase 1B: internal staff roles, responsibility records, and safe RLS helpers.
-- This migration is additive and does not assign any production user.

create type public.cabinet_ninja_role as enum (
  'owner_admin',
  'office',
  'workshop',
  'install',
  'read_only'
);

create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  role public.cabinet_ninja_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  notes text
);

create table public.job_assignments (
  id text primary key default gen_random_uuid()::text,
  job_id text not null references public.jobs(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  responsibility public.cabinet_ninja_role not null,
  active boolean not null default true,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id) on delete set null,
  notes text,
  unique (job_id, user_id, responsibility)
);

-- Financial/commercial records are deliberately separated from operational
-- rows. No existing production value is moved in this foundation migration.
create table public.job_financials (
  job_id text primary key references public.jobs(id) on delete restrict,
  quote_reference text,
  invoice_reference text,
  payment_status text,
  commercial_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index job_assignments_job_active_idx on public.job_assignments (job_id, active);
create index job_assignments_user_active_idx on public.job_assignments (user_id, active);

alter table public.checklist_template_items
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id) on delete set null;

alter table public.job_files
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id) on delete set null,
  add column if not exists archived_reason text;

create or replace function public.set_staff_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger staff_profiles_set_updated_at
before update on public.staff_profiles
for each row execute function public.set_staff_updated_at();

create trigger job_financials_set_updated_at
before update on public.job_financials
for each row execute function public.set_staff_updated_at();

-- Security-definer helpers read staff_profiles without recursive RLS checks.
-- They use auth.uid(), fixed search paths, and no dynamic/user-supplied SQL.
create or replace function public.current_cabinet_ninja_role()
returns public.cabinet_ninja_role
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select role
  from public.staff_profiles
  where user_id = auth.uid()
    and active = true
  limit 1;
$$;

create or replace function public.has_cabinet_ninja_role(allowed public.cabinet_ninja_role[])
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select public.current_cabinet_ninja_role() = any(allowed);
$$;

create or replace function public.is_owner_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select public.has_cabinet_ninja_role(array['owner_admin']::public.cabinet_ninja_role[]);
$$;

create or replace function public.can_read_operational_data()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select public.has_cabinet_ninja_role(array[
    'owner_admin', 'office', 'workshop', 'install', 'read_only'
  ]::public.cabinet_ninja_role[]);
$$;

create or replace function public.can_write_operational_data()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select public.has_cabinet_ninja_role(array[
    'owner_admin', 'office', 'workshop', 'install'
  ]::public.cabinet_ninja_role[]);
$$;

create or replace function public.can_access_job_files(target_job_id text, write_access boolean default false)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select case
    when public.current_cabinet_ninja_role() in ('owner_admin', 'office') then true
    when public.current_cabinet_ninja_role() in ('workshop', 'install') then
      exists (select 1 from public.jobs where id = target_job_id and active = true)
    when not write_access and public.current_cabinet_ninja_role() = 'read_only' then
      exists (select 1 from public.jobs where id = target_job_id and active = true)
    else false
  end;
$$;

create or replace function public.job_id_from_storage_path(object_name text)
returns text
language sql
immutable
security invoker
set search_path = storage, pg_temp
as $$
  select case
    when (storage.foldername(object_name))[1] = 'jobs'
      then (storage.foldername(object_name))[2]
    when coalesce(array_length(storage.foldername(object_name), 1), 0) >= 1
      then (storage.foldername(object_name))[1]
    else null
  end;
$$;

-- File access is path- and role-aware. The production .nc files use the
-- original <job-id>/<filename> path shape, while new uploads use
-- jobs/<job-id>/<filename>; both remain valid without moving objects.
create or replace function public.can_access_job_file_path(object_name text, write_access boolean default false)
returns boolean
language sql
stable
security definer
set search_path = public, auth, storage, pg_temp
as $$
  select case
    when lower(storage.extension(object_name)) = 'nc' then
      public.has_cabinet_ninja_role(array['owner_admin', 'workshop']::public.cabinet_ninja_role[])
      and public.can_access_job_files(public.job_id_from_storage_path(object_name), write_access)
    else public.can_access_job_files(public.job_id_from_storage_path(object_name), write_access)
  end;
$$;

create or replace function public.can_read_job_file_path(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, auth, storage, pg_temp
as $$
  select public.can_access_job_file_path(object_name, false);
$$;

create or replace function public.can_write_job_file_path(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, auth, storage, pg_temp
as $$
  select public.can_access_job_file_path(object_name, true);
$$;

revoke all on function public.current_cabinet_ninja_role() from public;
revoke all on function public.has_cabinet_ninja_role(public.cabinet_ninja_role[]) from public;
revoke all on function public.is_owner_admin() from public;
revoke all on function public.can_read_operational_data() from public;
revoke all on function public.can_write_operational_data() from public;
revoke all on function public.can_access_job_files(text, boolean) from public;
revoke all on function public.can_access_job_file_path(text, boolean) from public;
revoke all on function public.can_read_job_file_path(text) from public;
revoke all on function public.can_write_job_file_path(text) from public;

grant execute on function public.current_cabinet_ninja_role() to authenticated;
grant execute on function public.has_cabinet_ninja_role(public.cabinet_ninja_role[]) to authenticated;
grant execute on function public.is_owner_admin() to authenticated;
grant execute on function public.can_read_operational_data() to authenticated;
grant execute on function public.can_write_operational_data() to authenticated;
grant execute on function public.can_access_job_files(text, boolean) to authenticated;
grant execute on function public.can_access_job_file_path(text, boolean) to authenticated;
grant execute on function public.can_read_job_file_path(text) to authenticated;
grant execute on function public.can_write_job_file_path(text) to authenticated;

alter table public.staff_profiles enable row level security;
alter table public.job_assignments enable row level security;
alter table public.job_financials enable row level security;

create policy "staff can read own profile"
on public.staff_profiles for select to authenticated
using (user_id = auth.uid() or public.is_owner_admin());

create policy "owner admin manages staff profiles"
on public.staff_profiles for all to authenticated
using (public.is_owner_admin()) with check (public.is_owner_admin());

create policy "staff can read relevant assignments"
on public.job_assignments for select to authenticated
using (user_id = auth.uid() or public.is_owner_admin() or public.current_cabinet_ninja_role() = 'office');

create policy "owner and office manage assignments"
on public.job_assignments for insert to authenticated
with check (public.is_owner_admin() or public.current_cabinet_ninja_role() = 'office');

create policy "owner and office update assignments"
on public.job_assignments for update to authenticated
using (public.is_owner_admin() or public.current_cabinet_ninja_role() = 'office')
with check (public.is_owner_admin() or public.current_cabinet_ninja_role() = 'office');

create policy "owner and office read job financials"
on public.job_financials for select to authenticated
using (public.has_cabinet_ninja_role(array['owner_admin', 'office']::public.cabinet_ninja_role[]));

create policy "owner and office insert job financials"
on public.job_financials for insert to authenticated
with check (public.has_cabinet_ninja_role(array['owner_admin', 'office']::public.cabinet_ninja_role[]));

create policy "owner and office update job financials"
on public.job_financials for update to authenticated
using (public.has_cabinet_ninja_role(array['owner_admin', 'office']::public.cabinet_ninja_role[]))
with check (public.has_cabinet_ninja_role(array['owner_admin', 'office']::public.cabinet_ninja_role[]));
