param(
  [string]$WebUrl = "http://localhost:3000/restomap.html",
  [string]$BuilderUrl = "http://localhost:3000/restobuilder.html",
  [string]$ApiUrl = "http://localhost:3001/",
  [int]$TimeoutSec = 6
)

$ErrorActionPreference = 'Stop'

function Test-Url($name, $url) {
  try {
    $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec $TimeoutSec
    if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 400) {
      return [pscustomobject]@{ Name=$name; Url=$url; Ok=$true; Status=$res.StatusCode; Note='OK' }
    }
    return [pscustomobject]@{ Name=$name; Url=$url; Ok=$false; Status=$res.StatusCode; Note='Unexpected status' }
  } catch {
    return [pscustomobject]@{ Name=$name; Url=$url; Ok=$false; Status='ERR'; Note=$_.Exception.Message }
  }
}

$checks = @(
  Test-Url -name 'WEB_RESTOMAP' -url $WebUrl
  Test-Url -name 'WEB_RESTOBUILDER' -url $BuilderUrl
  Test-Url -name 'API_ROOT' -url $ApiUrl
)

$ok = $checks | Where-Object { $_.Ok }
$bad = $checks | Where-Object { -not $_.Ok }

Write-Host "=== RESTOSUITE LIGHT HEALTHCHECK ==="
$checks | ForEach-Object {
  $icon = if ($_.Ok) { '✅' } else { '❌' }
  Write-Host "$icon $($_.Name) [$($_.Status)] - $($_.Note)"
}

if ($bad.Count -gt 0) {
  Write-Host "\nSuggested quick action:" -ForegroundColor Yellow
  Write-Host "- Restart API: cd restomap/apps/api; npm run dev"
  Write-Host "- Restart Web: cd restomap/apps/web; npm run dev"
  exit 2
}

Write-Host "\nAll services healthy." -ForegroundColor Green
exit 0
