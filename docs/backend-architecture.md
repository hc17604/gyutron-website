# Backend Architecture (Phase 1)

> Scope: the **brand-site backend and Data API** added in Phase 1. The front-end
> Astro architecture is documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md); this
> document covers everything server-side: data capture, storage, the read-only
> Data API, and the internal admin.

## 1. The three systems (and why they are separate)

```
        ┌─────────────────────────┐        ┌──────────────────────────┐
        │   gyutron.com           │        │   shop.gyutron.com        │
        │   Brand site (Astro)    │        │   Storefront (separate)   │
        │   - Marketing / SEO     │        │   - SKUs / cart / orders  │
        │   - Contact / RFQ /     │        │   - Customer accounts     │
        │     Support / Download  │        │   - Payment               │
        │   - NO customer login   │        │   - Login lives HERE      │
        └───────────┬─────────────┘        └─────────────┬────────────┘
                    │  POST /api/*                        │ (future: order events)
                    ▼                                     ▼
        ┌───────────────────────────────────────────────────────────────┐
        │   GYUTRON Data Layer  (Cloudflare Worker + D1 + R2)            │
        │   - leads / rfqs / support_requests / download_requests       │
        │   - events  (unified stream)                                  │
        │   - api_keys                                                  │
        └───────────────────────────────┬───────────────────────────────┘
                                         │  GET /api/v1/*  (Bearer key, read-only)
                                         ▼
        ┌───────────────────────────────────────────────────────────────┐
        │   GYUTRON Agent Workspace / Command Center  (separate product) │
        │   - reads the Data API, never the database                    │
        │   - daily digests, alerts, automations, "老板驾驶舱"           │
        └───────────────────────────────────────────────────────────────┘
```

**Why the brand site has no customer login.** The brand site's job is to *generate
qualified inbound* (leads, RFQs, support requests, gated-download requests) and rank
well in search. Authentication, carts, orders, and payment are storefront concerns
and live on `shop.gyutron.com`. Keeping the brand site free of sessions/accounts
keeps it fully static + cacheable (fast, cheap, SEO-friendly) and removes a whole
class of security surface. The only privileged surface on the brand host is the
single-admin `/admin` panel — an internal tool, not a customer portal.

**Why the Agent Workspace reads an API, not the database.** The Agent Workspace is a
*product we intend to sell*. If it queried D1 directly it would be welded to GYUTRON's
schema and to Cloudflare. Instead it consumes a **stable, versioned, customer-agnostic
Data API**. GYUTRON is simply the *first data source*. A future customer who runs a
different stack (their own site + an ERP/CRM/e-commerce backend) only has to expose a
connector with the same contract, and the same Agent works unchanged. The API is the
product boundary; the database is an implementation detail behind it.

## 2. Deploy model — Worker + Static Assets (NOT Pages)

The site deploys as a **Cloudflare Worker with a Static Assets binding**, configured
in [`../wrangler.toml`](../wrangler.toml):

```toml
main = "src/worker.mjs"
[assets]
directory = "./public"      # the committed, pre-built static site
binding = "ASSETS"
run_worker_first = true     # the Worker sees every request first
```

`run_worker_first = true` means **`src/worker.mjs` is the front door for every
request.** It routes a small set of dynamic paths and falls through to `ASSETS` for
everything else:

| Path (brand host only)        | Handler                              |
| ----------------------------- | ------------------------------------ |
| `POST /api/contact`           | `src/contact-handler.mjs`            |
| `POST /api/rfq`               | `src/api/forms.mjs`                  |
| `POST /api/support`           | `src/api/forms.mjs`                  |
| `POST /api/download-request`  | `src/api/forms.mjs`                  |
| `GET  /api/v1/*`              | `src/api/data.mjs` (+ `products.mjs`)|
| `*    /admin/*`              | `src/api/admin.mjs`                  |
| `shop.gyutron.com/*`          | storefront rewrite (unchanged)       |
| everything else               | `env.ASSETS.fetch` (the static site) |

The `functions/api/contact.js` file in the repo root is a **legacy Pages-Functions
adapter and is NOT used** by this deploy model.

## 3. Graceful degradation (the safety contract)

Every new capability is **optional and self-disabling**. The Worker must never break
the static site or the existing contact flow because a backend resource is missing.

| If this is absent…              | …then                                                            |
| ------------------------------- | ---------------------------------------------------------------- |
| `DB` (D1) binding               | form writes return 503 (contact still emails); Data API list → 503 |
| `R2` binding                    | gated-download serving is disabled (Phase 2)                     |
| `RATE_LIMIT` (KV)               | the rate limiter is a no-op                                      |
| `TURNSTILE_SECRET_KEY`          | Turnstile verification is skipped                                |
| `DATA_API_KEY` (and no api_keys)| the Data API is locked (401) — fails closed                      |
| `ADMIN_PASSWORD`                | `/admin` is disabled (login always fails)                        |
| `RESEND_API_KEY`/from           | contact email is skipped (D1 capture still succeeds)             |

