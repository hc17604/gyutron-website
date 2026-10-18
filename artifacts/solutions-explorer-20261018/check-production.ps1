$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$release = '7b44f55af9f357beb6c61a08176d0d6bf83670de'
$outputPath = Join-Path $PSScriptRoot 'production-checks.json'
$startedAt = [DateTimeOffset]::UtcNow
$userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/132.0.0.0 Safari/537.36'

function Get-BalancedModule([string]$html, [string]$tagName, [string]$rootPattern) {
  $start = [regex]::Match($html, $rootPattern)
  if (-not $start.Success) { throw "Module root not found: $rootPattern" }
  $depth = 0
  foreach ($tag in [regex]::Matches($html.Substring($start.Index), '<(?<close>/)?' + $tagName + '\b[^>]*>')) {
    if ($tag.Groups['close'].Success) { $depth-- } else { $depth++ }
    if ($depth -eq 0) { return $html.Substring($start.Index, $tag.Index + $tag.Length) }
  }
  throw "Module has unbalanced $tagName tags."
}
function Get-SolutionModule([string]$html) {
  Get-BalancedModule $html 'section' '<section\b(?=[^>]*\bclass="hx-explore")(?=[^>]*\bid="explore")[^>]*>'
}
function Get-ProductModule([string]$html) {
  Get-BalancedModule $html 'div' '<div\b[^>]*class="hx-products"[^>]*>'
}
function Get-Sha256([byte[]]$bytes) {
  [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
}
function Get-CtaHrefs([string]$module) {
  foreach ($tag in [regex]::Matches($module, '<a\b[^>]*\bclass="hx-solution__cta"[^>]*>')) {
    [Net.WebUtility]::HtmlDecode([regex]::Match($tag.Value, '\bhref="([^"]+)"').Groups[1].Value)
  }
}

$homeTargets = @(
  @{ Path='/'; Local='public/index.html'; Locale='en' },
  @{ Path='/de/'; Local='public/de/index.html'; Locale='de' },
  @{ Path='/ja/'; Local='public/ja/index.html'; Locale='ja' }
)
$requests = @()
$localSolutions = @{}
$localProducts = @{}
foreach ($homeTarget in $homeTargets) {
  $html = [IO.File]::ReadAllText((Join-Path $repoRoot $homeTarget.Local))
  $localSolutions[$homeTarget.Path] = Get-SolutionModule $html
  $localProducts[$homeTarget.Path] = Get-ProductModule $html
  $requests += [PSCustomObject]@{ Path=$homeTarget.Path; Kind='homepage'; Local=$homeTarget.Local; Locale=$homeTarget.Locale }
  foreach ($href in @(Get-CtaHrefs $localSolutions[$homeTarget.Path])) {
    $parts = $href.Split('#', 2)
    $fragment = if ($parts.Count -gt 1) { [Uri]::UnescapeDataString($parts[1]) } else { '' }
    $requests += [PSCustomObject]@{ Path=$parts[0]; Href=$href; Fragment=$fragment; Kind='cta'; Locale=$homeTarget.Locale }
  }
}
$imagePaths = @([regex]::Matches($localSolutions['/'], 'src="(/home-solutions/[^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)
foreach ($imagePath in $imagePaths) { $requests += [PSCustomObject]@{ Path=$imagePath; Kind='image'; Local=('public' + $imagePath) } }
$requests += [PSCustomObject]@{ Path='/home-sections.css'; Kind='css'; Local='public/home-sections.css' }
$requests += [PSCustomObject]@{ Path='/api/v1/health'; Kind='health' }
$nonce = $startedAt.ToUnixTimeMilliseconds()
$responses = @($requests | ForEach-Object -Parallel {
  $target = $_
  $separator = if ($target.Path.Contains('?')) { '&' } else { '?' }
  $url = 'https://www.gyutron.com' + $target.Path + $separator + 'release=' + $using:release + '&check=' + $using:nonce
  try {
    $response = Invoke-WebRequest -Uri $url -UserAgent $using:userAgent -Headers @{ 'Cache-Control'='no-cache'; Pragma='no-cache' } -TimeoutSec 30 -SkipHttpErrorCheck
    [PSCustomObject]@{ Target=$target; Status=[int]$response.StatusCode; Bytes=$response.RawContentStream.ToArray(); ContentType=[string]$response.Headers.'Content-Type'; RequestUrl=$url; CacheStatus=[string]$response.Headers.'CF-Cache-Status'; Error=$null }
  } catch {
    [PSCustomObject]@{ Target=$target; Status=0; Bytes=$null; RequestUrl=$url; Error=$_.Exception.Message }
  }
} -ThrottleLimit 6)

$checks = @(foreach ($response in $responses) {
  $target = $response.Target
  $result = [ordered]@{ kind=$target.Kind; path=$target.Path; status=$response.Status; requestUrl=$response.RequestUrl; passed=($response.Status -eq 200) }
  if ($target.Locale) { $result.locale=$target.Locale }
  if ($response.Error) { $result.error=$response.Error; [PSCustomObject]$result; continue }
  $result.contentType=$response.ContentType
  $result.cacheStatus=$response.CacheStatus
  $body = [Text.Encoding]::UTF8.GetString($response.Bytes)
  if ($target.Kind -eq 'homepage') {
    try {
      $solutionModule = Get-SolutionModule $body
      $productModule = Get-ProductModule $body
      $result.exactSolutionModuleMatch = $solutionModule -ceq $localSolutions[$target.Path]
      $result.solutionModuleSha256 = Get-Sha256 ([Text.Encoding]::UTF8.GetBytes($solutionModule))
      $result.localSolutionModuleSha256 = Get-Sha256 ([Text.Encoding]::UTF8.GetBytes($localSolutions[$target.Path]))
      $result.solutionDetailsCount = [regex]::Matches($solutionModule, '<details\b').Count
      $result.solutionImageCount = [regex]::Matches($solutionModule, '<img\b').Count
      $result.solutionCtaCount = @(Get-CtaHrefs $solutionModule).Count
      $optionCounts = @([regex]::Matches($solutionModule, '<select\b[^>]*>[\s\S]*?</select>') | ForEach-Object { [regex]::Matches($_.Value, '<option\b').Count })
      $result.optionCounts = $optionCounts
      $result.exactProductModuleMatch = $productModule -ceq $localProducts[$target.Path]
      $result.productModuleSha256 = Get-Sha256 ([Text.Encoding]::UTF8.GetBytes($productModule))
      $result.localProductModuleSha256 = Get-Sha256 ([Text.Encoding]::UTF8.GetBytes($localProducts[$target.Path]))
      $result.productCardCount = [regex]::Matches($productModule, '<a\b[^>]*class="hx-product(?:\s[^"]*)?"').Count
      $result.passed = $result.passed -and $result.exactSolutionModuleMatch -and $result.solutionDetailsCount -eq 11 -and $result.solutionImageCount -eq 11 -and $result.solutionCtaCount -eq 11 -and $optionCounts.Count -eq 2 -and $optionCounts[0] -eq 6 -and $optionCounts[1] -eq 5 -and $result.exactProductModuleMatch -and $result.productCardCount -eq 9
    } catch { $result.passed=$false; $result.error=$_.Exception.Message }
  } elseif ($target.Kind -eq 'image') {
    $result.remoteSha256=Get-Sha256 $response.Bytes
    $result.localSha256=Get-Sha256 ([IO.File]::ReadAllBytes((Join-Path $repoRoot $target.Local)))
    $result.bytes=$response.Bytes.Length
    $result.hashMatches=$result.remoteSha256 -ceq $result.localSha256
    $result.passed=$result.passed -and $result.hashMatches
  } elseif ($target.Kind -eq 'css') {
    $localCss=[IO.File]::ReadAllText((Join-Path $repoRoot $target.Local)).Replace("`r`n", "`n").Replace("`r", "`n")
    $remoteCss=$body.Replace("`r`n", "`n").Replace("`r", "`n")
    $result.normalization='LF'
    $result.remoteSha256=Get-Sha256 ([Text.Encoding]::UTF8.GetBytes($remoteCss))
    $result.localSha256=Get-Sha256 ([Text.Encoding]::UTF8.GetBytes($localCss))
    $result.hashMatches=$result.remoteSha256 -ceq $result.localSha256
    $result.passed=$result.passed -and $result.hashMatches
  } elseif ($target.Kind -eq 'cta') {
    $result.href=$target.Href
    $result.fragment=$target.Fragment
    $result.fragmentExists=if ($target.Fragment) { [regex]::IsMatch($body, '\bid="' + [regex]::Escape($target.Fragment) + '"') } else { $null }
    $result.passed=$result.passed -and (-not $target.Fragment -or $result.fragmentExists)
  } elseif ($target.Kind -eq 'health') {
    try { $result.healthStatus=($body | ConvertFrom-Json).status; $result.passed=$result.passed -and $result.healthStatus -eq 'ok' }
    catch { $result.passed=$false; $result.error=$_.Exception.Message }
  }
  [PSCustomObject]$result
})
$counts=[ordered]@{ homepages=@($checks | Where-Object kind -eq 'homepage').Count; ctas=@($checks | Where-Object kind -eq 'cta').Count; images=@($checks | Where-Object kind -eq 'image').Count; css=@($checks | Where-Object kind -eq 'css').Count; health=@($checks | Where-Object kind -eq 'health').Count }
$expectedCounts=$counts.homepages -eq 3 -and $counts.ctas -eq 33 -and $counts.images -eq 11 -and $counts.css -eq 1 -and $counts.health -eq 1
$attempt=[ordered]@{ startedAt=$startedAt.ToString('o'); completedAt=[DateTimeOffset]::UtcNow.ToString('o'); requestCount=$checks.Count; counts=$counts; expectedCountsMatch=$expectedCounts; passed=($expectedCounts -and @($checks | Where-Object { -not $_.passed }).Count -eq 0); checks=$checks }
$attempts=@()
if (Test-Path -LiteralPath $outputPath) {
  $prior=Get-Content -LiteralPath $outputPath -Raw | ConvertFrom-Json
  if ($prior.release -eq $release) { $attempts=@($prior.attempts) }
}
$attempts += [PSCustomObject]$attempt
$localHead=(& git -C $repoRoot rev-parse HEAD).Trim()
$report=[ordered]@{ release=$release; localHead=$localHead; baseUrl='https://www.gyutron.com'; localBaseline='Current root public/'; extraction='Full balanced section scan from hx-explore id=explore, including both nested group sections; balanced div scan for hx-products. Exact module strings only; no full-page HTML equality asserted.'; userAgent=$userAgent; cacheRequest='Cache-Control/Pragma no-cache plus release/timestamp query'; passed=$attempt.passed; attempts=$attempts }
[IO.File]::WriteAllText($outputPath, ($report | ConvertTo-Json -Depth 14) + "`n", [Text.UTF8Encoding]::new($false))
[PSCustomObject]@{ release=$release; attempt=$attempts.Count; requests=$checks.Count; counts=$counts; passed=$attempt.passed; passedChecks=@($checks | Where-Object passed).Count; failures=@($checks | Where-Object { -not $_.passed }); evidence=$outputPath } | ConvertTo-Json -Depth 7
