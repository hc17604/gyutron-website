# GYUTRON Operations — independent instance starter

Source application **2026.11.04.10**, migrations **0001–0010**, backup **format 4**.
The manifest and release evidence identify the delivered commit and actual checks.
This README does not claim the new production release or a second customer
instance has passed acceptance.

Includes CRM/contacts/saved views, preserved enquiry/event operations, customer
work and immutable quotations; sources/CSV imports/commerce analytics; reports,
13 rules/policies and scheduled automations; real Agent conversations, Memory,
text documents and model settings; notifications, users, audit, security,
backup, health and instance/license state. Fixed workspace labels support English and Chinese only; English is the default.
Older interface-language preferences are reset to English for this release. New
explicit Chinese preferences are remembered in the browser. Unsupported language
settings fall back to English. Historical German/Japanese reports, conversations and
quotation print records remain readable; user content is not automatically translated.

`/` redirects to protected `/admin`; `/health` returns only `{ "status": "ok" }`.
Only necessary brand assets are allowlisted. No public website forms, public Data
API, Shop host mapping, checkout or payment flow are exposed. Each customer needs
separate Worker/D1/private R2/KV resources. This is not shared database tenancy,
self-service provisioning, subscription billing or a complete accounting ERP.

## 1. Verify the package

Use Node **24** (`.node-version`: 24.16.0), the committed lock file and pinned
Wrangler **4.93.1**. Verify the outer ZIP checksum and the exact files/provenance
in `SOURCE-MANIFEST.json` and `FILE-SHA256SUMS.txt`.

```powershell
npm ci
npm run check
npm test
```

The actual test command covers business/auth/quotations/backup/exact aggregation,
workspace contacts/views, operations, intelligence and controller cross-reviews,
notifications, bulk UI, license issuer and frontend checks. Inspect `package.json`
for its exact list. Intentional failure tests must still report final success.
Synthetic/provider protocol tests do not prove a real external LLM call succeeded.

No production resource IDs, credentials, customer data, dumps, issuer private
keys, local state or installed dependencies belong in the source package.
Installation/checks/tests do not create cloud resources. Review actual dependency
LICENSE/NOTICE files and `docs/admin-technology-notices.md`. Source distribution,
support and trademarks require an actual agreement; `private: true` is not an
open-source license or white-label grant. Cloudflare hosted services retain their
own terms despite workerd being open source.

## 2. Select resources and create configuration

Create/select the intended customer's Worker, D1, private R2 and KV in the correct
Cloudflare account. Disable r2.dev and public bucket domains. Replace placeholders:

```powershell
node scripts/configure-instance.mjs --worker-name REPLACE_WORKER_NAME --database-name REPLACE_DATABASE_NAME --database-id REPLACE_D1_UUID --kv-id REPLACE_KV_ID --r2-bucket REPLACE_PRIVATE_BUCKET --instance-id REPLACE_INSTANCE_ID --workspace-name "GYUTRON" --time-zone "Asia/Singapore"
```

The script validates and creates a new `wrangler.toml`, rejects placeholders and
existing configuration, and neither provisions resources nor sets secrets.
Keep `DB`, `R2`, `RATE_LIMIT`, `ASSETS` bindings. Never reuse GYUTRON production IDs.
Display names and instance IDs do not provide database isolation.

## 3. Secrets, login and local acceptance

Enter secrets interactively, never in command arguments, tracked files or screenshots:

```powershell
npx wrangler login
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put IP_HASH_SALT
npx wrangler secret put WORKSPACE_ENCRYPTION_KEY
```

Use independent per-instance values. The owner chooses its password; do not alter
existing GYUTRON credentials or login mode without its owner's instruction.
`WORKSPACE_ENCRYPTION_KEY` must contain at least 32 high-entropy characters when
saving model credentials. Preserve the exact master secret separately for recovery;
the database snapshot cannot replace it.

Default sign-in asks for the owner password only. An explicitly approved customer
can set `ADMIN_LOGIN_MODE = "team"` in `[vars]` for optional named-staff email entry;
owner email may stay blank. Shared owner users share one audit identity, private
conversation principal and notification receipts. Named attribution needs named
accounts. No email invitation/password recovery, SSO or MFA is implied.

