param(
  [string]$SupabaseCli = "C:\Users\ADAMAN~1\AppData\Local\Temp\cabinet-ninja-phase-1a-supabase-cli\supabase.exe",
  [string]$Container = "supabase_db_cabinet-ninja-phase-1a-audit"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

function Invoke-LocalSql([string]$Sql) {
  $value = & docker exec $Container psql -v ON_ERROR_STOP=1 -q -t -A -U postgres -d postgres -c $Sql
  if ($LASTEXITCODE -ne 0) { throw "Local database query failed." }
  return ($value -join "").Trim()
}

function Invoke-LocalMigration([string]$Name) {
  $source = Join-Path $repoRoot "supabase\migrations\$Name"
  $target = "/tmp/$Name"
  & docker cp $source ($Container + ":" + $target)
  if ($LASTEXITCODE -ne 0) { throw "Could not copy $Name into the local database container." }
  & docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -f $target
  if ($LASTEXITCODE -ne 0) { throw "Could not apply local migration $Name." }
}

Push-Location $repoRoot
try {
  & $SupabaseCli db reset --local
  if ($LASTEXITCODE -ne 0) { throw "Could not reset the local database." }
} finally {
  Pop-Location
}

# Simulate existing production records before the Phase 1B migrations.
$setup = @"
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '77777777-7777-7777-7777-777777777777', 'authenticated', 'authenticated', 'existing-user@test.invalid', 'not-used', now(), '{}', '{}', now(), now())
on conflict (id) do nothing;
insert into public.suppliers (id, supplier_name) values ('upgrade-supplier', 'Upgrade supplier') on conflict (id) do nothing;
insert into public.jobs (id, job_number, client_name, job_name, location, status, active) values ('upgrade-job', 'CN-8801', 'Upgrade client', 'Existing job', 'Existing location', 'active', true) on conflict (id) do nothing;
insert into public.leads (id, lead_number, lead_name, client_name, location, status, active) values ('upgrade-lead', 'CNL-8801', 'Existing lead', 'Upgrade client', 'Existing location', 'new_lead', true) on conflict (id) do nothing;
insert into public.items (id, item_name, supplier_id, job_id, status) values ('upgrade-item', 'Existing item', 'upgrade-supplier', 'upgrade-job', 'needed') on conflict (id) do nothing;
insert into public.job_files (id, job_id, storage_path, file_kind, original_filename, internal_filename, file_hash, file_size, mime_type)
values ('upgrade-file', 'upgrade-job', 'CN-8801/legacy-cut-sheet.pdf', 'pdf', 'legacy-cut-sheet.pdf', 'legacy-cut-sheet.pdf', 'upgrade-hash', 12, 'application/pdf')
on conflict (id) do nothing;
"@
Invoke-LocalSql $setup | Out-Null

$before = Invoke-LocalSql @"
select j.id || '|' || j.job_number || '|' || l.id || '|' || l.lead_number || '|' || i.id || '|' || f.id || '|' || f.storage_path
from public.jobs j
join public.leads l on l.id = 'upgrade-lead'
join public.items i on i.id = 'upgrade-item'
join public.job_files f on f.id = 'upgrade-file'
where j.id = 'upgrade-job';
"@
if ($before -ne "upgrade-job|CN-8801|upgrade-lead|CNL-8801|upgrade-item|upgrade-file|CN-8801/legacy-cut-sheet.pdf") {
  throw "Upgrade fixture did not have the expected production-shaped identity."
}

Invoke-LocalMigration "202607240002_role_profile_foundation.sql"
Invoke-LocalSql "insert into public.staff_profiles (user_id, role, active, created_by, notes) values ('77777777-7777-7777-7777-777777777777', 'owner_admin', true, '77777777-7777-7777-7777-777777777777', 'Explicit local bootstrap fixture');" | Out-Null
Invoke-LocalMigration "202607240003_replace_unrestricted_rls.sql"
Invoke-LocalMigration "202607240004_dashboard_schema_drift_repair.sql"
Invoke-LocalMigration "202607240005_private_job_files.sql"

# Re-run only the migrations explicitly designed to be idempotent.
Invoke-LocalMigration "202607240004_dashboard_schema_drift_repair.sql"
Invoke-LocalMigration "202607240005_private_job_files.sql"

$after = Invoke-LocalSql @"
select j.id || '|' || j.job_number || '|' || l.id || '|' || l.lead_number || '|' || i.id || '|' || f.id || '|' || f.storage_path
from public.jobs j
join public.leads l on l.id = 'upgrade-lead'
join public.items i on i.id = 'upgrade-item'
join public.job_files f on f.id = 'upgrade-file'
where j.id = 'upgrade-job';
"@
if ($after -ne $before) { throw "Upgrade changed an existing ID, number, or file path." }

$staffCount = Invoke-LocalSql "select count(*) from public.staff_profiles;"
if ($staffCount -ne "1") { throw "Unexpected staff profile count after explicit bootstrap." }
$unassignedRoleCount = Invoke-LocalSql "select count(*) from public.staff_profiles where user_id <> '77777777-7777-7777-7777-777777777777';"
if ($unassignedRoleCount -ne "0") { throw "Existing Auth users were assigned roles automatically." }

$dashboardCount = Invoke-LocalSql @"
select count(*) from information_schema.columns where table_schema = 'public'
and ((table_name = 'leads' and column_name in ('next_action','next_action_due_date','last_contacted_at'))
or (table_name = 'jobs' and column_name in ('priority','next_action','next_action_due_date','target_install_date')));
"@
if ($dashboardCount -ne "7") { throw "Dashboard drift repair did not produce exactly seven fields." }

$indexCount = Invoke-LocalSql "select count(*) from pg_indexes where schemaname = 'public' and indexname in ('leads_next_action_due_idx','jobs_next_action_due_idx','jobs_target_install_date_idx');"
if ($indexCount -ne "3") { throw "Dashboard drift repair did not produce exactly three indexes." }

$storagePolicyCount = Invoke-LocalSql "select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname in ('cabinet ninja private job file read','cabinet ninja private job file upload');"
if ($storagePolicyCount -ne "2") { throw "Re-running private Storage migration did not leave exactly two intended policies." }

$bucket = Invoke-LocalSql "select public::text || '|' || file_size_limit::text from storage.buckets where id = 'job-files';"
if (-not $bucket.StartsWith("false|52428800")) { throw "Private bucket settings are not stable after re-running the migration." }

Write-Output "Phase 1B upgrade test passed: existing identities/data preserved, no roles auto-assigned, drift repaired once, idempotent steps stable."
