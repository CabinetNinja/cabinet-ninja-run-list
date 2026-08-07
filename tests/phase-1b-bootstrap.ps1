param(
  [string]$SupabaseCli = "C:\Users\ADAMAN~1\AppData\Local\Temp\cabinet-ninja-phase-1a-supabase-cli\supabase.exe",
  [string]$Container = "supabase_db_cabinet-ninja-phase-1a-audit"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

function Copy-LocalFile([string]$RelativePath) {
  $source = Join-Path $repoRoot $RelativePath
  $target = "/tmp/" + (Split-Path $RelativePath -Leaf)
  & docker cp $source ($Container + ":" + $target)
  if ($LASTEXITCODE -ne 0) { throw "Could not copy $RelativePath." }
  return $target
}

function Sql([string]$Query) {
  $result = & docker exec $Container psql -v ON_ERROR_STOP=1 -q -t -A -U postgres -d postgres -c $Query
  if ($LASTEXITCODE -ne 0) { throw "Local query failed." }
  return ($result -join "").Trim()
}

& $SupabaseCli db reset --local
if ($LASTEXITCODE -ne 0) { throw "Could not reset local database." }

$roleMigration = Copy-LocalFile "supabase\migrations\202607240002_role_profile_foundation.sql"
$rlsMigration = Copy-LocalFile "supabase\migrations\202607240003_replace_unrestricted_rls.sql"
$bootstrap = Copy-LocalFile "supabase\production\bootstrap-owner-admin.sql"
$recovery = Copy-LocalFile "supabase\production\emergency-recovery-restore-access.sql"

& docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -f $roleMigration
if ($LASTEXITCODE -ne 0) { throw "Role foundation failed." }
Sql "insert into public.jobs (id, job_number, client_name, job_name, location, status, active) values ('bootstrap-job', 'CN-BOOT', 'Bootstrap client', 'Bootstrap test job', 'Local only', 'active', true);" | Out-Null
# Production already has these baseline grants; the local CLI defaults to
# explicit grants, so mirror that preflight condition for the bootstrap test.
Sql "grant usage on schema public to authenticated; grant select on all tables in schema public to authenticated;" | Out-Null

# The restrictive migration must stop while the legacy policies are still in
# place when no Owner/Admin bootstrap has been performed.
$previousErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -f $rlsMigration 2>$null
$blockedExit = $LASTEXITCODE
$ErrorActionPreference = $previousErrorAction
$legacyPolicyCount = Sql "select count(*) from pg_policies where schemaname = 'public' and tablename = 'jobs' and policyname = 'authenticated users can read jobs';"
if ($blockedExit -eq 0 -or $legacyPolicyCount -ne "1") {
  throw "RLS replacement did not fail closed before bootstrap."
}

Sql @"
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '88888888-8888-8888-8888-888888888888', 'authenticated', 'authenticated', 'bootstrap-adam@test.invalid', 'not-used', now(), '{}', '{}', now(), now())
on conflict (id) do nothing;
"@ | Out-Null

& docker exec $Container psql -v ON_ERROR_STOP=1 -q -v adam_auth_user_uuid=88888888-8888-8888-8888-888888888888 -U postgres -d postgres -f $bootstrap
if ($LASTEXITCODE -ne 0) { throw "Valid Owner/Admin bootstrap failed." }

& docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -f $rlsMigration
if ($LASTEXITCODE -ne 0) { throw "RLS replacement failed after valid bootstrap." }

$role = Sql "begin; set local role authenticated; select set_config('request.jwt.claim.sub','88888888-8888-8888-8888-888888888888',true); select public.current_cabinet_ninja_role()::text; rollback;"
if ($role -notmatch "owner_admin") { throw "Bootstrapped Owner/Admin could not verify through the authenticated path." }

$previousErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& docker exec $Container psql -v ON_ERROR_STOP=1 -q -v adam_auth_user_uuid=99999999-9999-9999-9999-999999999999 -U postgres -d postgres -f $bootstrap 2>$null
$invalidExit = $LASTEXITCODE
$ErrorActionPreference = $previousErrorAction
$invalidCount = Sql "select count(*) from public.staff_profiles where user_id = '99999999-9999-9999-9999-999999999999';"
if ($invalidExit -eq 0 -or $invalidCount -ne "0") { throw "Invalid bootstrap input was not rejected without a role row." }

& docker exec $Container psql -v ON_ERROR_STOP=1 -q -v confirm_recovery=YES -U postgres -d postgres -f $recovery
if ($LASTEXITCODE -ne 0) { throw "Emergency recovery script failed locally." }
$recoveredOutput = Sql "begin; set local role authenticated; select set_config('request.jwt.claim.sub','99999999-9999-9999-9999-999999999999',true); select 1 / (case when exists (select 1 from public.jobs where id = 'bootstrap-job') then 1 else 0 end); rollback;"
if (-not $recoveredOutput.EndsWith("1")) { throw "Emergency recovery did not restore the administrator path." }

Write-Output "Bootstrap lockout-prevention test passed: pre-bootstrap STOP, valid Owner/Admin verification, invalid UUID rejection, and administrator recovery."