Set `ADMIN_TIMEZONE` to the actual IANA business time zone. Custom model HTTPS hosts
require explicit `MODEL_API_ALLOWED_HOSTS`. Optional `LICENSE_VERIFY_PUBLIC_KEY`
is public SPKI base64url. `INTELLIGENCE_OWNED_DEPLOYMENT=true` is only for an actual
self-owned deployment, never a substitute for a customer's commercial activation.

For local development create ignored `.dev.vars` with dummy secrets only:

```powershell
npm run migrate:local
npm run dev -- --port 8797
```

Local state is `.wrangler/state`; local acceptance is not production-resource proof.

## 4. Real sources and local collector

The standalone inbox does not automatically connect a customer's website, email,
Alibaba, Shopify or other CRM. The main website deployment can read its existing
local submissions; each external integration needs separate acceptance.

CSV preview/import supports `orders`, `order_items`, `customers`, `payments`, at
most 1 MiB/500 rows per CSV and 2 MiB per request. Stable source/external identities,
resumable outcomes and duplicate guards apply. It is not a universal CRM importer.

For chosen local exports, use a separate folder per target/source/entity.
The collector reads direct folder files and obtains the owner password from its
process environment:

```powershell
$gyutronCollectorPassword = Read-Host 'Owner password' -AsSecureString
$env:GYUTRON_ADMIN_PASSWORD = [Net.NetworkCredential]::new('', $gyutronCollectorPassword).Password
try {
  node scripts/local-source-sync.mjs --url https://CUSTOMER_WORKSPACE --source SRC_FROM_DATA_SOURCES --folder D:/Customer/exports/orders --entity orders
} finally {
  Remove-Item Env:\GYUTRON_ADMIN_PASSWORD
}
```

For knowledge use `--folder D:/Customer/knowledge --entity documents` and omit
`--source`. Optional `--interval 5` keeps this process running (5–1440 minutes);
`--mapping` selects a CSV mapping JSON. Commerce uses CSV; knowledge uses `.txt`/`.md`.
It actually uploads selected content, stores hashes/checkpoints in
`.gyutron-source-state.json`, resumes work and skips unchanged files. It does not
recurse, scan old Agent databases/secrets, parse PDF/Office bodies or install a
Windows service. Deleting local files does not remove remote records. HTTPS is
required except explicit local development addresses.

Analytics labels **paid order value before refunds**: original paid/fulfilled/
partially-refunded/refunded order totals count once. Imported payment reconciliation
shows paid/refunded/difference separately, not accounting net revenue or proof of
a complete ledger. Currencies stay separate with exact minor units; no invented FX.

## 5. Agent, rules and signed license

Agent defaults to deterministic local answers. Users select CRM and last-30-day
compact commerce summaries, rules, Memory and documents; actual supplied sources
are cited. Tools are bounded read-only queries and drafts, not automatic emails,
calls or external platform changes.

Text/Markdown knowledge stores filename/source/version and SHA of stored UTF-8
text. Each document is at most **200 KiB (204800 bytes)**; each conversation selects
at most **8 documents**, not an eight-document library limit. Each excerpt is at
most 12000 characters with offsets/truncation and an overall context budget. This
is keyword/window retrieval, not vector search or binary document parsing.

Provider keys are AES-GCM encrypted. Known providers or explicitly allowed HTTPS
hosts only; redirects/local IP destinations are rejected. Changing provider/host
requires a new key or clearing/disabling it. Model use requires explicit per-request
summary consent and the current configuration version; only compact facts,
selected excerpts and bounded history are sent, not raw tables. Testing a provider
also contacts it and must be explicitly confirmed. Local answers/protocol tests
are not proof of real external provider success.

The 13 rules/policies cover enquiry/support/download follow-up, data hygiene,
duplicates, product opportunity, cart signals, paid-unfulfilled orders, high views
without enquiry, RFQ surge, priority countries/categories and internal-test
exclusion. Calendar schedules use the business IANA zone or intervals. The
one-minute cron advances bounded work, not a second-accurate SLA. Runs/retries,
findings and report snapshots are real, with documented retention. Pausing a rule
does not cancel already queued snapshots. In-workspace alerts do not prove an
external recipient is connected.

An authorized operator may create signing keys **outside Git** and issue a token:

