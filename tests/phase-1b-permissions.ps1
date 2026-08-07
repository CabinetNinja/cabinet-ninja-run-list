param(
  [string]$Container = "supabase_db_cabinet-ninja-phase-1a-audit"
)

$ErrorActionPreference = "Continue"
$results = [System.Collections.Generic.List[object]]::new()

function Invoke-DatabaseSql([string]$Sql) {
  & docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -c $Sql 2>&1 | Out-Null
  return $LASTEXITCODE -eq 0
}

function Test-Policy([string]$Name, [string]$UserId, [string]$Sql, [bool]$ShouldSucceed) {
  $quotedSql = "begin; set local role authenticated; select set_config('request.jwt.claim.sub', '$UserId', true); $Sql rollback;"
  $actual = Invoke-DatabaseSql $quotedSql
  $results.Add([pscustomobject]@{ Name = $Name; Expected = $ShouldSucceed; Actual = $actual })
}

# Local synthetic fixtures only. These UUIDs and .invalid emails are not people
# or production identities. Setup runs as the local database administrator.
$setup = @"
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'owner-admin@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'office@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'workshop@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'install@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'readonly@test.invalid', 'not-used', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'unassigned@test.invalid', 'not-used', now(), '{}', '{}', now(), now())
on conflict (id) do nothing;

insert into public.staff_profiles (user_id, role, active)
values
  ('11111111-1111-1111-1111-111111111111', 'owner_admin', true),
  ('22222222-2222-2222-2222-222222222222', 'office', true),
  ('33333333-3333-3333-3333-333333333333', 'workshop', true),
  ('44444444-4444-4444-4444-444444444444', 'install', true),
  ('55555555-5555-5555-5555-555555555555', 'read_only', true)
on conflict (user_id) do update set role = excluded.role, active = true;

insert into public.suppliers (id, supplier_name) values ('phase-1b-supplier', 'Phase 1B test supplier') on conflict (id) do nothing;
insert into public.jobs (id, job_number, client_name, job_name, location, status, active) values ('phase-1b-job', 'CN-TEST', 'Test client', 'Security fixture', 'Local only', 'active', true) on conflict (id) do nothing;
insert into public.items (id, item_name, supplier_id, job_id) values ('phase-1b-item', 'Test material', 'phase-1b-supplier', 'phase-1b-job') on conflict (id) do nothing;
insert into public.job_financials (job_id, quote_reference, invoice_reference, payment_status) values ('phase-1b-job', 'QUOTE-TEST', 'INVOICE-TEST', 'unpaid') on conflict (job_id) do nothing;
insert into public.job_files (id, job_id, storage_path, file_kind, original_filename, internal_filename, file_hash, file_size, mime_type)
values ('phase-1b-job-file', 'phase-1b-job', 'jobs/phase-1b-job/existing.pdf', 'pdf', 'existing.pdf', 'existing.pdf', 'phase-1b-hash', 1, 'application/pdf')
on conflict (id) do update set storage_path = excluded.storage_path;
insert into storage.objects (bucket_id, name, owner, metadata)
values ('job-files', 'jobs/phase-1b-job/existing.pdf', '33333333-3333-3333-3333-333333333333', jsonb_build_object('mimetype', 'application/pdf'))
on conflict (bucket_id, name) do nothing;
insert into public.job_files (id, job_id, storage_path, file_kind, original_filename, internal_filename, file_hash, file_size, mime_type)
values ('phase-1b-nc-file', 'phase-1b-job', 'phase-1b-job/CN-TEST_S01.nc', 'nc', 'CN-TEST_S01.nc', 'CN-TEST_S01.nc', 'phase-1b-nc-hash', 1, 'application/octet-stream')
on conflict (id) do update set storage_path = excluded.storage_path, mime_type = excluded.mime_type;
insert into storage.objects (bucket_id, name, owner, metadata)
values ('job-files', 'phase-1b-job/CN-TEST_S01.nc', '33333333-3333-3333-3333-333333333333', jsonb_build_object('mimetype', 'application/octet-stream'))
on conflict (bucket_id, name) do nothing;
insert into public.job_files (id, job_id, storage_path, file_kind, original_filename, internal_filename, file_hash, file_size, mime_type)
values ('phase-1b-generic-file', 'phase-1b-job', 'phase-1b-job/generic.bin', 'pdf', 'generic.bin', 'generic.bin', 'phase-1b-generic-hash', 1, 'application/octet-stream')
on conflict (id) do update set storage_path = excluded.storage_path, mime_type = excluded.mime_type;
"@
if (-not (Invoke-DatabaseSql $setup)) { throw "Could not create local test fixtures." }

