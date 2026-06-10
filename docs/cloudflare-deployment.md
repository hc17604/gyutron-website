# Cloudflare Deployment — Backend (D1 / R2 / Secrets / Migrations)

> This covers the **Phase 1 backend** (Data Layer + Data API). For the static-site /
> Worker-assets deploy basics see the repo-root [`../CLOUDFLARE_DEPLOYMENT.md`](../CLOUDFLARE_DEPLOYMENT.md)
> and [`../CONTACT_FORM_SETUP.md`](../CONTACT_FORM_SETUP.md).

## TL;DR — what ships vs. what you activate

The backend code is committed with **all D1/R2/KV bindings commented out** in
[`../wrangler.toml`](../wrangler.toml). In that state the Worker still serves the full
static site + the existing contact email, and the new endpoints simply report "not
configured" (503 / 401). **Nothing breaks on deploy.** You then *activate* features by
creating resources and uncommenting their binding. One-time setup, ~10 minutes.

> **Prerequisite:** `wrangler login` (the toolchain is already in `node_modules`; run
> commands from the repo root). Local development and `--local` migrations work
> without login; creating remote resources and deploying require it.

> **One-shot activation (Windows):** steps 1–2 + secrets + deploy + verification are
> automated in [`../scripts/activate-backend.ps1`](../scripts/activate-backend.ps1):
> `powershell -ExecutionPolicy Bypass -File scripts\activate-backend.ps1`
> After it succeeds, **commit + push the patched `wrangler.toml`** (the `database_id`
> is not a secret) — otherwise the next push redeploys with the binding commented out
> and the backend goes dormant again.

## 1. Create the D1 database

```bash
npx wrangler d1 create gyutron_db
```

Copy the printed `database_id` into `wrangler.toml` and **uncomment** the block:

```toml
[[d1_databases]]
binding = "DB"
database_name = "gyutron_db"
database_id = "<paste-the-id>"
migrations_dir = "migrations"
```

Apply the schema (local first, then production):

```bash
npx wrangler d1 migrations apply gyutron_db --local
npx wrangler d1 migrations apply gyutron_db --remote
```

Migrations live in [`../migrations/`](../migrations/) and are tracked in git. To add a
table/column later, create `migrations/0002_*.sql` and re-run `apply` — **never edit
tables ad-hoc.** D1 has no auto down-migration: to reverse, write a forward migration
that undoes it (and keep a backup, below).

## 2. Set secrets

```bash
npx wrangler secret put DATA_API_KEY      # bearer key the Agent Workspace uses
npx wrangler secret put ADMIN_PASSWORD    # enables + protects /admin
npx wrangler secret put ADMIN_SECRET      # (optional) HMAC key for the admin cookie
npx wrangler secret put IP_HASH_SALT      # salt for hashing client IPs
# already in use by the contact form:
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_FROM_EMAIL
# CONTACT_TO_EMAIL is optional (defaults to info@gyutron.com)
```

Generate strong values, e.g. `node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"`.
**Never commit secrets** — they go through `wrangler secret`, not `wrangler.toml`.

## 3. (Optional) R2 — resource center (Phase 2)

```bash
npx wrangler r2 bucket create gyutron-assets
```

Uncomment the `[[r2_buckets]]` block (binding `R2`). Suggested key layout:

```
datasheets/   manuals/   brochures/   certificates/   application-notes/
```

Access tiers map to `download_requests.access_type`: `public` (direct), `gated`
(capture a request, then a short-lived link), `manual_review` (request only — no file).
File serving is Phase 2; Phase 1 only records the request.

## 4. (Optional) KV — form rate limiting

```bash
npx wrangler kv namespace create RATE_LIMIT
```

Uncomment `[[kv_namespaces]]` and paste the id. Without it the limiter is a no-op.

## 5. Enable Turnstile on forms (optional)

All four forms (contact / request-quote / support-contact / download-request) already
carry the widget code, gated on a **BUILD-TIME** site key. Two keys, two different
mechanics — do them in THIS order:

1. Create a Turnstile widget in the Cloudflare dashboard → you get a **site key**
   (public) and a **secret key**.
