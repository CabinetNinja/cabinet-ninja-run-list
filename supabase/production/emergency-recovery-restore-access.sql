-- Emergency, database-administrator-only recovery.
--
-- This deliberately restores the pre-Phase-1B authenticated access model
-- temporarily if a verified lockout occurs. It does not make Storage public.
-- Invoke only after incident approval:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v confirm_recovery=YES \
--     -f supabase/production/emergency-recovery-restore-access.sql
--
-- Follow immediately with incident review, owner verification, and a reviewed
-- re-application of least-privilege policies. Never run from the browser.

\set ON_ERROR_STOP on
\if :{?confirm_recovery}
\else
  \echo 'STOP: recovery requires -v confirm_recovery=YES.'
  select 1 / 0;
\endif
select :'confirm_recovery' = 'YES' as recovery_confirmed \gset
\if :recovery_confirmed
\else
  \echo 'STOP: recovery confirmation was not YES.'
  select 1 / 0;
\endif

begin;

do $$
declare
  entity text;
  entities text[] := array[
    'activity_history', 'categories', 'checklist_template_items',
    'checklist_template_sections', 'checklist_templates',
    'cut_part_suggestions', 'cut_pattern_revisions', 'cut_patterns',
    'cut_runs', 'items', 'job_checklist_items', 'job_checklist_sections',
    'job_checklists', 'job_files', 'jobs', 'leads',
    'material_template_items', 'material_templates', 'remake_requests',
    'suppliers', 'staff_profiles', 'job_assignments', 'job_financials'
  ];
begin
  foreach entity in array entities loop
    execute format('drop policy if exists %I on public.%I', 'emergency recovery read ' || entity, entity);
    execute format('drop policy if exists %I on public.%I', 'emergency recovery write ' || entity, entity);
    execute format('create policy %I on public.%I for select to authenticated using (true)', 'emergency recovery read ' || entity, entity);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)', 'emergency recovery write ' || entity, entity);
    execute format('grant select, insert, update, delete on public.%I to authenticated', entity);
  end loop;
end;
$$;

drop policy if exists "emergency recovery file read" on storage.objects;
drop policy if exists "emergency recovery file upload" on storage.objects;
create policy "emergency recovery file read"
on storage.objects for select to authenticated
using (bucket_id = 'job-files');
create policy "emergency recovery file upload"
on storage.objects for insert to authenticated
with check (bucket_id = 'job-files');

select pg_notify('pgrst', 'reload schema');
commit;
\echo 'EMERGENCY RECOVERY ACTIVE: verify Owner/Admin access and re-secure the project immediately.'
