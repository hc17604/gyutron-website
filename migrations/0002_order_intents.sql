-- ---------------------------------------------------------------------------
-- 0002_order_intents.sql - review-only storefront order intents
--
-- This is deliberately NOT an orders/payments schema. It records a buyer's
-- procurement request for staff review. No prices, totals, card data, bank data,
-- payment state, inventory reservation, or charge identifiers are accepted or
-- stored here.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS order_intents (
  id                           INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id                    TEXT NOT NULL UNIQUE,
  idempotency_key_hash         TEXT,
  request_fingerprint          TEXT NOT NULL,
  request_type                 TEXT NOT NULL CHECK (request_type IN ('order_request', 'proforma_invoice')),

  contact_name                 TEXT NOT NULL,
  contact_department           TEXT,
  company                      TEXT NOT NULL,
  email                        TEXT NOT NULL,
  phone                        TEXT,

  shipping_recipient           TEXT,
  shipping_company             TEXT,
  shipping_phone               TEXT,
  shipping_address_line1       TEXT NOT NULL,
  shipping_address_line2       TEXT,
  shipping_city                TEXT NOT NULL,
  shipping_region              TEXT,
  shipping_postal_code         TEXT NOT NULL,
  shipping_country             TEXT NOT NULL,

  billing_same_as_shipping     INTEGER NOT NULL DEFAULT 1 CHECK (billing_same_as_shipping IN (0, 1)),
  billing_recipient            TEXT,
  billing_company              TEXT,
  billing_phone                TEXT,
  billing_address_line1        TEXT,
  billing_address_line2        TEXT,
  billing_city                 TEXT,
  billing_region               TEXT,
  billing_postal_code          TEXT,
  billing_country              TEXT,

  procurement_project_name     TEXT,
  procurement_purchase_order  TEXT,
  procurement_tax_id           TEXT,
  procurement_invoice_info     TEXT,
  procurement_notes            TEXT,

  item_count                   INTEGER NOT NULL CHECK (item_count BETWEEN 1 AND 25),
  source_page                  TEXT,
  locale                       TEXT,
  user_agent                   TEXT,
  ip_hash                      TEXT,
  ip_country                   TEXT,
  status                       TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'reviewing', 'waiting_for_info', 'ready_for_quote', 'declined', 'closed', 'spam')),
  internal_note                TEXT,
  created_at                   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at                   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_order_intents_idempotency
  ON order_intents(idempotency_key_hash)
  WHERE idempotency_key_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_intents_status ON order_intents(status);
CREATE INDEX IF NOT EXISTS idx_order_intents_created ON order_intents(created_at);
CREATE INDEX IF NOT EXISTS idx_order_intents_email ON order_intents(email);

CREATE TABLE IF NOT EXISTS order_intent_items (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  order_intent_id     INTEGER NOT NULL,
  line_number         INTEGER NOT NULL CHECK (line_number BETWEEN 1 AND 25),
  sku                 TEXT NOT NULL CHECK (sku IN (
    'GY-CV220-INLINE', 'GY-LB220', 'GY-PR12', 'GY-S240W',
    'GY-A55-PRO', 'GY-R70-LONGRANGE', 'GY-OPT25', 'GY-FB200',
    'GY-MG50', 'GY-CAL-GRID', 'GY-V240-COLOR', 'GY-V3D150',
    'GY-LDOME120', 'GY-PS60', 'GY-S300-DPM', 'GY-A80-ULTRA'
  )),
  quantity            INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 999),
  configuration_json  TEXT,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (order_intent_id) REFERENCES order_intents(id) ON DELETE CASCADE,
  UNIQUE (order_intent_id, line_number)
);

CREATE INDEX IF NOT EXISTS idx_order_intent_items_intent
  ON order_intent_items(order_intent_id);
CREATE INDEX IF NOT EXISTS idx_order_intent_items_sku
  ON order_intent_items(sku);
