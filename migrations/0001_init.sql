-- ---------------------------------------------------------------------------
-- 0001_init.sql — GYUTRON Data Layer (Phase 1)
--
-- Cloudflare D1 (SQLite). Applied with:
--   wrangler d1 migrations apply <DB_NAME> --local     (local dev)
--   wrangler d1 migrations apply <DB_NAME> --remote     (production)
--
-- DESIGN NOTES (customer-agnostic / replicable):
--   * No `tenant_id` column. Replication model = one D1 database + one Worker
--     deployment per customer. Tenancy is at the deployment boundary, not the row.
--   * Timestamps are ISO-8601 UTC TEXT (SQLite has no native datetime). The app
--     also sets created_at/updated_at explicitly; these DEFAULTs are a backstop.
--   * `public_id` is the externally-safe identifier (e.g. RFQ-20260610-7K3QF2);
--     the integer `id` is the internal cursor for incremental sync.
--   * Raw IP is never stored. `ip_hash` is a salted SHA-256; `ip_country` is the
--     coarse Cloudflare `cf-ipcountry` header only.
-- ---------------------------------------------------------------------------

-- General contact / "Contact Sales" inquiries.
CREATE TABLE IF NOT EXISTS leads (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id        TEXT NOT NULL UNIQUE,
  type             TEXT NOT NULL DEFAULT 'contact_sales',  -- contact_sales | general | partner | oem
  name             TEXT,
  company          TEXT,
  email            TEXT,
  phone            TEXT,
  country          TEXT,
  product_interest TEXT,
  message          TEXT,
  source_page      TEXT,
  locale           TEXT,
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  user_agent       TEXT,
  ip_hash          TEXT,
  ip_country       TEXT,
  status           TEXT NOT NULL DEFAULT 'new',            -- new | reviewing | replied | closed | spam
  internal_note    TEXT,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_status  ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email   ON leads(email);

-- Request-for-quote submissions.
CREATE TABLE IF NOT EXISTS rfqs (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id               TEXT NOT NULL UNIQUE,
  name                    TEXT,
  company                 TEXT,
  email                   TEXT,
  phone                   TEXT,
  country                 TEXT,
  product_category        TEXT,
  product_model           TEXT,
  industry                TEXT,
  quantity                TEXT,
  application_description TEXT,
  timeline                TEXT,
  source_page             TEXT,
  locale                  TEXT,
  utm_source              TEXT,
  utm_medium              TEXT,
  utm_campaign            TEXT,
  user_agent              TEXT,
  ip_hash                 TEXT,
  ip_country              TEXT,
  status                  TEXT NOT NULL DEFAULT 'new',      -- new | reviewing | waiting_for_info | quoted | won | lost | spam
  internal_note           TEXT,
  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_rfqs_status  ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_created ON rfqs(created_at);
CREATE INDEX IF NOT EXISTS idx_rfqs_email   ON rfqs(email);

-- Support / technical-help requests.
CREATE TABLE IF NOT EXISTS support_requests (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id     TEXT NOT NULL UNIQUE,
  name          TEXT,
  company       TEXT,
  email         TEXT,
  product_model TEXT,
  serial_number TEXT,
  issue_type    TEXT,                                       -- defect | how_to | rma | integration | documentation | other
  message       TEXT,
  source_page   TEXT,
  locale        TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  user_agent    TEXT,
  ip_hash       TEXT,
  ip_country    TEXT,
  status        TEXT NOT NULL DEFAULT 'new',                -- new | reviewing | replied | closed | spam
  internal_note TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_support_status  ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_created ON support_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_support_email   ON support_requests(email);

-- Gated-content / datasheet download requests.
CREATE TABLE IF NOT EXISTS download_requests (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id      TEXT NOT NULL UNIQUE,
  name           TEXT,
  company        TEXT,
  email          TEXT,
  country        TEXT,
  requested_file TEXT,
  product_model  TEXT,
  access_type    TEXT NOT NULL DEFAULT 'manual_review',     -- public | gated | manual_review
  source_page    TEXT,
  locale         TEXT,
  utm_source     TEXT,
  utm_medium     TEXT,
  utm_campaign   TEXT,
  user_agent     TEXT,
  ip_hash        TEXT,
  ip_country     TEXT,
  status         TEXT NOT NULL DEFAULT 'new',               -- new | approved | rejected | fulfilled | spam
  internal_note  TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_downloads_status  ON download_requests(status);
CREATE INDEX IF NOT EXISTS idx_downloads_created ON download_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_downloads_email   ON download_requests(email);

-- Unified event stream. Every submission and (future) commerce signal lands here so
-- the Agent Workspace can build daily digests, alerts, and automations from ONE feed.
CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id     TEXT NOT NULL UNIQUE,
  event_type   TEXT NOT NULL,                               -- lead.created | rfq.created | support.created | download.requested | ...
  entity_type  TEXT,                                        -- lead | rfq | support_request | download_request | product | order
  entity_id    TEXT,                                        -- the entity's public_id
  source       TEXT NOT NULL DEFAULT 'gyutron-website',
  payload_json TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_events_type    ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_entity  ON events(entity_type, entity_id);

-- Read-only Data API credentials. Phase 1 also accepts a single env-var key
-- (DATA_API_KEY); this table is the forward-compatible path to multiple keys + scopes.
CREATE TABLE IF NOT EXISTS api_keys (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id    TEXT NOT NULL UNIQUE,
  key_hash     TEXT NOT NULL UNIQUE,                        -- SHA-256 of the raw key (raw key shown once at creation)
  name         TEXT NOT NULL,
  scope        TEXT NOT NULL DEFAULT 'read:all',            -- space-separated scopes, e.g. "read:leads read:events"
  status       TEXT NOT NULL DEFAULT 'active',              -- active | revoked
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_used_at TEXT
);
