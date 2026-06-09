# Phase Roadmap — Backend & Data Platform

Cloudflare-first, $0-to-start, built so the architecture can later be **replicated as
a product** for other industrial customers. Each phase is shippable on its own.

## Phase 1 — Capture + Data API + Admin  ✅ (this delivery)

**Goal:** the brand site captures structured inbound into Cloudflare D1, emits a
unified event stream, exposes a read-only Data API for the Agent Workspace, and gives
the operator a lightweight admin to triage it.

- [x] D1 schema + migration (`migrations/0001_init.sql`): `leads`, `rfqs`,
      `support_requests`, `download_requests`, `events`, `api_keys`.
- [x] Form APIs: `POST /api/contact` (now also persists), `POST /api/rfq`,
      `POST /api/support`, `POST /api/download-request` — validation, honeypot,
      Turnstile (graceful), rate-limit (graceful), `public_id`, event emission.
- [x] Read-only Data API `GET /api/v1/*`: `health`, `metadata`, the five resources,
      and `products`/`categories` — Bearer/X-API-Key auth, `since`/`cursor`/`limit`/
      `status`, sensitive-field stripping, unified envelope.
- [x] Internal admin `/admin/*`: single-admin login, list/detail, status + note edit,
      mark-spam, delete, CSV export.
- [x] Reusable core (`src/platform`) + docs + offline smoke test.

**Done when:** forms land in D1, the Agent can pull `/api/v1/*` with a key, the
operator can triage in `/admin`, and none of it can break the static site.

## Phase 2 — Resource Center + storefront link-up

**Goal:** turn download *requests* into actual gated file delivery, and start
joining brand-site data with the storefront.

- [ ] **R2 resource center.** Create the `gyutron-assets` bucket
      (`datasheets/ manuals/ brochures/ certificates/ application-notes/`). Add a
      file registry (D1 table or a committed manifest) carrying each file's
      `access_type` (`public` / `gated` / `manual_review`).
- [ ] **Gated download flow.** `public` → direct signed URL; `gated` → capture a
      `download_request` then issue a short-lived link; `manual_review` → request only.
- [ ] **Products → D1 (optional).** Keep the file catalog as source of truth, but add
      `datasheet_url` / `shop_sku` / `shop_url` joins (fields are already reserved in
      the product API shape).
- [ ] **Storefront events.** Have `shop.gyutron.com` post `order.created` /
      `quote.sent` into the same `events` stream (one connector), so the Agent sees
      marketing + commerce in one feed.
- [ ] **Multiple API keys.** Move from the single `DATA_API_KEY` to the `api_keys`
      table (scopes + revocation) — the auth layer already supports this path.
- [ ] **Outbound notifications.** Optional: notify sales on new RFQ (Resend), still no
      marketing automation.

## Phase 3 — Productization for other customers

**Goal:** make "deploy this backend for a new customer" a checklist, not a rewrite.

- [ ] **Connector spec.** Document the minimum a new customer's stack must expose to
      satisfy the Data API contract (so their site/ERP/CRM can feed the same Agent).
- [ ] **Re-skin via env.** Verify a clean deploy for a second data source using only
      `DATA_SOURCE_ID`/secrets + a customer-specific `schemas.mjs` form list.
- [ ] **Hardening.** Durable-Object or Workers Rate-Limiting-API limiter; audit-log
      table; per-key request metrics; backup/export job for D1.
- [ ] **Admin polish.** Saved filters, full-text search, bulk status changes,
      assignment/owner field — only as real usage demands.

## Explicitly NOT doing (any phase, unless re-scoped)

To keep the system simple, cheap, and maintainable, the following are **out of scope**
and should not be added opportunistically:

- Customer login / accounts on the **brand** site (those live on the storefront).
- Cart, orders, checkout, payment on the brand site.
- A heavy CRM / CMS / PIM / ERP, or SaaS dependencies (HubSpot, Airtable, Notion,
  Supabase, Strapi, Sanity…).
- OAuth / SSO, GraphQL, an API marketplace, multi-tenant billing, a large RBAC system.
- Outbound email *marketing* / drip automation.
- AI model calls inside the brand-site backend (the Agent Workspace owns AI; it
  *consumes* this API, it is not embedded here).
- Embedding the Agent Workspace into the brand-site admin (separate products on
  purpose — see [`backend-architecture.md`](./backend-architecture.md)).

## Guiding constraints (apply to every phase)

1. Cloudflare-first, free/low-cost to start.
2. Never break the live static site, its i18n, or its SEO.
3. Customer-agnostic core; GYUTRON specifics stay at the edges.
4. Reversible + testable; migrations are tracked, never ad-hoc table edits.
5. MVP first — don't build for scale or customers that don't exist yet.