2. **Site key = build-time.** Put it in `astro/.env` as
   `PUBLIC_TURNSTILE_SITE_KEY=<site-key>`, then **rebuild + redeploy the site**
   (`cd astro && npm run build`, sync changed `dist/*` → `public/`, commit + push).
   The key is baked into the page HTML at build time — setting it anywhere in
   Cloudflare does NOTHING; without a rebuild the widget will never appear.
   While the env var is empty (the default), forms render with NO widget and
   submissions are not blocked.
3. **Secret key = runtime worker secret.** ONLY after step 2 is live:
   `npx wrangler secret put TURNSTILE_SECRET_KEY`. The worker then enforces
   verification on all four forms. If you set the secret while the widgets are not
   live yet, every live form submission starts failing — that is why the order is
   widget-first. (While the secret is unset, the worker skips verification.)
4. Verify: submit a form in the browser (should pass) and
   `curl -X POST .../api/rfq -d '{"name":"x","email":"a@b.com","applicationDescription":"twelve chars+"}'`
   without a token (should now be rejected with "Anti-spam verification failed").

## 6. Deploy

The site auto-deploys on push to `main` (Cloudflare serves the committed `public/` and
the Worker from `wrangler.toml`). To deploy the Worker manually:

```bash
npm run deploy        # wrangler deploy --config wrangler.toml --assets ./public/
```

Validate the bundle without deploying (no login needed):

```bash
npx wrangler deploy --dry-run --outdir .wrangler/dry-run
```

## 7. Local development

```bash
# one-time: local secrets in a gitignored .dev.vars (NOT committed)
#   DATA_API_KEY=dev-key
#   ADMIN_PASSWORD=dev-pw
#   IP_HASH_SALT=dev-salt
npx wrangler d1 migrations apply gyutron_db --local
npx wrangler dev                       # http://localhost:8787
```

Then exercise it:

```bash
curl http://localhost:8787/api/v1/health
curl -X POST http://localhost:8787/api/rfq -H 'content-type: application/json' \
  -d '{"name":"Test","email":"t@e.com","applicationDescription":"Inline vision inspection trial run."}'
curl -H "Authorization: Bearer dev-key" http://localhost:8787/api/v1/rfqs
```

Offline logic test (no wrangler/D1 needed):

```bash
node scripts/smoke-platform.mjs
```

## 8. Rollback / kill switch

- **Soft disable (no code change):** delete the relevant secret/binding. The endpoint
  reverts to "not configured" and the static site + contact email keep working. This
  is the safest first move if a backend endpoint misbehaves.
- **Worker rollback:** `npx wrangler rollback` (or `wrangler deployments list` →
  rollback to a prior version).
- **Code rollback:** `git revert <commit>` and push.
- **D1 backup before risky changes:** `npx wrangler d1 export gyutron_db --remote --output backup.sql`.

## Environment variable reference

| Name                  | Type   | Purpose                                              |
| --------------------- | ------ | ---------------------------------------------------- |
| `DB`                  | binding| D1 database (leads/rfqs/support/downloads/events/keys)|
| `R2`                  | binding| R2 bucket for the resource center (Phase 2)          |
| `RATE_LIMIT`          | binding| KV namespace for form rate limiting                  |
| `ASSETS`              | binding| static-site assets (existing — do not rename)        |
| `DATA_API_KEY`        | secret | bearer key for `GET /api/v1/*`                       |
| `ADMIN_PASSWORD`      | secret | enables + protects `/admin`                          |
| `ADMIN_SECRET`        | secret | (optional) HMAC key for the admin session cookie     |
| `IP_HASH_SALT`        | secret | salt for hashing client IPs                          |
| `TURNSTILE_SECRET_KEY`| secret | enables server-side Turnstile verification           |
| `RESEND_API_KEY`      | secret | contact-form email (existing)                        |
| `CONTACT_FROM_EMAIL`  | secret | verified Resend sender (existing)                    |
| `CONTACT_TO_EMAIL`    | var    | recipient (optional; default info@gyutron.com)       |
| `DATA_SOURCE_ID`/`_NAME` | var | data-source identity in API `meta` (re-skin per customer) |
