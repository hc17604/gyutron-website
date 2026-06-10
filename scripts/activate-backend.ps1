# ============================================================================
# GYUTRON Phase 2 — one-shot backend activation (Windows PowerShell 5.1+)
#
# What it does (in order):
#   1. checks wrangler login (run `npx wrangler login` first)
#   2. creates the D1 database `gyutron_db` (or reuses an existing one)
#   3. creates the R2 bucket `gyutron-assets` (resource center, P5)
#   4. creates the KV namespace `RATE_LIMIT` (form + admin-login rate limiting)
#   5. un-comments the matching blocks in wrangler.toml + fills the real ids
#   6. applies D1 migrations (remote)
#   7. sets secrets: DATA_API_KEY / IP_HASH_SALT (auto-generated),
#      ADMIN_PASSWORD (you type it). Turnstile is enabled later (P3) — skipped.
#      Existing RESEND_* contact secrets are NOT touched.
#   8. dry-run validates the Worker bundle, then deploys it
#   9. verifies /api/v1/health, /api/v1/metadata (with the key) and /admin
#
# Run from the REPO ROOT:
#   npx wrangler login          (once, opens a browser)
#   powershell -ExecutionPolicy Bypass -File scripts\activate-backend.ps1
#
# Safe to re-run: every step is skipped or harmless if already done.
# DATA_API_KEY IS PRINTED ONCE AT THE END — copy it into your password manager;
# the Agent Workspace connector needs it. Nothing secret is written to the repo.
#
# NOTE: $ErrorActionPreference stays "Continue" ON PURPOSE. In PowerShell 5.1,
# "Stop" + `2>&1` turns any native stderr line (e.g. wrangler's proxy warning)
# into a terminating error and kills the script. Failures are detected via
# $LASTEXITCODE / output checks instead.
# ============================================================================
$ErrorActionPreference = "Continue"
$Base = "https://www.gyutron.com"

if (-not (Test-Path "wrangler.toml")) { Write-Host "ERROR: run this from the repo root (wrangler.toml not found)." -ForegroundColor Red; exit 1 }

