# GYUTRON Operations — independent instance starter

This package contains a dedicated Operations Worker: CRM, customer work,
industrial quotations, audit, system status and private backups. It has no Shop
host mapper, public website form endpoints, public Data API or payment flow.
`/` redirects to `/admin`; `/health` returns only `{ "status": "ok" }`.

The default GYUTRON sign-in asks for the deployment owner password only, as
selected for this product. The installer preserves that default. A separately
approved instance can explicitly enable the named-staff email entry by adding
`ADMIN_LOGIN_MODE = "team"` under `[vars]` in its own `wrangler.toml` and deploying
that configuration. Team mode uses active named accounts and existing server-side
roles; the owner can leave its email blank. Do not enable it for GYUTRON or another
instance without the instance owner's explicit choice.

## 1. Verify the package

Use Node **24** (`.node-version`: 24.16.0) and the committed lock file. Wrangler is
fixed at **4.93.1**. Check the outer ZIP SHA-256 against `SHA256SUMS.txt` supplied
with it; `SOURCE-MANIFEST.json` identifies the exact source commit and every file.

```powershell
npm ci
npm run check
npm test
```

The five smoke suites cover the business API, authentication, exact quotations,
backup/recovery and large mixed-currency aggregation. Failure-path tests include
intentional storage errors; each final JSON summary must report `failed: 0`.

The ZIP contains no credentials, production resources, customer records,
database dumps, local state or installed dependency directories. It does not
create any Cloudflare resources when opened, installed, checked or tested.

## 2. Select separate resources and create configuration

An operator must create or select and verify resources belonging to this new
customer in the intended Cloudflare account: one Worker, one D1 database, one
private R2 bucket and one rate-limit KV namespace. This starter does not create,
replace or guess those resources. Keep the bucket's public r2.dev access disabled
and do not attach a public bucket domain.

Replace the obvious `REPLACE_*` values in this example with the verified new
resource values. The script rejects placeholders and writes a new `wrangler.toml`;
it does not contact Cloudflare or overwrite an existing configuration.

```powershell
node scripts/configure-instance.mjs --worker-name REPLACE_WORKER_NAME --database-name REPLACE_DATABASE_NAME --database-id REPLACE_D1_UUID --kv-id REPLACE_KV_ID --r2-bucket REPLACE_PRIVATE_BUCKET --instance-id REPLACE_INSTANCE_ID --workspace-name "GYUTRON" --time-zone "Asia/Singapore"
```

Do not paste GYUTRON production binding IDs into a different customer's instance.
The script validates syntax; resource ownership, privacy and separation require
the operator's actual account checks.

## 3. Configure secrets and local development

Production secrets are entered through the interactive CLI, never a command
argument, tracked file or screenshot:

```powershell
npx wrangler login
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put IP_HASH_SALT
```

Use independent long random values for each instance. The instance owner chooses the deployment password; the current owner flow does
not enforce the staff password policy. Preserve the actual credentials in the
customer's password manager and document who controls recovery access.

For local development only, create an ignored `.dev.vars` with local dummy
`ADMIN_PASSWORD`, `ADMIN_SECRET` and `IP_HASH_SALT` values. Never copy production
secrets into a development test. Then:

```powershell
npm run migrate:local
npm run dev -- --port 8797
```

Open the printed local `/admin` URL. Its database, files and KV are local to
`.wrangler/state`; a successful local test is not production-resource proof.

## 4. Validate and deploy the intended instance

```powershell
npm test
npm run build
npm run migrate:remote
npm run deploy
```

The last two commands modify the resources in this instance's configured account.
Before an upgrade, preserve a verified database export/recovery point and confirm
the destination IDs. Apply incremental migrations; do not edit old migration files
or overwrite live data with an older snapshot.

After deployment verify `/admin`, `/health`, session/CSRF/role behavior, real
customer→opportunity→task workflows, exact USD/JPY quotations and immutable
revisions, printing, private backup readback and an isolated restore. Record the
deployed Worker version and actual resource ownership. Domain setup and billing
are operator responsibilities; no custom domain is silently attached.

## 5. Data connections, branding and recovery

This standalone entry does not collect public website enquiries. Its inbox starts
with the actual contents of its own database. Connecting a customer's website,
email or other service requires a separately reviewed integration and end-to-end
acceptance; installation does not create those connections.

The source retains GYUTRON identity, logos and website links. White-label branding,
printed issuer details and trademark permissions must be reviewed for each
commercial agreement. A display-name change is not complete white labeling.

- Deployment and commercial responsibilities: `docs/admin-commercial-deployment.md`.
- Backup limits, private markers and isolated recovery: `docs/admin-backup-recovery.md`.
- Actual technology and license boundaries: `docs/admin-technology-notices.md`.
- Per-file provenance and SHA-256: `SOURCE-MANIFEST.json` and `FILE-SHA256SUMS.txt`.

The JSON backup supports at most 25,000 persistent rows and an 8 MiB full payload;
it fails visibly rather than truncating. Larger or longer-running deployments
need a verified native export/Time Travel or a separately accepted backup job.
Restored sessions are empty. Credentials are restored or rotated independently.
No uptime, financial compliance, RPO or RTO is claimed without actual acceptance.
