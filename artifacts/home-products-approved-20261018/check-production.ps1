$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$release = '034aca11bfa97c7794012d707c05fdffa4fd5d34'
$outputPath = Join-Path $PSScriptRoot 'production-checks.json'
$startedAt = [DateTimeOffset]::UtcNow

function Get-ProductModule([string]$html) {
  $start = [regex]::Match($html, '<div\b[^>]*class="hx-products"[^>]*>')
  if (-not $start.Success) { throw 'Homepage product module not found.' }
  $depth = 0
  foreach ($tag in [regex]::Matches($html.Substring($start.Index), '<(?<close>/)?div\b[^>]*>')) {
    if ($tag.Groups['close'].Success) { $depth-- } else { $depth++ }
    if ($depth -eq 0) { return $html.Substring($start.Index, $tag.Index + $tag.Length) }
  }
  throw 'Homepage product module has unbalanced div tags.'
}

function Get-Sha256([byte[]]$bytes) {
  return [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
}

$homeTargets = @(
  @{ Path='/'; Local='public/index.html'; Locale='en' },
  @{ Path='/de/'; Local='public/de/index.html'; Locale='de' },
  @{ Path='/ja/'; Local='public/ja/index.html'; Locale='ja' }
)
$requests = @()
$localModules = @{}
foreach ($homeTarget in $homeTargets) {
  $html = [IO.File]::ReadAllText((Join-Path $repoRoot $homeTarget.Local))
  $module = Get-ProductModule $html
  $localModules[$homeTarget.Path] = $module
  $requests += [PSCustomObject]@{ Path=$homeTarget.Path; Kind='homepage'; Local=$homeTarget.Local; Locale=$homeTarget.Locale }
  $grid = [regex]::Match($module, '<ul class="hx-products__grid"[\s\S]*?</ul>').Value
  foreach ($link in [regex]::Matches($grid, 'href="([^"]+)"')) {
    $requests += [PSCustomObject]@{ Path=$link.Groups[1].Value; Kind='category'; Locale=$homeTarget.Locale }
  }
}
$englishModule = $localModules['/']
$imagePaths = @([regex]::Matches($englishModule, 'src="(/home-products/[^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)
foreach ($imagePath in $imagePaths) { $requests += [PSCustomObject]@{ Path=$imagePath; Kind='image'; Local=('public' + $imagePath) } }
$requests += [PSCustomObject]@{ Path='/home-sections.css'; Kind='css'; Local='public/home-sections.css' }
$requests += [PSCustomObject]@{ Path='/api/v1/health'; Kind='health' }
$nonce = $startedAt.ToUnixTimeMilliseconds()
$responses = @($requests | ForEach-Object -Parallel {
  $target = $_
  $url = 'https://www.gyutron.com' + $target.Path + '?release=' + $using:release + '&check=' + $using:nonce
  try {
    $response = Invoke-WebRequest -Uri $url -UserAgent 'Mozilla/5.0' -Headers @{ 'Cache-Control'='no-cache'; Pragma='no-cache' } -TimeoutSec 30
    $body = $response.Content
    [PSCustomObject]@{ Target=$target; Status=[int]$response.StatusCode; Body=$body; ContentType=[string]$response.Headers.'Content-Type'; RequestUrl=$url; CacheStatus=[string]$response.Headers.'CF-Cache-Status'; Error=$null }
  } catch {
    [PSCustomObject]@{ Target=$target; Status=0; Body=$null; RequestUrl=$url; Error=$_.Exception.Message }
  }
} -ThrottleLimit 6)

$checks = foreach ($response in $responses) {
  $target = $response.Target
  $result = [ordered]@{ kind=$target.Kind; path=$target.Path; status=$response.Status; requestUrl=$response.RequestUrl; passed=($response.Status -eq 200) }
  if ($response.Error) { $result.error=$response.Error; [PSCustomObject]$result; continue }
  $result.contentType=$response.ContentType
  $result.cacheStatus=$response.CacheStatus
  $body = if ($response.Body -is [byte[]]) { [Text.Encoding]::UTF8.GetString($response.Body) } else { [string]$response.Body }
  if ($target.Kind -eq 'homepage') {
    try {
      $module = Get-ProductModule $body
      $catalog = [regex]::Match($module, '<ul class="hx-products__catalog-list"[\s\S]*?</ul>').Value
      $grid = [regex]::Match($module, '<ul class="hx-products__grid"[\s\S]*?</ul>').Value
      $primaryLinks = @([regex]::Matches($grid, 'href="([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
      $result.exactProductModuleMatch = $module -ceq $localModules[$target.Path]
      $result.primaryCardCount = $primaryLinks.Count
      $result.uniquePrimaryCategoryCount = @($primaryLinks | Select-Object -Unique).Count
      $result.imageTagCount = [regex]::Matches($grid, '<img\b').Count
      $result.allProductsLinkCount = [regex]::Matches($catalog, 'href="([^"]+)"').Count
      $result.productModuleSha256 = Get-Sha256 ([Text.Encoding]::UTF8.GetBytes($module))
      $result.passed = $result.passed -and $result.exactProductModuleMatch -and $result.primaryCardCount -eq 9 -and $result.uniquePrimaryCategoryCount -eq 9 -and $result.imageTagCount -eq 11 -and $result.allProductsLinkCount -eq 18
    } catch { $result.passed=$false; $result.error=$_.Exception.Message }
  } elseif ($target.Kind -eq 'image') {
    if ($response.Body -isnot [byte[]]) { $result.passed=$false; $result.error='Binary image response was not a byte array.' }
    else {
      $result.remoteSha256=Get-Sha256 $response.Body
      $result.localSha256=Get-Sha256 ([IO.File]::ReadAllBytes((Join-Path $repoRoot $target.Local)))
      $result.bytes=$response.Body.Length
      $result.hashMatches=$result.remoteSha256 -ceq $result.localSha256
      $result.passed=$result.passed -and $result.hashMatches
    }
  } elseif ($target.Kind -eq 'css') {
    $localCss=[IO.File]::ReadAllText((Join-Path $repoRoot $target.Local)).Replace("`r`n", "`n").Replace("`r", "`n")
    $remoteCss=$body.Replace("`r`n", "`n").Replace("`r", "`n")
    $result.normalization='LF'
    $result.remoteSha256=Get-Sha256 ([Text.Encoding]::UTF8.GetBytes($remoteCss))
    $result.localSha256=Get-Sha256 ([Text.Encoding]::UTF8.GetBytes($localCss))
    $result.hashMatches=$result.remoteSha256 -ceq $result.localSha256
    $result.passed=$result.passed -and $result.hashMatches
  } elseif ($target.Kind -eq 'health') {
    try { $result.healthStatus=($body | ConvertFrom-Json).status; $result.passed=$result.passed -and $result.healthStatus -eq 'ok' }
    catch { $result.passed=$false; $result.error=$_.Exception.Message }
  }
  [PSCustomObject]$result
}
$attempt=[ordered]@{ startedAt=$startedAt.ToString('o'); completedAt=[DateTimeOffset]::UtcNow.ToString('o'); requestCount=$checks.Count; passed=(@($checks | Where-Object { -not $_.passed }).Count -eq 0); checks=@($checks) }
$attempts=@()
if (Test-Path -LiteralPath $outputPath) {
  $prior=Get-Content -LiteralPath $outputPath -Raw | ConvertFrom-Json
  if ($prior.release -eq $release) { $attempts=@($prior.attempts) }
}
$attempts += [PSCustomObject]$attempt
$report=[ordered]@{ release=$release; baseUrl='https://www.gyutron.com'; localBaseline='Current committed root public/'; extraction='Balanced nested div scan from exact hx-products root; no full-page HTML equality assumed'; userAgent='Mozilla/5.0'; cacheRequest='Cache-Control/Pragma no-cache plus release/timestamp query'; passed=$attempt.passed; attempts=$attempts }
[IO.File]::WriteAllText($outputPath, ($report | ConvertTo-Json -Depth 10) + "`n", [Text.UTF8Encoding]::new($false))
[PSCustomObject]@{ release=$release; attempt=$attempts.Count; requests=$checks.Count; passed=$attempt.passed; passedChecks=@($checks | Where-Object passed).Count; failures=@($checks | Where-Object { -not $_.passed }); evidence=$outputPath } | ConvertTo-Json -Depth 5
