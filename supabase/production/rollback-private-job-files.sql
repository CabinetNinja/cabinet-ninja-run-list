-- Explicit pre/post-cutover Storage rollback. This does not delete or move
-- objects. It restores the Phase 1A public bucket behavior and legacy object
-- policies only after a supervised incident decision.
--
-- psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v confirm_storage_rollback=YES \
--   -f supabase/production/rollback-private-job-files.sql

\set ON_ERROR_STOP on
\if :{?confirm_storage_rollback}
\else
  \echo 'STOP: supply -v confirm_storage_rollback=YES.'
  select 1 / 0;
\endif
select :'confirm_storage_rollback' = 'YES' as rollback_confirmed \gset
\if :rollback_confirmed
\else
  \echo 'STOP: Storage rollback confirmation was not YES.'
  select 1 / 0;
\endif

begin;

update storage.buckets
set public = true,
    file_size_limit = null,
    allowed_mime_types = null
where id = 'job-files';

drop policy if exists "cabinet ninja private job file read" on storage.objects;
drop policy if exists "cabinet ninja private job file upload" on storage.objects;
drop policy if exists "authenticated users can read job files" on storage.objects;
drop policy if exists "authenticated users can upload job files" on storage.objects;
create policy "authenticated users can read job files"
on storage.objects for select to authenticated
using (bucket_id = 'job-files');
create policy "authenticated users can upload job files"
on storage.objects for insert to authenticated
with check (bucket_id = 'job-files');

select pg_notify('pgrst', 'reload schema');
commit;
\echo 'Storage rollback complete: existing objects were not moved or deleted.'