```powershell
node scripts/issue-instance-license.mjs --init-keypair --directory D:/PRIVATE/issuer-keypair
node scripts/issue-instance-license.mjs --private-key D:/PRIVATE/issuer-keypair/private-key.pkcs8.pem --instance INS_EXACT_FROM_CUSTOMER_LICENSE_PAGE --customer "Customer company" --expires 2027-12-31T23:59:59Z --out D:/DELIVERY/customer.license
```

Use `--help` for plan/features/not-before options. Configure only the generated
public base64url value as `LICENSE_VERIFY_PUBLIC_KEY` in the customer Worker.
Keep unencrypted PKCS8 private keys in an access-controlled issuer location, never
in the package/Worker; Windows file mode does not establish NTFS ACLs. This tool
does not upload or activate anything. An owner activates on the exact instance;
signature/expiry/history are real. Missing verification/activation is shown honestly.
Existing features are not automatically blocked: this is not DRM, subscription
billing or full entitlement enforcement.

## 6. Deploy, back up and recover

```powershell
npm test
npm run build
npm run migrate:remote
npm run deploy
```

The last two commands modify the configured customer's resources. Verify destination
IDs and preserve a trusted recovery point first. Apply incremental migrations;
do not edit historical files or overwrite live data with an older snapshot.

The template schedules operations every minute and backup daily at 18:00 UTC
(02:00 next day in Singapore). Confirm the deployed cron. Format4 covers **43
persistent business tables**, plus `d1_migrations` when present (**44 data tables**).
Restored sessions/login attempts are empty. Capture limits remain 25000 rows/8 MiB
full JSON; explicit failures never mean truncated success. Verified commit markers
retain 30 daily dates/12 weekly dates; unmarked objects need operator review.
The JSON is sensitive, not whole-file encrypted.

Owner-only listings/downloads and password-reauthenticated creation/verification
are available. The download SHA header identifies the original JSON, even for SQL.
Check trusted whole-file SHA before executing stored schema DDL. In a private
ignored directory with **new** output targets:

```powershell
node scripts/recover-workspace.mjs --snapshot .wrangler/private-recovery/snapshot.json --sql .wrangler/private-recovery/restore.sql --database .wrangler/private-recovery/restored.sqlite --sha256 REPLACE_VERIFIED_SNAPSHOT_SHA256
```

The command writes local SQLite/SQL only and checks integrity, foreign keys and
counts. Long text uses bounded SQL staging fragments, reconstructed before the
business INSERT, then staging is removed. A current format4 isolated D1 rehearsal
restored all 44 data tables, full 200 KiB text and seven other documents, matching
content with integrity ok, zero foreign-key errors and no staging table. This is
not a remote production restore or this customer's acceptance.

Restore the original `WORKSPACE_ENCRYPTION_KEY` separately or re-enter model keys;
a different master cannot decrypt existing ciphertext. Issuer private keys stay
separate. Test the recovered instance before a controlled maintenance cutover.
Rollback code must understand migrations through0010 and format4; older `.2` does
not cover new tables. Worker rollback does not rewind D1/R2.

After deployment verify actual login/roles/CSRF/logout, source imports/dedupe,
CRM relations/conflicts, quotations/printing, Agent citations/consent, scheduled
rules/retries, notification scope, private R2 readback and isolated restore. Record
actual versions/hashes, secret recovery ownership, capacity, alert recipients and
support duties. No external connection, accounting compliance, SLA, RPO/RTO or
second customer deployment is claimed without evidence. Branding/links/print issuer
details and trademark permissions need review; a display-name edit is not full
white labeling.

References: `docs/admin-commercial-deployment.md`, `docs/admin-backup-recovery.md`,
`docs/admin-technology-notices.md`.


## Test mode for customer demonstrations

Use the square **Test mode** switch immediately after workspace search, or open `/admin?test=1` after signing in. All22 modules have connected synthetic records. The active DEMO indicator and local exports identify sample content. Mode changes check unsaved work and pending operations, then reload the workspace; sample changes reset on a document reload. Switching off reads the original live workspace again.

Test mode uses an in-memory adapter, never live business requests, external models or production backups. CSV/JSON and quotation print views are generated locally. Every future admin module/API/action change must update its demo fixture and scenario. Run `npm run check:admin-demo`; see `docs/admin-demo-mode.md` for the isolation and coverage contract.
