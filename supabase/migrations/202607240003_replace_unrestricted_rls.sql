-- Phase 1B: replace the MVP's unrestricted authenticated-user policies.
-- No DELETE policy is created: client-side deletion is intentionally disabled.

do $$
begin
  if not exists (
    select 1
    from public.staff_profiles
    where role = 'owner_admin'
      and active = true
  ) then
    raise exception 'STOP: bootstrap an approved active Owner/Admin before restrictive RLS replacement';
  end if;
end;
$$;

do $$
declare
  entity text;
begin
  foreach entity in array array[
    'activity_history', 'categories', 'checklist_template_items',
    'checklist_template_sections', 'checklist_templates',
    'cut_part_suggestions', 'cut_pattern_revisions', 'cut_patterns',
    'cut_runs', 'items', 'job_checklist_items', 'job_checklist_sections',
    'job_checklists', 'jobs', 'leads',
    'material_template_items', 'material_templates', 'remake_requests', 'suppliers'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'authenticated users can read ' || replace(entity, '_', ' '), entity);
    execute format('drop policy if exists %I on public.%I', 'authenticated users can write ' || replace(entity, '_', ' '), entity);
  end loop;
end;
$$;

-- Owner/Admin and Office can read every current business table. Financial
-- values live only in separately protected public.job_financials; do not add
-- them to shared operational tables without a reviewed projection design.
create policy "cabinet ninja full read leads" on public.leads for select to authenticated using (public.has_cabinet_ninja_role(array['owner_admin','office']::public.cabinet_ninja_role[]));
create policy "cabinet ninja full write leads" on public.leads for insert to authenticated with check (public.has_cabinet_ninja_role(array['owner_admin','office']::public.cabinet_ninja_role[]));
create policy "cabinet ninja full update leads" on public.leads for update to authenticated using (public.has_cabinet_ninja_role(array['owner_admin','office']::public.cabinet_ninja_role[])) with check (public.has_cabinet_ninja_role(array['owner_admin','office']::public.cabinet_ninja_role[]));

do $$
declare
  entity text;
begin
  foreach entity in array array[
    'activity_history', 'categories', 'checklist_template_items',
    'checklist_template_sections', 'checklist_templates',
    'cut_part_suggestions', 'cut_pattern_revisions', 'cut_patterns',
    'cut_runs', 'items', 'job_checklist_items', 'job_checklist_sections',
    'job_checklists', 'jobs', 'material_template_items',
    'material_templates', 'remake_requests', 'suppliers'
  ] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.can_read_operational_data())', 'cabinet ninja operational read ' || entity, entity);
  end loop;
end;
$$;

-- Office may write normal business records but cannot manage security tables
-- or permanently delete any business data.
do $$
declare
  entity text;
begin
  foreach entity in array array[
    'activity_history', 'categories', 'checklist_template_items',
    'checklist_template_sections', 'checklist_templates',
    'cut_part_suggestions', 'cut_pattern_revisions', 'cut_patterns',
    'cut_runs', 'items', 'job_checklist_items', 'job_checklist_sections',
    'job_checklists', 'jobs', 'material_template_items',
    'material_templates', 'remake_requests', 'suppliers'
  ] loop
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_cabinet_ninja_role(array[''owner_admin'',''office'']::public.cabinet_ninja_role[]))', 'cabinet ninja office insert ' || entity, entity);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_cabinet_ninja_role(array[''owner_admin'',''office'']::public.cabinet_ninja_role[])) with check (public.has_cabinet_ninja_role(array[''owner_admin'',''office'']::public.cabinet_ninja_role[]))', 'cabinet ninja office update ' || entity, entity);
  end loop;
end;
$$;

-- Workshop and Install receive operational writes only. Assignment remains a
-- responsibility/filtering record; active jobs remain visible to both roles.
do $$
declare
  entity text;
begin
  foreach entity in array array[
    'activity_history', 'cut_part_suggestions', 'cut_pattern_revisions',
    'cut_patterns', 'cut_runs', 'items', 'job_checklist_items',
    'job_checklist_sections', 'job_checklists', 'jobs', 'remake_requests'
  ] loop
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_cabinet_ninja_role(array[''workshop'',''install'']::public.cabinet_ninja_role[]))', 'cabinet ninja operational insert ' || entity, entity);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_cabinet_ninja_role(array[''workshop'',''install'']::public.cabinet_ninja_role[])) with check (public.has_cabinet_ninja_role(array[''workshop'',''install'']::public.cabinet_ninja_role[]))', 'cabinet ninja operational update ' || entity, entity);
  end loop;
end;
$$;

-- CNC files have a narrower row boundary than ordinary job-file metadata.
-- This prevents Office, Install, and Read-only from even listing .nc rows;
-- the signed-URL function still performs a second path/role check.
drop policy if exists "authenticated users can read job files" on public.job_files;
drop policy if exists "authenticated users can write job files" on public.job_files;
create policy "cabinet ninja CNC file read"
on public.job_files for select to authenticated
using (
  public.can_read_operational_data()
  and (file_kind is distinct from 'nc' or public.has_cabinet_ninja_role(array['owner_admin', 'workshop']::public.cabinet_ninja_role[]))
);

create policy "cabinet ninja CNC file insert"
on public.job_files for insert to authenticated
with check (
  (file_kind is distinct from 'nc' and public.has_cabinet_ninja_role(array['owner_admin', 'office', 'workshop', 'install']::public.cabinet_ninja_role[]))
  or (file_kind = 'nc' and public.has_cabinet_ninja_role(array['owner_admin', 'workshop']::public.cabinet_ninja_role[]))
);

create policy "cabinet ninja CNC file update"
on public.job_files for update to authenticated
using (
  (file_kind is distinct from 'nc' and public.has_cabinet_ninja_role(array['owner_admin', 'office', 'workshop', 'install']::public.cabinet_ninja_role[]))
  or (file_kind = 'nc' and public.has_cabinet_ninja_role(array['owner_admin', 'workshop']::public.cabinet_ninja_role[]))
)
with check (
  (file_kind is distinct from 'nc' and public.has_cabinet_ninja_role(array['owner_admin', 'office', 'workshop', 'install']::public.cabinet_ninja_role[]))
  or (file_kind = 'nc' and public.has_cabinet_ninja_role(array['owner_admin', 'workshop']::public.cabinet_ninja_role[]))
);

-- Database privileges are reduced as a second line of defence. RLS has no
-- DELETE policy and the browser has no permanent-delete path.
grant usage on schema public to authenticated;
grant select, insert, update on all tables in schema public to authenticated;
revoke delete on all tables in schema public from authenticated;

-- The signed-URL Edge Function uses the server-only service_role only after
-- the caller's RLS-scoped session has resolved and authorised one job_files
-- record. Keep this narrow; browsers never receive this role.
grant usage on schema public to service_role;
grant select on public.job_files to service_role;
