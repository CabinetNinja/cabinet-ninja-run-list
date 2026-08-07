param(
  [string]$SupabaseCli = "C:\Users\ADAMAN~1\AppData\Local\Temp\cabinet-ninja-phase-1a-supabase-cli\supabase.exe",
  [string]$Container = "supabase_db_cabinet-ninja-phase-1a-audit"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Net.Http

function Invoke-LocalHttp([string]$Uri, [string]$Method, [string]$Body, [string]$ApiKey, [string]$AccessToken = "") {
  $client = [System.Net.Http.HttpClient]::new()
  try {
    $request = [System.Net.Http.HttpRequestMessage]::new($Method, $Uri)
    $request.Headers.Add("apikey", $ApiKey)
    if ($AccessToken) {
      $request.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new("Bearer", $AccessToken)
    }
    if ($Body) {
      $request.Content = [System.Net.Http.StringContent]::new($Body, [System.Text.Encoding]::UTF8, "application/json")
    }
    $response = $client.SendAsync($request).GetAwaiter().GetResult()
    return [pscustomobject]@{
      Status = [int]$response.StatusCode
      Body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    }
  } finally {
    $client.Dispose()
  }
}

if (-not (Test-Path -LiteralPath $SupabaseCli)) { throw "Supabase CLI not found." }
if (-not (docker ps --format '{{.Names}}' | Select-String -SimpleMatch $Container -Quiet)) {
  throw "The expected local Supabase database container is not running: $Container"
}

# status output contains local development credentials. Keep it in memory only.
$statusEnv = & $SupabaseCli status -o env
$apiUrl = (($statusEnv | Where-Object { $_ -match '^API_URL=' } | Select-Object -First 1) -replace '^API_URL=', '').Trim('"')
$anonKey = (($statusEnv | Where-Object { $_ -match '^ANON_KEY=' } | Select-Object -First 1) -replace '^ANON_KEY=', '').Trim('"')
if (-not $apiUrl -or -not $anonKey) { throw "Could not read local Supabase API settings." }

$functionUrl = "$apiUrl/functions/v1/job-file-url"
$noAuth = Invoke-LocalHttp $functionUrl "POST" '{"fileId":"phase-1b-job-file"}' $anonKey
if ($noAuth.Status -ne 401) { throw "Unsigned request did not receive 401." }

$suffix = [guid]::NewGuid().ToString("N")
$password = "Local-only-$suffix!"
$workshop = Invoke-LocalHttp "$apiUrl/auth/v1/signup" "POST" (@{ email = "edge-workshop-$suffix@test.invalid"; password = $password } | ConvertTo-Json -Compress) $anonKey
$owner = Invoke-LocalHttp "$apiUrl/auth/v1/signup" "POST" (@{ email = "edge-owner-$suffix@test.invalid"; password = $password } | ConvertTo-Json -Compress) $anonKey
$office = Invoke-LocalHttp "$apiUrl/auth/v1/signup" "POST" (@{ email = "edge-office-$suffix@test.invalid"; password = $password } | ConvertTo-Json -Compress) $anonKey
$install = Invoke-LocalHttp "$apiUrl/auth/v1/signup" "POST" (@{ email = "edge-install-$suffix@test.invalid"; password = $password } | ConvertTo-Json -Compress) $anonKey
$readOnly = Invoke-LocalHttp "$apiUrl/auth/v1/signup" "POST" (@{ email = "edge-read-only-$suffix@test.invalid"; password = $password } | ConvertTo-Json -Compress) $anonKey
$unassigned = Invoke-LocalHttp "$apiUrl/auth/v1/signup" "POST" (@{ email = "edge-unassigned-$suffix@test.invalid"; password = $password } | ConvertTo-Json -Compress) $anonKey
if (($workshop.Status -notin 200, 201) -or ($owner.Status -notin 200, 201) -or ($office.Status -notin 200, 201) -or ($install.Status -notin 200, 201) -or ($readOnly.Status -notin 200, 201) -or ($unassigned.Status -notin 200, 201)) { throw "Could not create local Edge Function test users." }

$workshopSession = $workshop.Body | ConvertFrom-Json
$ownerSession = $owner.Body | ConvertFrom-Json
$officeSession = $office.Body | ConvertFrom-Json
$installSession = $install.Body | ConvertFrom-Json
$readOnlySession = $readOnly.Body | ConvertFrom-Json
$unassignedSession = $unassigned.Body | ConvertFrom-Json
if (-not $workshopSession.access_token -or -not $ownerSession.access_token -or -not $officeSession.access_token -or -not $installSession.access_token -or -not $readOnlySession.access_token -or -not $unassignedSession.access_token) {
  throw "Local Auth did not return test sessions."
}

$workshopId = $workshopSession.user.id
$ownerId = $ownerSession.user.id
$officeId = $officeSession.user.id
$installId = $installSession.user.id
$readOnlyId = $readOnlySession.user.id
$unassignedId = $unassignedSession.user.id
try {
  $assignSql = "insert into public.staff_profiles (user_id, role, active) values ('$workshopId', 'workshop', true), ('$ownerId', 'owner_admin', true), ('$officeId', 'office', true), ('$installId', 'install', true), ('$readOnlyId', 'read_only', true);"
  & docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -c $assignSql
  if ($LASTEXITCODE -ne 0) { throw "Could not assign the local Workshop test role." }

  $denied = Invoke-LocalHttp $functionUrl "POST" '{"fileId":"phase-1b-job-file"}' $anonKey $unassignedSession.access_token
  if ($denied.Status -ne 403) { throw "Unassigned user did not receive 403 (received $($denied.Status): $($denied.Body))." }

  $generic = Invoke-LocalHttp $functionUrl "POST" '{"fileId":"phase-1b-generic-file"}' $anonKey $workshopSession.access_token
  if ($generic.Status -ne 404) { throw "Generic octet-stream file did not fail closed (received $($generic.Status): $($generic.Body))." }

  $ncPayload = '{"fileId":"phase-1b-nc-file","expiresIn":999999}'
  foreach ($case in @(
    @{ Name = "Workshop"; Session = $workshopSession; Expected = 200 },
    @{ Name = "Owner/Admin"; Session = $ownerSession; Expected = 200 },
    @{ Name = "Office"; Session = $officeSession; Expected = 403 },
    @{ Name = "Install"; Session = $installSession; Expected = 403 },
    @{ Name = "Read-only"; Session = $readOnlySession; Expected = 403 }
  )) {
    $ncResponse = Invoke-LocalHttp $functionUrl "POST" $ncPayload $anonKey $case.Session.access_token
    if ($ncResponse.Status -ne $case.Expected) { throw "$($case.Name) .nc request expected $($case.Expected), received $($ncResponse.Status): $($ncResponse.Body)" }
    if ($case.Expected -eq 200) {
      $ncResult = $ncResponse.Body | ConvertFrom-Json
      if ($ncResult.expiresIn -ne 900 -or -not $ncResult.url) { throw "$($case.Name) .nc URL did not have fixed 900 second expiry." }
    }
  }

  foreach ($case in @(
    @{ Name = "Workshop PDF"; Session = $workshopSession },
    @{ Name = "Owner/Admin PDF"; Session = $ownerSession },
    @{ Name = "Office PDF"; Session = $officeSession },
    @{ Name = "Install PDF"; Session = $installSession },
    @{ Name = "Read-only PDF"; Session = $readOnlySession }
  )) {
    $pdfResponse = Invoke-LocalHttp $functionUrl "POST" '{"fileId":"phase-1b-job-file","expiresIn":999999}' $anonKey $case.Session.access_token
    if ($pdfResponse.Status -ne 200) { throw "$($case.Name) request expected 200, received $($pdfResponse.Status): $($pdfResponse.Body)" }
    $pdfResult = $pdfResponse.Body | ConvertFrom-Json
    if ($pdfResult.expiresIn -ne 900 -or -not $pdfResult.url) { throw "$($case.Name) URL did not have fixed 900 second expiry." }
  }

  $authorised = Invoke-LocalHttp $functionUrl "POST" '{"fileId":"phase-1b-job-file","expiresIn":999999}' $anonKey $workshopSession.access_token
  if ($authorised.Status -ne 200) { throw "Authorised Workshop request did not receive 200." }
  $payload = $authorised.Body | ConvertFrom-Json
  if ($payload.expiresIn -ne 900 -or -not $payload.url) { throw "Signed URL response did not have a fixed 15-minute expiry and URL." }
} finally {
  $cleanupSql = "delete from public.staff_profiles where user_id in ('$workshopId', '$ownerId', '$officeId', '$installId', '$readOnlyId', '$unassignedId'); delete from auth.users where id in ('$workshopId', '$ownerId', '$officeId', '$installId', '$readOnlyId', '$unassignedId');"
  & docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -c $cleanupSql 2>$null
}

Write-Output "Local Edge Function authorisation and fixed 15-minute signed-URL checks passed."
