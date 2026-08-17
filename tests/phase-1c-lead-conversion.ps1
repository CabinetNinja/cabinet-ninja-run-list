param(
  [string]$SupabaseCli = "C:\Users\ADAMAN~1\AppData\Local\Temp\cabinet-ninja-phase-1a-supabase-cli\supabase.exe",
  [string]$Container = "supabase_db_cabinet-ninja-phase-1a-audit"
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

Invoke-LocalMigration "202608170001_lead_customer_conversion.sql"
Invoke-LocalMigration "202608170001_lead_customer_conversion.sql"

$leadColumnCount = Invoke-LocalSql @"
select count(*)
from information_schema.columns
where table_schema = 'public' and table_name = 'leads'
and column_name in ('converted_at','converted_by','customer_id','job_id','conversion_context','scope','budget','location_details','enquiry_attachments');
"@
if ($leadColumnCount -ne "9") { throw "Lead conversion columns are incomplete or duplicated." }

$jobColumnCount = Invoke-LocalSql @"
select count(*)
from information_schema.columns
where table_schema = 'public' and table_name = 'jobs'
and column_name in ('source_lead_id','scope','budget','location_details','notes','enquiry_attachments','enquiry_context');
"@
if ($jobColumnCount -ne "7") { throw "Job enquiry-context columns are incomplete or duplicated." }

$indexCount = Invoke-LocalSql @"
select count(*)
from pg_indexes
where schemaname = 'public'
and indexname in ('leads_customer_id_idx','leads_job_id_idx','jobs_source_lead_id_idx','leads_job_id_unique_idx','jobs_source_lead_id_unique_idx');
"@
if ($indexCount -ne "5") { throw "Lead conversion indexes are incomplete or duplicated." }

$functionCount = Invoke-LocalSql "select count(*) from pg_proc where pronamespace = 'public'::regnamespace and proname = 'convert_lead_to_customer';"
if ($functionCount -ne "1") { throw "The conversion function is missing or duplicated." }

$phoneCanonical = Invoke-LocalSql @"
select public.canonical_nz_phone('021 123 4567') || '|' ||
       public.canonical_nz_phone('021-123-4567') || '|' ||
       public.canonical_nz_phone('+64 21 123 4567') || '|' ||
       public.canonical_nz_phone('0064 21 123 4567');
"@
if ($phoneCanonical -ne "0211234567|0211234567|0211234567|0211234567") { throw "NZ phone canonicalisation is inconsistent: $phoneCanonical" }

$fixtures = @'
insert into public.leads (
  id, lead_number, lead_name, client_name, phone, email, location, source,
  status, priority, next_action, notes, scope, budget, location_details,
  enquiry_attachments, active
)
values (
  'phase-1c-conversion-lead', 'CNL-9201', 'Kitchen enquiry', 'Original Conversion Lead',
  '021 555 9201', 'conversion@example.test', '9201 Example Road', 'website',
  'quoted', 'normal', 'Book measure-up', 'Original lead notes', 'Full kitchen',
  '$25000', 'Driveway access', jsonb_build_array(jsonb_build_object('name','quote.pdf','path','lead-files/phase-1c-conversion-lead/quote.pdf')), true
)
on conflict (id) do update set
  lead_name = excluded.lead_name, client_name = excluded.client_name, phone = excluded.phone, email = excluded.email,
  location = excluded.location, status = 'quoted', active = true, converted_at = null, converted_by = null,
  customer_id = null, job_id = null, converted_job_id = null,
  conversion_context = '{}'::jsonb, scope = 'Full kitchen', budget = '$25000',
  location_details = 'Driveway access', enquiry_attachments = jsonb_build_array(jsonb_build_object('name','quote.pdf','path','lead-files/phase-1c-conversion-lead/quote.pdf'));
delete from public.customers where display_name = 'Edited Conversion Customer';
delete from public.jobs where source_lead_id = 'phase-1c-conversion-lead';
'@
Invoke-LocalSql $fixtures | Out-Null

$newCustomerResult = Invoke-LocalSql @'
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
select public.convert_lead_to_customer(
  'phase-1c-conversion-lead', 'create_new', null,
  jsonb_build_object('display_name','Edited Conversion Customer','phone','021 555 9201','email','conversion@example.test','address','9201 Example Road','scope','Full kitchen','budget','$25000','location_details','Driveway access','notes','Original lead notes')
);
commit;
'@
if (-not $newCustomerResult) { throw "New customer conversion returned no result." }

$originalLead = Invoke-LocalSql @"
select lead_number || '|' || status || '|' || active::text || '|' || coalesce(customer_id,'<null>') || '|' || coalesce(job_id,'<null>') || '|' || coalesce(converted_job_id,'<null>') || '|' || (converted_by is not null)::text || '|' || scope || '|' || budget || '|' || location_details || '|' || jsonb_array_length(enquiry_attachments)::text
from public.leads where id = 'phase-1c-conversion-lead';
"@
if ($originalLead -notmatch '^CNL-9201\|converted\|false\|[^|]+\|[^|]+\|[^|]+\|true\|Full kitchen\|\$25000\|Driveway access\|1$') {
  throw "The original lead was not retained with complete conversion markers: $originalLead"
}

$jobContext = Invoke-LocalSql @"
select job_number || '|' || client_name || '|' || job_name || '|' || status || '|' || coalesce(customer_id,'<null>') || '|' || coalesce(source_lead_id,'<null>') || '|' || scope || '|' || budget || '|' || location_details || '|' || notes || '|' || jsonb_array_length(enquiry_attachments)::text || '|' || (enquiry_context->>'lead_number')
from public.jobs where source_lead_id = 'phase-1c-conversion-lead';
"@
if ($jobContext -notmatch '^CN-9201\|Edited Conversion Customer\|Kitchen enquiry\|job_accepted\|[^|]+\|phase-1c-conversion-lead\|Full kitchen\|\$25000\|Driveway access\|Original lead notes\|1\|CNL-9201$') {
  throw "Converted job context or edited customer/job name mapping is incomplete: $jobContext"
}

$beforeCustomerCount = Invoke-LocalSql "select count(*) from public.customers where display_name = 'Edited Conversion Customer';"
$beforeJobCount = Invoke-LocalSql "select count(*) from public.jobs where source_lead_id = 'phase-1c-conversion-lead';"
$retry = Invoke-LocalSql @'
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
select (public.convert_lead_to_customer('phase-1c-conversion-lead','create_new',null,'{}'::jsonb)->>'idempotent');
commit;
'@
if ($retry -ne "true") { throw "Retry did not return the idempotent result." }
$afterCustomerCount = Invoke-LocalSql "select count(*) from public.customers where display_name = 'Edited Conversion Customer';"
$afterJobCount = Invoke-LocalSql "select count(*) from public.jobs where source_lead_id = 'phase-1c-conversion-lead';"
if ($beforeCustomerCount -ne $afterCustomerCount -or $beforeJobCount -ne $afterJobCount) { throw "Retry created duplicate customer or job records." }

$linkFixtures = @'
insert into public.customers (id, display_name, email, phone, address, active)
values ('phase-1c-existing-customer', 'Existing Link Customer', 'link@example.test', '+64 21 555 9202', '9202 Example Road', true)
on conflict (id) do update set display_name = excluded.display_name, email = excluded.email, phone = excluded.phone, address = excluded.address;
insert into public.leads (id, lead_number, lead_name, client_name, phone, email, location, status, priority, active)
values ('phase-1c-link-lead', 'CNL-9202', 'Link enquiry', 'Link Customer', '021 555 9202', 'link@example.test', '9202 Example Road', 'quoted', 'normal', true)
on conflict (id) do update set status = 'quoted', active = true, converted_at = null, converted_by = null, customer_id = null, job_id = null, converted_job_id = null;
delete from public.jobs where source_lead_id = 'phase-1c-link-lead';
'@
Invoke-LocalSql $linkFixtures | Out-Null
Invoke-LocalSql @'
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
select public.convert_lead_to_customer('phase-1c-link-lead','link_existing','phase-1c-existing-customer','{}'::jsonb);
commit;
'@ | Out-Null
$linked = Invoke-LocalSql "select coalesce(l.customer_id,'') || '|' || (l.job_id is not null)::text || '|' || (select count(*) from public.jobs where source_lead_id = l.id) from public.leads l where l.id = 'phase-1c-link-lead';"
if ($linked -ne "phase-1c-existing-customer|true|1") { throw "Existing-customer linking did not create the required customer/job links: $linked" }

$editedFixtures = @'
insert into public.customers (id, display_name, email, phone, address, active)
values ('phase-1c-edited-customer', 'Corrected Contact Customer', 'corrected@example.test', '+64 21 555 9299', '9299 Corrected Road', true)
on conflict (id) do update set display_name = excluded.display_name, email = excluded.email, phone = excluded.phone, address = excluded.address;
insert into public.leads (id, lead_number, lead_name, client_name, phone, email, location, status, priority, active)
values ('phase-1c-edited-lead', 'CNL-9299', 'Edited enquiry', 'Original Contact', '021 000 0000', 'original@example.test', 'Original Road', 'quoted', 'normal', true)
on conflict (id) do update set status = 'quoted', active = true, converted_at = null, converted_by = null, customer_id = null, job_id = null, converted_job_id = null;
delete from public.jobs where source_lead_id = 'phase-1c-edited-lead';
'@
Invoke-LocalSql $editedFixtures | Out-Null
Invoke-LocalSql @'
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
select public.convert_lead_to_customer(
  'phase-1c-edited-lead', 'link_existing', 'phase-1c-edited-customer',
  jsonb_build_object('display_name','Corrected Contact Customer','phone','+64 21 555 9299','email','corrected@example.test','address','9299 Corrected Road')
);
commit;
'@ | Out-Null
$editedLink = Invoke-LocalSql "select coalesce(customer_id,'') || '|' || (job_id is not null)::text from public.leads where id = 'phase-1c-edited-lead';"
if ($editedLink -ne "phase-1c-edited-customer|true") { throw "Edited contact values did not drive duplicate detection/linking: $editedLink" }

$rollbackFixtures = @'
insert into public.leads (id, lead_number, lead_name, client_name, email, location, status, priority, active)
values ('phase-1c-rollback-lead', 'CNL-9203', 'Rollback enquiry', 'Rollback Customer', 'rollback@example.test', '9203 Example Road', 'quoted', 'normal', true)
on conflict (id) do update set status = 'quoted', active = true, converted_at = null, converted_by = null, customer_id = null, job_id = null, converted_job_id = null;
delete from public.customers where display_name = 'Rollback Customer';
insert into public.jobs (id, job_number, client_name, job_name, location, status, active, source_lead_id)
values ('phase-1c-rollback-existing-job', 'CN-9203', 'Rollback', 'Existing conflicting job', 'Local only', 'active', true, 'phase-1c-rollback-lead')
on conflict (id) do update set source_lead_id = excluded.source_lead_id;
'@
Invoke-LocalSql $rollbackFixtures | Out-Null
$rollbackFailed = $false
try {
  Invoke-LocalSql @'
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
select public.convert_lead_to_customer('phase-1c-rollback-lead','create_new',null,jsonb_build_object('display_name','Rollback Customer'));
commit;
'@ | Out-Null
} catch { $rollbackFailed = $true }
if (-not $rollbackFailed) { throw "The forced job uniqueness failure did not fail the conversion." }
$rollbackState = Invoke-LocalSql "select (customer_id is null)::text || '|' || (job_id is null)::text || '|' || (select count(*) from public.customers where display_name = 'Rollback Customer') || '|' || (select count(*) from public.jobs where source_lead_id = 'phase-1c-rollback-lead') from public.leads where id = 'phase-1c-rollback-lead';"
if ($rollbackState -ne "true|true|0|1") { throw "Failed conversion left partial customer/job state: $rollbackState" }

function Assert-ConversionDenied([string]$RoleLabel, [string]$UserId) {
  $denied = $false
  try {
    Invoke-LocalSql @"
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '$UserId';
select public.convert_lead_to_customer('phase-1c-link-lead','link_existing','phase-1c-existing-customer','{}'::jsonb);
commit;
"@ | Out-Null
  } catch { $denied = $_.Exception.Message -match 'Only Owner/Admin or Office may convert a lead' }
  if (-not $denied) { throw "$RoleLabel was not denied the conversion operation." }
}
Assert-ConversionDenied "Workshop" "33333333-3333-3333-3333-333333333333"
Assert-ConversionDenied "Install" "44444444-4444-4444-4444-444444444444"
Assert-ConversionDenied "Read-only" "55555555-5555-5555-5555-555555555555"
Assert-ConversionDenied "Unassigned" "66666666-6666-6666-6666-666666666666"

$existingIdentity = Invoke-LocalSql "select id || '|' || job_number from public.jobs where id = 'phase-1c-job';"
if ($existingIdentity -ne "phase-1c-job|CN-9101") { throw "Lead conversion changed an existing job identity or CN number." }

Write-Output "Phase 1C lead-conversion test passed: new customer, duplicate link, retry idempotency, original-lead preservation, job context/attachments, transaction rollback, role denial, and existing job identity verified."
