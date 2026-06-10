# Customer Data Layer — deployment template

A deployable "forms + D1 + read-only Data API + admin" worker for ANY customer
website, built on this repo's customer-agnostic core (`src/platform`, `src/api`).
**Design choice:** the template is a THIN entry importing the shared core in
place (not a copied fork) — one core, many deployments, zero code drift. A
customer deployment = one wrangler.toml + one D1 + three secrets.

## 15-minute deploy (run from the REPO ROOT; `npx wrangler login` once)

```powershell
$C = "acme-demo"   # customer slug

# 1. config — copy the example and fill the placeholders
mkdir template/data-layer/deployments/$C
cp template/data-layer/wrangler.toml.example template/data-layer/deployments/$C/wrangler.toml
#    edit: name, DATA_SOURCE_ID/NAME, database_name

# 2. resources
npx wrangler d1 create ${C}_db          # paste database_id into the toml
npx wrangler d1 migrations apply ${C}_db --remote --config template/data-layer/deployments/$C/wrangler.toml

# 3. secrets (generate strong values; the API key goes to the customer's agent workspace)
npx wrangler secret put DATA_API_KEY   --config template/data-layer/deployments/$C/wrangler.toml
npx wrangler secret put ADMIN_PASSWORD --config template/data-layer/deployments/$C/wrangler.toml
npx wrangler secret put IP_HASH_SALT   --config template/data-layer/deployments/$C/wrangler.toml

# 4. deploy (gets a *.workers.dev URL; map a custom domain later if wanted)
npx wrangler deploy --config template/data-layer/deployments/$C/wrangler.toml
```

## Acceptance curls (every step has an expected output)

```bash
B=https://<worker>.workers.dev
curl $B/api/v1/health                       # {"status":"ok","source":"<customer>-website",...}
curl -X POST $B/api/rfq -H 'content-type: application/json' \
  -d '{"name":"Test","email":"t@e.com","applicationDescription":"twelve characters at least"}'
                                            # {"ok":true,"id":"RFQ-..."}
curl -H "Authorization: Bearer <DATA_API_KEY>" $B/api/v1/rfqs        # the row above
curl -H "Authorization: Bearer <DATA_API_KEY>" $B/api/v1/events      # rfq.created event
# browser: $B/admin → ADMIN_PASSWORD → row visible, status editable, CSV export
```

## What's included / excluded

Included: 4 form APIs (validation, honeypot, optional Turnstile, rate-limit),
events stream, read-only `/api/v1/*` (Bearer key, since/cursor paging), single
admin, D1 migrations (shared `migrations/`), graceful degradation everywhere.
Excluded BY DESIGN: static site hosting, product catalog (`/api/v1/products`
returns 404 here), resource-center file delivery — site-specific concerns.

The customer's forms POST to this worker (CORS-open form endpoints); the
customer's agent workspace reads `/api/v1/*` with the DATA_API_KEY.

Hooking Turnstile / Resend later: identical to the main site
(docs/cloudflare-deployment.md §5 / CONTACT_FORM_SETUP.md).
