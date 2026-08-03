param(
  [string]$SupabaseCli = "C:\Users\ADAMAN~1\AppData\Local\Temp\cabinet-ninja-phase-1a-supabase-cli\supabase.exe",
  [string]$Container = "supabase_db_cabinet-ninja-phase-1a-audit"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

function Invoke-LocalSql([string]$Sql) {
  & docker exec $Container psql -v ON_ERROR_STOP=1 -q -t -A -U postgres -d postgres -c $Sql
  if ($LASTEXITCODE -ne 0) { throw "Local database query failed." }
}

function Invoke-LocalMigration([string]$Name) {
  $source = Join-Path $repoRoot "supabase\migrations\$Name"
  $target = "/tmp/$Name"
  $copyTarget = $Container + ":" + $target
  & docker cp $source $copyTarget
  if ($LASTEXITCODE -ne 0) { throw "Could not copy $Name into the local database container." }
  & docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -f $target
  if ($LASTEXITCODE -ne 0) { throw "Could not apply local migration $Name." }
}

if (-not (Test-Path -LiteralPath $SupabaseCli)) {
  throw "Supabase CLI not found at $SupabaseCli. Supply -SupabaseCli with a local CLI path."
}
if (-not (docker ps --format '{{.Names}}' | Select-String -SimpleMatch $Container -Quiet)) {
  throw "The expected local Supabase database container is not running: $Container"
}

# This command explicitly targets the local project. It does not use --linked
# and must never be replaced with a remote database command.
Push-Location $repoRoot
try {
  & $SupabaseCli db reset --local
  if ($LASTEXITCODE -ne 0) { throw "Could not reset the local Supabase database." }
} finally {
  Pop-Location
}

Invoke-LocalMigration "202607240002_role_profile_foundation.sql"
Invoke-LocalMigration "202607240003_replace_unrestricted_rls.sql"

$before = Invoke-LocalSql @"
select count(*)
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'leads' and column_name in ('next_action', 'next_action_due_date', 'last_contacted_at'))
    or (table_name = 'jobs' and column_name in ('priority', 'next_action', 'next_action_due_date', 'target_install_date'))
  );
"@
if ($before.Trim() -ne "0") { throw "The production-shape local seed unexpectedly contains dashboard drift fields." }

Invoke-LocalMigration "202607240004_dashboard_schema_drift_repair.sql"

$after = Invoke-LocalSql @"
select count(*)
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'leads' and column_name in ('next_action', 'next_action_due_date', 'last_contacted_at'))
    or (table_name = 'jobs' and column_name in ('priority', 'next_action', 'next_action_due_date', 'target_install_date'))
  );
"@
if ($after.Trim() -ne "7") { throw "Dashboard schema repair did not create all seven verified fields." }

$indexCount = Invoke-LocalSql @"
select count(*)
from pg_indexes
where schemaname = 'public'
  and indexname in ('leads_next_action_due_idx', 'jobs_next_action_due_idx', 'jobs_target_install_date_idx');
"@
if ($indexCount.Trim() -ne "3") { throw "Dashboard schema repair did not create all three indexes." }

Invoke-LocalMigration "202607240005_private_job_files.sql"
Invoke-LocalSql "select pg_notify('pgrst', 'reload schema');" | Out-Null

& (Join-Path $PSScriptRoot "phase-1b-permissions.ps1") -Container $Container
if ($LASTEXITCODE -ne 0) { throw "Phase 1B local permission matrix failed." }

& (Join-Path $PSScriptRoot "job-file-url-local.ps1") -SupabaseCli $SupabaseCli -Container $Container
if ($LASTEXITCODE -ne 0) { throw "Phase 1B local Edge Function checks failed." }

Write-Output "Phase 1B local migration and permission checks passed."
