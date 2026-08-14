param(
  [string]$SupabaseCli = "C:\Users\ADAMAN~1\AppData\Local\Temp\cabinet-ninja-phase-1a-supabase-cli\supabase.exe",
  [string]$Container = "supabase_db_cabinet-ninja-phase-1a-audit",
  [switch]$SkipReset
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
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'workshop@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'unassigned@test.invalid', 'not-used', now(), '{}', '{}', now(), now())
on conflict (id) do nothing;
insert into public.suppliers (id, supplier_name) values ('phase-1c-supplier', 'Phase 1C supplier') on conflict (id) do nothing;
insert into public.jobs (id, job_number, client_name, job_name, location, status, active) values ('phase-1c-job', 'CN-9101', 'Existing client', 'Existing job', 'Existing location', 'active', true) on conflict (id) do nothing;
"@
Invoke-LocalSql $setup | Out-Null

$before = Invoke-LocalSql "select id || '|' || job_number from public.jobs where id = 'phase-1c-job';"
if ($before -ne "phase-1c-job|CN-9101") { throw "Phase 1C fixture did not preserve the existing job shape." }

Invoke-LocalMigration "202607240002_role_profile_foundation.sql"
Invoke-LocalSql "insert into public.staff_profiles (user_id, role, active) values ('11111111-1111-1111-1111-111111111111', 'owner_admin', true), ('22222222-2222-2222-2222-222222222222', 'workshop', true);" | Out-Null
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
and column_name in ('id','customer_number','display_name','company_name','phone','email','address','notes','active','created_at','updated_at');
"@
if ($customerColumns -ne "11") { throw "Customer foundation table is missing expected columns." }

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

$workshopRead = Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
select count(*) from public.customers;
rollback;
"@
if ($workshopRead -ne "1") { throw "An assigned internal Workshop user could not read internal customer data." }

$unassignedRead = Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';
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

Write-Output "Phase 1C upgrade test passed: customers foundation is additive, internal-only, indexed, nullable-linked, and idempotent; existing job identity and CN-#### number preserved."
