# Data API Contract (v1)

The read-only API the **GYUTRON Agent Workspace** (and, later, other customers'
agents) consume. Designed **customer-agnostic**: GYUTRON is the first data source, but
the shapes below are intended to be reused. Source of truth for fields:
[`../src/platform/schemas.mjs`](../src/platform/schemas.mjs) (`API_FIELDS`).

- **Base:** `https://www.gyutron.com/api/v1`
- **Method:** `GET` only (the API is strictly read-only).
- **Versioning:** the version is in the path (`/api/v1`). A breaking change ships as
  `/api/v2` alongside v1.

## Authentication

Send the key as either header (TLS only):

```
Authorization: Bearer <DATA_API_KEY>
# or
X-API-Key: <DATA_API_KEY>
```

- Phase 1 uses a single key from the `DATA_API_KEY` secret. Additional keys with
  scopes/revocation are read from the `api_keys` table when present (forward path).
- **Fails closed:** every endpoint except `/health` returns `401` if no key is
  configured or the key is wrong. Comparison is constant-time.
- Auth is header-based (never cookies), so the permissive `Access-Control-Allow-Origin: *`
  is safe — a browser on another origin still cannot read data without the key.

## Response envelope

**Collections / records**

```json
{
  "data": [ /* rows, or a single object for /products/:id */ ],
  "pagination": { "limit": 50, "next_cursor": 1234 },
  "meta": { "source": "gyutron-website", "api_version": "v1", "generated_at": "2026-06-10T09:00:00.000Z" }
}
```

**Errors**

```json
{ "error": { "code": "unauthorized", "message": "Missing or invalid API key." },
  "meta": { "source": "gyutron-website", "api_version": "v1", "generated_at": "…" } }
```

Error codes: `unauthorized` (401), `not_found` (404), `method_not_allowed` (405),
`invalid_status` (400), `data_store_unavailable` (503), `internal_error` (500).

## Pagination & incremental sync

| Param    | Applies to        | Meaning                                                        |
| -------- | ----------------- | ------------------------------------------------------------- |
| `limit`  | all collections   | page size, `1..200` (default `50`)                            |
| `cursor` | the 5 D1 resources| return rows with internal `id > cursor`                       |
| `since`  | the 5 D1 resources| return rows with `created_at >= since` (ISO-8601)             |
| `status` | leads/rfqs/support/downloads | filter by a valid status (see vocab) |

**Cursor model.** Rows are ordered by an internal autoincrement id ascending;
`next_cursor` is the last id on the page (or `null` when the page wasn't full). This
is stable under concurrent inserts, so an incremental sync never misses or
double-reads. The Agent's sync loop:

```
cursor = saved_cursor            # 0 on first run
loop:
  GET /api/v1/rfqs?cursor=<cursor>&limit=200
  process(data)
  if pagination.next_cursor == null: break
  cursor = pagination.next_cursor
save(cursor)
```

The internal `id` itself is **not** returned in row bodies — only via `next_cursor`.

## Endpoints

### `GET /api/v1/health` — public, no auth
```json
{ "status": "ok", "api_version": "v1", "source": "gyutron-website",
  "time": "…", "capabilities": { "db": true, "r2": false, "turnstile": false, "email": true, "data_api": true, "admin": true } }
```

### `GET /api/v1/metadata` — resource catalog + row counts
Lists every resource, its path, returned fields, supported filters, the product
locales, runtime capabilities, and (if D1 is bound) a `counts` map per resource.

### `GET /api/v1/leads`
Fields: `public_id, type, name, company, email, phone, country, product_interest,
message, source_page, locale, utm_source, utm_medium, utm_campaign, ip_country,
status, created_at, updated_at`
Status vocab: `new · reviewing · replied · closed · spam`

### `GET /api/v1/rfqs`
Fields: `public_id, name, company, email, phone, country, product_category,
product_model, industry, quantity, application_description, timeline, source_page,
locale, utm_source, utm_medium, utm_campaign, ip_country, status, created_at, updated_at`
Status vocab: `new · reviewing · waiting_for_info · quoted · won · lost · spam`

### `GET /api/v1/support-requests`
Fields: `public_id, name, company, email, product_model, serial_number, issue_type,
message, source_page, locale, utm_source, utm_medium, utm_campaign, ip_country,
status, created_at, updated_at`
Status vocab: `new · reviewing · replied · closed · spam`

### `GET /api/v1/download-requests`
Fields: `public_id, name, company, email, country, requested_file, product_model,
access_type, source_page, locale, utm_source, utm_medium, utm_campaign, ip_country,
status, created_at, updated_at`
Status vocab: `new · approved · rejected · fulfilled · spam` · access_type: `public · gated · manual_review`

### `GET /api/v1/events`
Fields: `event_id, event_type, entity_type, entity_id, source, payload, created_at`
(`payload` is the parsed JSON of the stored `payload_json`.)
Event types (Phase 1): `lead.created · rfq.created · support.created · download.requested`.
`entity_id` is the related row's `public_id`. Filters: `since`, `cursor`, `limit`.

### `GET /api/v1/products` · `?locale=en|de|ja` · `?category=<slug>`
Array of products normalized from the file catalog. Fields: `id` (slugified model),
`model, category, category_title, title, short_description, kind, specs` (object),
`tags` (array), `image`, and reserved `datasheet_url, manual_url, shop_sku, shop_url,
status`.

### `GET /api/v1/products/:id` — single product (`id` = slugified model, e.g. `gy-a60-max`)

### `GET /api/v1/categories` · `?locale=en|de|ja`
Fields: `id, title, eyebrow, nav_label, intro, hero_image, product_count, redirect_to`.

## Fields the API never returns

`ip_hash`, `user_agent`, the internal numeric `id`, and `internal_note` (admin-only)
are **never** included in any response. PII that the Agent legitimately needs for
follow-up reporting (name, email, company) **is** returned to an authorized key
holder.

## Examples

```bash
# health (public)
curl https://www.gyutron.com/api/v1/health

# newest RFQs since a timestamp, page of 100
curl -H "Authorization: Bearer $KEY" \
  "https://www.gyutron.com/api/v1/rfqs?since=2026-06-01T00:00:00Z&limit=100"

# only 'new' leads
curl -H "X-API-Key: $KEY" "https://www.gyutron.com/api/v1/leads?status=new"

# the unified event feed (for the daily digest)
curl -H "Authorization: Bearer $KEY" "https://www.gyutron.com/api/v1/events?cursor=0&limit=200"

# product catalog in German
curl -H "Authorization: Bearer $KEY" "https://www.gyutron.com/api/v1/products?locale=de"
```

## Replication note (other customers)

A second data source implements the same envelope, the same auth header, the same
pagination params, and the same resource field sets. Only `meta.source` changes (set
via `DATA_SOURCE_ID`). The Agent Workspace keys its storage by `meta.source`, so it
can aggregate many sources without code changes.