function Fail($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

# --- 1/9 wrangler login check ------------------------------------------------
Write-Host "`n--- 1/9 wrangler login check ---" -ForegroundColor Cyan
$who = (npx wrangler whoami 2>&1 | Out-String)
Write-Host $who
# `wrangler whoami` exits 0 even when logged out — check the text, not the code.
if ($who -match "not authenticated|wrangler login") {
    Fail "Not logged in. Run:  npx wrangler login   then re-run this script."
}

$toml = Get-Content "wrangler.toml" -Raw
$tomlChanged = $false

# --- 2/9 D1 database ----------------------------------------------------------
Write-Host "`n--- 2/9 D1 database ---" -ForegroundColor Cyan
$dbId = $null
if ($toml -match '(?m)^\[\[d1_databases\]\]') {
    Write-Host "wrangler.toml already has an active [[d1_databases]] block - skipping."
    if ($toml -match '(?m)^database_id\s*=\s*"([0-9a-f-]{36})"') { $dbId = $Matches[1] }
} else {
    $createOut = (npx wrangler d1 create gyutron_db 2>&1 | Out-String)
    Write-Host $createOut
    # wrangler may print the snippet as TOML (id = "...") or JSON ("database_id": "...")
    if ($createOut -match 'database_id["\s]*[:=]\s*"([0-9a-f-]{36})"') {
        $dbId = $Matches[1]
    } else {
        # DB may already exist from a previous attempt - look it up
        $listOut = (npx wrangler d1 list 2>&1 | Out-String)
        $line = ($listOut -split "`n" | Where-Object { $_ -match 'gyutron_db' } | Select-Object -First 1)
        if ($line -match '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})') {
            $dbId = $Matches[1]
            Write-Host "Reusing existing gyutron_db: $dbId"
        } else {
            Fail "Could not create or find gyutron_db. Run 'npx wrangler d1 list' and check manually."
        }
    }
    $toml = $toml `
        -replace '(?m)^# \[\[d1_databases\]\]', '[[d1_databases]]' `
        -replace '(?m)^# (binding = "DB")', '$1' `
        -replace '(?m)^# (database_name = "gyutron_db")', '$1' `
        -replace '(?m)^# database_id = "PASTE-DATABASE-ID-HERE"', ('database_id = "' + $dbId + '"') `
        -replace '(?m)^# (migrations_dir = "migrations")', '$1'
    $tomlChanged = $true
    Write-Host "wrangler.toml: D1 binding activated (database_id = $dbId)"
}

# --- 3/9 R2 bucket --------------------------------------------------------------
Write-Host "`n--- 3/9 R2 bucket (resource center) ---" -ForegroundColor Cyan
if ($toml -match '(?m)^\[\[r2_buckets\]\]') {
    Write-Host "wrangler.toml already has an active [[r2_buckets]] block - skipping."
} else {
    $r2Out = (npx wrangler r2 bucket create gyutron-assets 2>&1 | Out-String)
    Write-Host $r2Out
    if ($r2Out -match 'Created bucket|already exists|already owns') {
        $toml = $toml `
            -replace '(?m)^# \[\[r2_buckets\]\]', '[[r2_buckets]]' `
            -replace '(?m)^# (binding = "R2")', '$1' `
            -replace '(?m)^# (bucket_name = "gyutron-assets")', '$1'
        $tomlChanged = $true
        Write-Host "wrangler.toml: R2 binding activated (gyutron-assets)"
    } else {
        Write-Host "WARN: could not confirm the R2 bucket - leaving the binding commented (downloads will degrade gracefully). Create it later with: npx wrangler r2 bucket create gyutron-assets" -ForegroundColor Yellow
    }
}

# --- 4/9 KV namespace (rate limiting) -------------------------------------------
Write-Host "`n--- 4/9 KV namespace (rate limiting) ---" -ForegroundColor Cyan
if ($toml -match '(?m)^\[\[kv_namespaces\]\]') {
    Write-Host "wrangler.toml already has an active [[kv_namespaces]] block - skipping."
} else {
    $kvOut = (npx wrangler kv namespace create RATE_LIMIT 2>&1 | Out-String)
    Write-Host $kvOut
    $kvId = $null
    if ($kvOut -match 'id["\s]*[:=]\s*"([0-9a-f]{32})"') {
        $kvId = $Matches[1]
    } else {
        # may already exist - look it up
        $kvList = (npx wrangler kv namespace list 2>&1 | Out-String)
        $m = [regex]::Match($kvList, '"id":\s*"([0-9a-f]{32})"[^}]*RATE_LIMIT|RATE_LIMIT[^}]*"id":\s*"([0-9a-f]{32})"')
        if ($m.Success) { $kvId = if ($m.Groups[1].Value) { $m.Groups[1].Value } else { $m.Groups[2].Value } }
    }
    if ($kvId) {
        $toml = $toml `
            -replace '(?m)^# \[\[kv_namespaces\]\]', '[[kv_namespaces]]' `
            -replace '(?m)^# (binding = "RATE_LIMIT")', '$1' `
            -replace '(?m)^# id = "PASTE-KV-NAMESPACE-ID-HERE"', ('id = "' + $kvId + '"')
        $tomlChanged = $true
        Write-Host "wrangler.toml: KV binding activated (id = $kvId)"
    } else {
        Write-Host "WARN: could not create/find the RATE_LIMIT namespace - leaving it commented (rate limiting stays a no-op)." -ForegroundColor Yellow
    }
}

# --- 5/9 write wrangler.toml ------------------------------------------------------
if ($tomlChanged) {
    Write-Host "`n--- 5/9 writing wrangler.toml (backup: wrangler.toml.bak) ---" -ForegroundColor Cyan
    Copy-Item "wrangler.toml" "wrangler.toml.bak" -Force
    Set-Content "wrangler.toml" $toml -NoNewline -Encoding UTF8
} else {
    Write-Host "`n--- 5/9 wrangler.toml unchanged ---" -ForegroundColor Cyan
}

# --- 6/9 migrations ----------------------------------------------------------------
Write-Host "`n--- 6/9 applying D1 migrations (remote) ---" -ForegroundColor Cyan
npx wrangler d1 migrations apply gyutron_db --remote
if ($LASTEXITCODE -ne 0) { Fail "Migration failed - stopping before deploy." }

# --- 7/9 secrets --------------------------------------------------------------------
Write-Host "`n--- 7/9 secrets ---" -ForegroundColor Cyan
function New-Key { ([guid]::NewGuid().ToString("N")) + ([guid]::NewGuid().ToString("N")) }

$existing = (npx wrangler secret list 2>&1 | Out-String)
$DataApiKey = $null
if ($existing -match '"DATA_API_KEY"') {
    Write-Host "DATA_API_KEY already set - keeping it. (Re-set manually if you lost the value: npx wrangler secret put DATA_API_KEY)"
} else {
    $DataApiKey = New-Key
    $DataApiKey | npx wrangler secret put DATA_API_KEY
    if ($LASTEXITCODE -ne 0) { Fail "Could not set DATA_API_KEY." }
}
if ($existing -match '"IP_HASH_SALT"') {
    Write-Host "IP_HASH_SALT already set - keeping it."
} else {
    (New-Key) | npx wrangler secret put IP_HASH_SALT
    if ($LASTEXITCODE -ne 0) { Fail "Could not set IP_HASH_SALT." }
}
if ($existing -match '"ADMIN_PASSWORD"') {
    Write-Host "ADMIN_PASSWORD already set - keeping it."
} else {
    $pw = Read-Host "Choose the /admin password (input hidden)" -AsSecureString
    $pwPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pw))
    if (-not $pwPlain) { Fail "Empty password - aborting." }
    $pwPlain | npx wrangler secret put ADMIN_PASSWORD
    if ($LASTEXITCODE -ne 0) { Fail "Could not set ADMIN_PASSWORD." }
}

# --- 8/9 dry-run + deploy --------------------------------------------------------------
Write-Host "`n--- 8/9 dry-run, then deploy ---" -ForegroundColor Cyan
npx wrangler deploy --dry-run --outdir .wrangler/dry-run
if ($LASTEXITCODE -ne 0) { Fail "Dry-run failed - NOT deploying. wrangler.toml backup: wrangler.toml.bak" }
npm run deploy
if ($LASTEXITCODE -ne 0) { Fail "Deploy failed. Rollback if needed: npx wrangler rollback" }

# --- 9/9 verify --------------------------------------------------------------------------
Write-Host "`n--- 9/9 verifying live endpoints ---" -ForegroundColor Cyan
Start-Sleep -Seconds 5
try {
    $health = Invoke-RestMethod "$Base/api/v1/health"
    Write-Host ("health: " + ($health | ConvertTo-Json -Compress))
} catch { Write-Host "WARN: /api/v1/health not reachable yet (propagation can take ~1 min)." -ForegroundColor Yellow }
if ($DataApiKey) {
    try {
        $meta = Invoke-RestMethod "$Base/api/v1/metadata" -Headers @{ Authorization = "Bearer $DataApiKey" }
        Write-Host ("metadata: " + ($meta | ConvertTo-Json -Compress -Depth 5))
        $leads = Invoke-RestMethod "$Base/api/v1/leads?limit=1" -Headers @{ Authorization = "Bearer $DataApiKey" }
        Write-Host ("leads (empty data = correct): " + ($leads | ConvertTo-Json -Compress -Depth 5))
    } catch { Write-Host "WARN: metadata/leads check failed - verify manually with your key." -ForegroundColor Yellow }
} else {
    Write-Host "metadata/leads check skipped (DATA_API_KEY pre-existing; test with your stored key)."
}
try {
    $admin = Invoke-WebRequest "$Base/admin" -UseBasicParsing
    Write-Host ("admin: HTTP " + $admin.StatusCode + ($(if ($admin.Content -match "not configured") {" (STILL NOT CONFIGURED - check ADMIN_PASSWORD)"} else {" (login form active)"})))
} catch { Write-Host "WARN: /admin check failed - open it in a browser to verify." -ForegroundColor Yellow }

Write-Host "`n=== DONE ===" -ForegroundColor Green
if ($DataApiKey) {
    Write-Host "DATA_API_KEY (copy to your password manager NOW - shown only once):" -ForegroundColor Yellow
    Write-Host "  $DataApiKey"
    Write-Host "The Agent Workspace connector reads it from GYUTRON_WEBSITE_API_KEY in its .env." -ForegroundColor Yellow
}
Write-Host @"

NEXT (required - otherwise the next git push DEACTIVATES the backend):
  wrangler.toml now contains the real resource ids (NOT secrets - safe to commit).
  Cloudflare redeploys from wrangler.toml on every push, so this MUST be committed:
    tell Claude the script finished - it will verify, commit and push wrangler.toml
    (or do it yourself: git add wrangler.toml ; git commit ; git push after the
     usual codex/origin checks).
  Then submit the live contact form once and check it appears in /admin.
"@
