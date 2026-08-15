param(
  [string]$SupabaseCli = "C:\Users\ADAMAN~1\AppData\Local\Temp\cabinet-ninja-phase-1a-supabase-cli\supabase.exe",
  [string]$Container = "supabase_db_cabinet-ninja-phase-1a-audit",
  [switch]$SkipReset
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

function Invoke-LocalSql([string]$Sql) {
  $value = & docker exec $Container psql -v ON_ERROR_STOP=1 -q -t -A -U postgres -d postgres -c $Sql 2>&1
  $exitCode = $LASTEXITCODE
  $text = ($value | ForEach-Object { $_.ToString() }) -join "`n"
  if ($exitCode -ne 0 -or $text -match '(?m)^ERROR:') { throw "Local database query failed: $text" }
  return $text.Trim()
}

function Invoke-LocalMigration([string]$Name) {
  $source = Join-Path $repoRoot "supabase\migrations\$Name"
  $target = "/tmp/$Name"
  & docker cp $source ($Container + ":" + $target)
  if ($LASTEXITCODE -ne 0) { throw "Could not copy $Name into the local database container." }
  & docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -f $target
  if ($LASTEXITCODE -ne 0) { throw "Could not apply local migration $Name." }
}

if (-not $SkipReset) {
  Push-Location $repoRoot
  try {
    & $SupabaseCli db reset --local
    if ($LASTEXITCODE -ne 0) { throw "Could not reset the local database." }
  } finally {
    Pop-Location
  }
}

$setup = @"
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'owner-admin@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'office@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'workshop@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'install@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'read-only@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'unassigned@test.invalid', 'not-used', now(), '{}', '{}', now(), now())
on conflict (id) do nothing;
insert into public.suppliers (id, supplier_name) values ('phase-1c-supplier', 'Phase 1C supplier') on conflict (id) do nothing;
insert into public.jobs (id, job_number, client_name, job_name, location, status, active) values ('phase-1c-job', 'CN-9101', 'Existing client', 'Existing job', 'Existing location', 'active', true) on conflict (id) do nothing;
"@
Invoke-LocalSql $setup | Out-Null

$before = Invoke-LocalSql "select id || '|' || job_number from public.jobs where id = 'phase-1c-job';"
if ($before -ne "phase-1c-job|CN-9101") { throw "Phase 1C fixture did not preserve the existing job shape." }

Invoke-LocalMigration "202607240002_role_profile_foundation.sql"
Invoke-LocalSql "insert into public.staff_profiles (user_id, role, active) values ('11111111-1111-1111-1111-111111111111', 'owner_admin', true), ('22222222-2222-2222-2222-222222222222', 'office', true), ('33333333-3333-3333-3333-333333333333', 'workshop', true), ('44444444-4444-4444-4444-444444444444', 'install', true), ('55555555-5555-5555-5555-555555555555', 'read_only', true);" | Out-Null
Invoke-LocalMigration "202607240003_replace_unrestricted_rls.sql"
Invoke-LocalMigration "202607240004_dashboard_schema_drift_repair.sql"
Invoke-LocalMigration "202607240005_private_job_files.sql"
Invoke-LocalMigration "202608140001_phase_1c_customer_foundation.sql"

# Re-run the Phase 1C migration to prove idempotency.
Invoke-LocalMigration "202608140001_phase_1c_customer_foundation.sql"

$after = Invoke-LocalSql "select id || '|' || job_number from public.jobs where id = 'phase-1c-job';"
if ($after -ne $before) { throw "Phase 1C changed an existing job ID or CN-#### number." }

$existingCustomerLink = Invoke-LocalSql "select coalesce(customer_id, '<null>') from public.jobs where id = 'phase-1c-job';"
if ($existingCustomerLink -ne "<null>") { throw "Phase 1C unexpectedly backfilled an existing job customer link." }

$customerColumns = Invoke-LocalSql @"
select count(*) from information_schema.columns
where table_schema = 'public' and table_name = 'customers'
and column_name in ('id','customer_number','display_name','company_name','phone','email','address','notes','active','created_at','updated_at','created_by','updated_by');
"@
if ($customerColumns -ne "13") { throw "Customer foundation table is missing expected columns." }

$customerIdNullable = Invoke-LocalSql "select is_nullable from information_schema.columns where table_schema = 'public' and table_name = 'jobs' and column_name = 'customer_id';"
if ($customerIdNullable -ne "YES") { throw "jobs.customer_id is not nullable." }

$indexCount = Invoke-LocalSql "select count(*) from pg_indexes where schemaname = 'public' and indexname in ('customers_customer_number_unique_idx','customers_display_name_idx','jobs_customer_id_idx');"
if ($indexCount -ne "3") { throw "Phase 1C did not leave exactly three intended indexes." }

$rlsEnabled = Invoke-LocalSql "select relrowsecurity from pg_class where oid = 'public.customers'::regclass;"
if ($rlsEnabled -ne "t") { throw "Customers RLS is not enabled." }

$policyCount = Invoke-LocalSql "select count(*) from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname in ('internal staff can read customers','owner and office create customers','owner and office update customers');"
if ($policyCount -ne "3") { throw "Phase 1C customer policy set is incomplete or duplicated." }

$deletePolicyCount = Invoke-LocalSql "select count(*) from pg_policies where schemaname = 'public' and tablename = 'customers' and cmd = 'DELETE';"
if ($deletePolicyCount -ne "0") { throw "Customers unexpectedly has a DELETE policy." }

$anonSelect = Invoke-LocalSql "select has_table_privilege('anon', 'public.customers', 'select');"
if ($anonSelect -ne "f") { throw "Unauthenticated customer table privilege is not blocked." }

$customerIdFk = Invoke-LocalSql "select count(*) from pg_constraint where conrelid = 'public.jobs'::regclass and conname like '%customer_id%';"
if ($customerIdFk -ne "1") { throw "jobs.customer_id foreign key is missing." }

$ownerInsert = @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
insert into public.customers (id, customer_number, display_name) values ('phase-1c-customer', 'CUST-0001', 'Phase 1C customer');
commit;
"@
Invoke-LocalSql $ownerInsert | Out-Null

$ownerAudit = Invoke-LocalSql "select created_by::text || '|' || updated_by::text from public.customers where id = 'phase-1c-customer';"
if ($ownerAudit -ne "11111111-1111-1111-1111-111111111111|11111111-1111-1111-1111-111111111111") { throw "Customer audit fields were not populated from the authenticated user." }

$duplicateRejected = $false
try {
  Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
insert into public.customers (id, customer_number, display_name) values ('phase-1c-duplicate', 'CUST-0001', 'Duplicate reference');
rollback;
"@ | Out-Null
} catch {
  $duplicateRejected = $true
}
if (-not $duplicateRejected) { throw "Duplicate non-empty customer references were accepted." }

$ownerUpdate = @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
update public.customers set display_name = 'Phase 1C edited customer' where id = 'phase-1c-customer';
select display_name from public.customers where id = 'phase-1c-customer';
rollback;
"@
$editedCustomer = Invoke-LocalSql $ownerUpdate
if ($editedCustomer -ne "Phase 1C edited customer") { throw "An authorised internal user could not edit a customer." }

$workshopRead = Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';
select count(*) from public.customers;
rollback;
"@
if ($workshopRead -ne "1") { throw "An assigned internal Workshop user could not read internal customer data." }

Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
insert into public.customers (id, customer_number, display_name) values ('phase-1c-other-customer', 'CUST-0002', 'Phase 1C other customer');
commit;
"@ | Out-Null

$unassignedRead = Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '66666666-6666-6666-6666-666666666666';
select count(*) from public.customers;
rollback;
"@
if ($unassignedRead -ne "0") { throw "An unassigned authenticated user could read customer data." }

$ownerLink = @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
update public.jobs set customer_id = 'phase-1c-customer' where id = 'phase-1c-job';
select coalesce(customer_id, '<null>') from public.jobs where id = 'phase-1c-job';
rollback;
"@
$linkedCustomer = Invoke-LocalSql $ownerLink
if ($linkedCustomer -ne "phase-1c-customer") { throw "An authorised internal user could not link a customer to an existing job." }

$officeLink = Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
update public.jobs set customer_id = 'phase-1c-customer' where id = 'phase-1c-job';
select coalesce(customer_id, '<null>') from public.jobs where id = 'phase-1c-job';
rollback;
"@
if ($officeLink -ne "phase-1c-customer") { throw "Office could not write a job customer link." }

$managerClear = Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
update public.jobs set customer_id = 'phase-1c-customer' where id = 'phase-1c-job';
select coalesce(customer_id, '<null>') from public.jobs where id = 'phase-1c-job';
rollback;
"@
if ($managerClear -ne "phase-1c-customer") { throw "Owner/Admin could not write a job customer link." }

$ownerLinkCommit = @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
update public.jobs set customer_id = 'phase-1c-customer' where id = 'phase-1c-job';
commit;
"@
Invoke-LocalSql $ownerLinkCommit | Out-Null

$officeClear = Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
update public.jobs set customer_id = null where id = 'phase-1c-job';
select coalesce(customer_id, '<null>') from public.jobs where id = 'phase-1c-job';
rollback;
"@
if ($officeClear -ne "<null>") { throw "Office could not clear a job customer link." }

function Assert-RoleCannotChangeCustomerLink([string]$RoleLabel, [string]$UserId) {
  foreach ($CustomerValue in @("null", "'phase-1c-other-customer'")) {
    $beforeLink = Invoke-LocalSql "select coalesce(customer_id, '<null>') from public.jobs where id = 'phase-1c-job';"
    $writeResult = $null
    $errorMessage = $null
    try {
      $writeResult = Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '$UserId';
with changed as (
  update public.jobs set customer_id = $CustomerValue where id = 'phase-1c-job' returning id
)
select count(*) from changed;
rollback;
"@
    } catch {
      $errorMessage = $_.Exception.Message
    }
    if ($errorMessage) {
      if ($errorMessage -notmatch 'Only Owner/Admin or Office may change a job customer link') {
        throw "$RoleLabel customer-link write failed for an unexpected reason: $errorMessage"
      }
    } elseif ($RoleLabel -in @('Workshop', 'Install')) {
      throw "$RoleLabel customer-link write did not reach the customer-link boundary."
    } elseif ($writeResult -ne '0') {
      throw "$RoleLabel was able to change jobs.customer_id to $CustomerValue."
    }
    $afterLink = Invoke-LocalSql "select coalesce(customer_id, '<null>') from public.jobs where id = 'phase-1c-job';"
    if ($afterLink -ne $beforeLink) { throw "$RoleLabel customer-link rejection changed jobs.customer_id." }
  }
}

Assert-RoleCannotChangeCustomerLink "Workshop" "33333333-3333-3333-3333-333333333333"
Assert-RoleCannotChangeCustomerLink "Install" "44444444-4444-4444-4444-444444444444"
Assert-RoleCannotChangeCustomerLink "Read-only" "55555555-5555-5555-5555-555555555555"
Assert-RoleCannotChangeCustomerLink "Unassigned" "66666666-6666-6666-6666-666666666666"

$anonJobUpdate = Invoke-LocalSql "select has_table_privilege('anon', 'public.jobs', 'update');"
if ($anonJobUpdate -ne "f") { throw "Anonymous users retain update privilege on jobs." }

$ownerClear = Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
update public.jobs set customer_id = null where id = 'phase-1c-job';
select coalesce(customer_id, '<null>') from public.jobs where id = 'phase-1c-job';
commit;
"@
if ($ownerClear -ne "<null>") { throw "Owner/Admin could not clear a job customer link." }

Write-Output "Phase 1C upgrade test passed: additive customer foundation, manual-reference collision guard, authenticated audit fields, nullable link, role-bound linking, idempotent rerun, and existing job identity/CN-#### preservation verified."
