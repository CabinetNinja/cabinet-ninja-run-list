-- Production bootstrap guard for the first Cabinet Ninja Owner/Admin.
--
-- Invoke only with an existing Auth UUID supplied out of band:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -v adam_auth_user_uuid="$ADAM_AUTH_USER_UUID" \
--     -f supabase/production/bootstrap-owner-admin.sql
--
-- This script does not drop or replace any policy. Run it and verify its
-- success before applying the restrictive RLS migration.

\set ON_ERROR_STOP on
\if :{?adam_auth_user_uuid}
\else
  \echo 'STOP: supply -v adam_auth_user_uuid=<existing Adam auth.users UUID>.'
  select 1 / 0;
\endif

begin;

select :'adam_auth_user_uuid'::uuid as adam_uuid \gset
select exists (select 1 from auth.users where id = :'adam_uuid') as auth_user_exists \gset
\if :auth_user_exists
\else
  \echo 'STOP: supplied UUID does not exist in auth.users. No role was assigned.'
  select 1 / 0;
\endif

insert into public.staff_profiles (user_id, role, active, created_by, notes)
values (
  :'adam_uuid',
  'owner_admin',
  true,
  :'adam_uuid',
  'Initial Owner/Admin bootstrap; identity verified outside the database.'
)
on conflict (user_id) do update
set role = 'owner_admin',
    active = true,
    created_by = excluded.created_by,
    notes = excluded.notes;

-- Verify through the same authenticated role path that the application uses.
set local role authenticated;
select set_config('request.jwt.claim.sub', :'adam_uuid', true);
select public.current_cabinet_ninja_role() = 'owner_admin' as role_verified \gset
\if :role_verified
\else
  \echo 'STOP: Owner/Admin role verification failed; transaction will roll back.'
  select 1 / 0;
\endif

-- These statements must execute successfully before restrictive policies are
-- applied. Counts may be zero in a new project; a denied query is not allowed.
select count(*) from public.jobs;
select count(*) from public.items;
select count(*) from public.job_files;

commit;
\echo 'GO: Adam Owner/Admin bootstrap and authenticated business-record checks passed.'
