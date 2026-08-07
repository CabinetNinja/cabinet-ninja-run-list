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
$unassigned = Invoke-LocalHttp "$apiUrl/auth/v1/signup" "POST" (@{ email = "edge-unassigned-$suffix@test.invalid"; password = $password } | ConvertTo-Json -Compress) $anonKey
if ($workshop.Status -notin 200, 201 -or $unassigned.Status -notin 200, 201) { throw "Could not create local Edge Function test users." }

$workshopSession = $workshop.Body | ConvertFrom-Json
$unassignedSession = $unassigned.Body | ConvertFrom-Json
if (-not $workshopSession.access_token -or -not $workshopSession.user.id -or -not $unassignedSession.access_token -or -not $unassignedSession.user.id) {
  throw "Local Auth did not return test sessions."
}

$workshopId = $workshopSession.user.id
$unassignedId = $unassignedSession.user.id
try {
  $assignSql = "insert into public.staff_profiles (user_id, role, active) values ('$workshopId', 'workshop', true);"
  & docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -c $assignSql
  if ($LASTEXITCODE -ne 0) { throw "Could not assign the local Workshop test role." }

  $denied = Invoke-LocalHttp $functionUrl "POST" '{"fileId":"phase-1b-job-file"}' $anonKey $unassignedSession.access_token
  if ($denied.Status -ne 403) { throw "Unassigned user did not receive 403 (received $($denied.Status): $($denied.Body))." }

  $authorised = Invoke-LocalHttp $functionUrl "POST" '{"fileId":"phase-1b-job-file","expiresIn":999999}' $anonKey $workshopSession.access_token
  if ($authorised.Status -ne 200) { throw "Authorised Workshop request did not receive 200." }
  $payload = $authorised.Body | ConvertFrom-Json
  if ($payload.expiresIn -ne 900 -or -not $payload.url) { throw "Signed URL response did not have a fixed 15-minute expiry and URL." }
} finally {
  $cleanupSql = "delete from public.staff_profiles where user_id in ('$workshopId', '$unassignedId'); delete from auth.users where id in ('$workshopId', '$unassignedId');"
  & docker exec $Container psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres -c $cleanupSql 2>$null
}

Write-Output "Local Edge Function authorisation and fixed 15-minute signed-URL checks passed."