$owner = '11111111-1111-1111-1111-111111111111'
$office = '22222222-2222-2222-2222-222222222222'
$workshop = '33333333-3333-3333-3333-333333333333'
$install = '44444444-4444-4444-4444-444444444444'
$readOnly = '55555555-5555-5555-5555-555555555555'
$unassigned = '66666666-6666-6666-6666-666666666666'

Test-Policy 'Owner/Admin reads financial data' $owner "select 1 / (case when exists (select 1 from public.job_financials where job_id = 'phase-1b-job') then 1 else 0 end);" $true
Test-Policy 'Owner/Admin creates staff profile' $owner "insert into public.staff_profiles (user_id, role) values ('$unassigned', 'read_only');" $true
Test-Policy 'Office reads financial data' $office "select 1 / (case when exists (select 1 from public.job_financials where job_id = 'phase-1b-job') then 1 else 0 end);" $true
Test-Policy 'Office updates business data' $office "with changed as (update public.items set notes = 'office verified' where id = 'phase-1b-item' returning id) select 1 / (case when exists (select 1 from changed) then 1 else 0 end);" $true
Test-Policy 'Office cannot manage staff profiles' $office "insert into public.staff_profiles (user_id, role) values ('$unassigned', 'read_only');" $false
Test-Policy 'Workshop reads active jobs' $workshop "select 1 / (case when exists (select 1 from public.jobs where id = 'phase-1b-job') then 1 else 0 end);" $true
Test-Policy 'Workshop updates run-list material' $workshop "with changed as (update public.items set notes = 'workshop verified' where id = 'phase-1b-item' returning id) select 1 / (case when exists (select 1 from changed) then 1 else 0 end);" $true
Test-Policy 'Workshop cannot read financial data' $workshop "select 1 / (case when not exists (select 1 from public.job_financials where job_id = 'phase-1b-job') then 1 else 0 end);" $true
Test-Policy 'Workshop cannot read leads' $workshop "select 1 / (case when not exists (select 1 from public.leads) then 1 else 0 end);" $true
Test-Policy 'Workshop may authorise a private job-file path' $workshop "select 1 / (case when public.can_write_job_file_path('jobs/phase-1b-job/permission-test.pdf') then 1 else 0 end);" $true
Test-Policy 'Workshop lists authorised private job-file metadata' $workshop "select 1 / (case when exists (select 1 from storage.objects where bucket_id = 'job-files' and name = 'jobs/phase-1b-job/existing.pdf') then 1 else 0 end);" $true
Test-Policy 'Workshop uploads to an authorised private job-file path' $workshop "insert into storage.objects (bucket_id, name, owner, metadata) values ('job-files', 'jobs/phase-1b-job/upload-test.pdf', '$workshop', '{}'::jsonb);" $true
Test-Policy 'Workshop records a normal PDF file' $workshop "insert into public.job_files (id, job_id, storage_path, file_kind, original_filename, internal_filename, mime_type) values ('phase-1b-workshop-pdf', 'phase-1b-job', 'jobs/phase-1b-job/workshop.pdf', 'pdf', 'workshop.pdf', 'workshop.pdf', 'application/pdf');" $true
Test-Policy 'Owner/Admin reads CNC production file' $owner "select 1 / (case when public.can_read_job_file_path('phase-1b-job/CN-TEST_S01.nc') then 1 else 0 end);" $true
Test-Policy 'Owner/Admin uploads CNC production file' $owner "insert into storage.objects (bucket_id, name, owner, metadata) values ('job-files', 'jobs/phase-1b-job/owner-test.nc', '$owner', jsonb_build_object('mimetype', 'application/octet-stream'));" $true
Test-Policy 'Workshop reads CNC production file' $workshop "select 1 / (case when public.can_read_job_file_path('phase-1b-job/CN-TEST_S01.nc') then 1 else 0 end);" $true
Test-Policy 'Workshop uploads CNC production file' $workshop "insert into storage.objects (bucket_id, name, owner, metadata) values ('job-files', 'jobs/phase-1b-job/workshop-test.nc', '$workshop', jsonb_build_object('mimetype', 'application/octet-stream'));" $true
Test-Policy 'Install reads active jobs' $install "select 1 / (case when exists (select 1 from public.jobs where id = 'phase-1b-job') then 1 else 0 end);" $true
Test-Policy 'Install cannot read CNC production file' $install "select 1 / (case when not public.can_read_job_file_path('phase-1b-job/CN-TEST_S01.nc') then 1 else 0 end);" $true
Test-Policy 'Install cannot upload CNC production file' $install "insert into storage.objects (bucket_id, name, owner, metadata) values ('job-files', 'jobs/phase-1b-job/install-test.nc', '$install', jsonb_build_object('mimetype', 'application/octet-stream'));" $false
Test-Policy 'Install updates job/checklist operational data' $install "with changed as (update public.jobs set location = 'Local install test' where id = 'phase-1b-job' returning id) select 1 / (case when exists (select 1 from changed) then 1 else 0 end);" $true
Test-Policy 'Install records a normal PDF file' $install "insert into public.job_files (id, job_id, storage_path, file_kind, original_filename, internal_filename, mime_type) values ('phase-1b-install-pdf', 'phase-1b-job', 'jobs/phase-1b-job/install.pdf', 'pdf', 'install.pdf', 'install.pdf', 'application/pdf');" $true
Test-Policy 'Install cannot read financial data' $install "select 1 / (case when not exists (select 1 from public.job_financials where job_id = 'phase-1b-job') then 1 else 0 end);" $true
Test-Policy 'Read-only reads active jobs' $readOnly "select 1 / (case when exists (select 1 from public.jobs where id = 'phase-1b-job') then 1 else 0 end);" $true
Test-Policy 'Read-only cannot update items' $readOnly "with changed as (update public.items set notes = 'should fail' where id = 'phase-1b-item' returning id) select 1 / (case when not exists (select 1 from changed) then 1 else 0 end);" $true
Test-Policy 'Read-only cannot read financial data' $readOnly "select 1 / (case when not exists (select 1 from public.job_financials where job_id = 'phase-1b-job') then 1 else 0 end);" $true
Test-Policy 'Read-only has read-only file authorisation' $readOnly "select 1 / (case when public.can_access_job_files('phase-1b-job', false) then 1 else 0 end);" $true
Test-Policy 'Read-only cannot upload files' $readOnly "select 1 / (case when not public.can_access_job_files('phase-1b-job', true) then 1 else 0 end);" $true
Test-Policy 'Read-only lists authorised private job-file metadata' $readOnly "select 1 / (case when exists (select 1 from storage.objects where bucket_id = 'job-files' and name = 'jobs/phase-1b-job/existing.pdf') then 1 else 0 end);" $true
Test-Policy 'Read-only cannot read CNC production file' $readOnly "select 1 / (case when not public.can_read_job_file_path('phase-1b-job/CN-TEST_S01.nc') then 1 else 0 end);" $true
Test-Policy 'Read-only cannot upload a private job file' $readOnly "insert into storage.objects (bucket_id, name, owner, metadata) values ('job-files', 'jobs/phase-1b-job/read-only-test.pdf', '$readOnly', '{}'::jsonb);" $false
Test-Policy 'Unassigned user cannot read jobs' $unassigned "select 1 / (case when not exists (select 1 from public.jobs where id = 'phase-1b-job') then 1 else 0 end);" $true
Test-Policy 'Unassigned user cannot list private job files' $unassigned "select 1 / (case when not exists (select 1 from storage.objects where bucket_id = 'job-files') then 1 else 0 end);" $true
Test-Policy 'Unassigned user cannot read CNC production file' $unassigned "select 1 / (case when not public.can_read_job_file_path('phase-1b-job/CN-TEST_S01.nc') then 1 else 0 end);" $true
Test-Policy 'Office cannot read CNC production file' $office "select 1 / (case when not public.can_read_job_file_path('phase-1b-job/CN-TEST_S01.nc') then 1 else 0 end);" $true
Test-Policy 'Office cannot upload CNC production file' $office "insert into storage.objects (bucket_id, name, owner, metadata) values ('job-files', 'jobs/phase-1b-job/office-test.nc', '$office', jsonb_build_object('mimetype', 'application/octet-stream'));" $false
Test-Policy 'Workshop cannot upload generic octet-stream file' $workshop "insert into storage.objects (bucket_id, name, owner, metadata) values ('job-files', 'jobs/phase-1b-job/generic.bin', '$workshop', jsonb_build_object('mimetype', 'application/octet-stream'));" $false
Test-Policy 'Non-admin cannot permanently delete records' $office "delete from public.items where id = 'phase-1b-item';" $false
Test-Policy 'Existing legacy CNC path remains authorised for Workshop' $workshop "select 1 / (case when public.can_read_job_file_path('phase-1b-job/CN-TEST_S01.nc') then 1 else 0 end);" $true
Test-Policy 'Unrelated legacy file path is denied' $workshop "select 1 / (case when not public.can_read_job_file_path('other-job/legacy.pdf') then 1 else 0 end);" $true

$failed = @($results | Where-Object { $_.Expected -ne $_.Actual })
$results | Format-Table -AutoSize | Out-String | Write-Output
if ($failed.Count) {
  $failed | Format-Table -AutoSize | Out-String | Write-Error
  exit 1
}
Write-Output "Phase 1B permission matrix passed: $($results.Count) checks."