This is why **`wrangler.toml` ships with the D1/R2/KV bindings commented out**: an
uncommented binding with a placeholder id would fail the production deploy. You add
each binding only after creating the resource (see
[`cloudflare-deployment.md`](./cloudflare-deployment.md)).

## 4. Module layout — reusable core vs. site glue

The backend is split so the reusable, customer-agnostic core (`src/platform`) is
clean of GYUTRON specifics, and the GYUTRON-specific wiring is thin.

```
src/
  worker.mjs              # router / front door
  contact-handler.mjs     # GYUTRON's live contact form (email + D1)
  platform/               # ── reusable core (the part we replicate) ──
    config.mjs            # data-source IDENTITY (env-overridable), API version, table registry
    response.mjs          # unified envelopes: form { ok,message } / data { data,pagination,meta }
    ids.mjs               # public_id + event_id generation (PREFIX-YYYYMMDD-XXXXXX)
    validate.mjs          # schema-driven validation + normalization (pure)
    schemas.mjs           # SINGLE SOURCE OF TRUTH: form fields, status vocab, column allow-lists, API projections
    csv.mjs               # RFC-4180 CSV export
    request.mjs           # privacy-safe request context (salted IP hash, country, UA)
    db/
      client.mjs          # getDb(env) + graceful null
      repository.mjs      # generic, injection-safe D1 access (insert/list/get/update/delete/count)
      events.mjs          # emitEvent → events table
      submit.mjs          # recordSubmission = insert + event + id-retry
    security/
      hash.mjs            # SHA-256, HMAC, constant-time compare (Web Crypto)
      auth.mjs            # Data API key auth (env key now; api_keys table later)
      admin-auth.mjs      # signed-cookie admin session
      turnstile.mjs       # Turnstile verify (graceful)
      ratelimit.mjs       # KV fixed-window limiter (graceful)
  api/
    forms.mjs             # POST /api/{rfq,support,download-request}
    data.mjs              # GET /api/v1/* (read-only)
    products.mjs          # GET /api/v1/products|categories (normalizes the file catalog)
    admin.mjs             # /admin/* (server-rendered HTML)
migrations/
  0001_init.sql           # D1 schema
```

**The dividing line:** to re-skin this backend for a new customer you change
*environment variables* (`DATA_SOURCE_ID`, secrets) and the form `schemas.mjs` field
list — not the core. Nothing in `src/platform` hard-codes "GYUTRON".

## 5. Data model (see [`../migrations/0001_init.sql`](../migrations/0001_init.sql))

Five capture tables + one stream + one auth table. Conventions:

- **`public_id`** (`RFQ-20260610-7K3QF2`) is the external identifier; the integer
  `id` is the internal incremental cursor (never exposed by the API).
- **Timestamps** are ISO-8601 UTC text.
- **Privacy:** raw IPs are never stored — only a salted `ip_hash` and the coarse
  `ip_country`.
- **No `tenant_id`.** Multi-customer = one database + one Worker per customer
  (tenancy at the deployment boundary). This keeps every query single-tenant-simple
  and avoids a cross-tenant data-leak class entirely.
- **`events`** is append-only. Every submission writes one row (`lead.created`,
  `rfq.created`, `support.created`, `download.requested`) so the Agent can build
  digests from a single ordered feed instead of polling each table. Future commerce
  signals (`order.created`, `quote.sent`, `followup.overdue`) use the same shape.

## 6. Request lifecycle — a form submission

```
POST /api/rfq
  → worker.mjs routes to forms.mjs("rfq")
  → parse JSON (400 on failure)
  → honeypot filled?           → 200 OK (silently dropped)
  → Turnstile verify           → skip if unconfigured, else 400 on failure
  → rate limit (per ip+form)   → skip if no KV, else 429
  → validate vs schemas.FORMS.rfq  → 400 with per-field errors
  → build row (validated + utm/source meta + salted ip_hash + timestamps)
  → recordSubmission: INSERT rfqs (id-retry) + INSERT events('rfq.created')
  → 200 { ok:true, message, id:"RFQ-…" }
```

## 7. Phase boundary

Phase 1 delivers capture + the read-only Data API + admin + the data contract.
Explicitly **not** in Phase 1: customer login, cart/orders/payment, outbound email
marketing, CRM/CMS/ERP integrations, OAuth, GraphQL, multi-tenant billing, R2 file
serving, and any AI model calls. See [`phase-roadmap.md`](./phase-roadmap.md).
