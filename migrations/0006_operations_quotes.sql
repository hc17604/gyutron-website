-- Versioned industrial quotations. No payment, tax-rate or message sending logic.
CREATE TABLE ops_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  quote_number TEXT NOT NULL UNIQUE,
  family_id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK(revision BETWEEN 1 AND 10000),
  revision_of TEXT UNIQUE REFERENCES ops_quotes(public_id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','issued','accepted','declined')),
  customer_id TEXT NOT NULL REFERENCES crm_customers(public_id),
  opportunity_id TEXT REFERENCES crm_opportunities(public_id),
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
  currency TEXT NOT NULL CHECK(currency IN ('USD','EUR','CNY','JPY','GBP','SGD')),
  valid_until TEXT NOT NULL DEFAULT '',
  seller_name TEXT NOT NULL,
  seller_email TEXT NOT NULL DEFAULT '',
  seller_phone TEXT NOT NULL DEFAULT '',
  seller_address TEXT NOT NULL DEFAULT '',
  recipient_company TEXT NOT NULL,
  recipient_name TEXT NOT NULL DEFAULT '',
  recipient_email TEXT NOT NULL DEFAULT '',
  recipient_phone TEXT NOT NULL DEFAULT '',
  billing_address TEXT NOT NULL DEFAULT '',
  shipping_address TEXT NOT NULL DEFAULT '',
  terms TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  subtotal_minor INTEGER NOT NULL CHECK(typeof(subtotal_minor) = 'integer' AND subtotal_minor BETWEEN 0 AND 1000000000000),
  discount_minor INTEGER NOT NULL DEFAULT 0 CHECK(typeof(discount_minor) = 'integer' AND discount_minor BETWEEN 0 AND subtotal_minor),
  tax_minor INTEGER NOT NULL DEFAULT 0 CHECK(typeof(tax_minor) = 'integer' AND tax_minor BETWEEN 0 AND 1000000000000),
  shipping_minor INTEGER NOT NULL DEFAULT 0 CHECK(typeof(shipping_minor) = 'integer' AND shipping_minor BETWEEN 0 AND 1000000000000),
  total_minor INTEGER NOT NULL CHECK(typeof(total_minor) = 'integer' AND total_minor BETWEEN 0 AND 1000000000000),
  snapshot_json TEXT,
  snapshot_sha256 TEXT,
  issued_at TEXT,
  issued_by TEXT,
  outcome_note TEXT NOT NULL DEFAULT '',
  outcome_recorded_at TEXT,
  outcome_recorded_by TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
  mutation_token TEXT NOT NULL,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(family_id, revision),
  CHECK(total_minor = subtotal_minor - discount_minor + tax_minor + shipping_minor),
  CHECK((status = 'draft' AND snapshot_json IS NULL AND snapshot_sha256 IS NULL AND issued_at IS NULL) OR
    (status != 'draft' AND snapshot_json IS NOT NULL AND json_valid(snapshot_json) AND snapshot_sha256 IS NOT NULL AND issued_at IS NOT NULL AND issued_by IS NOT NULL))
);
CREATE INDEX idx_ops_quotes_status ON ops_quotes(archived_at,status,id DESC);
CREATE INDEX idx_ops_quotes_customer ON ops_quotes(customer_id,archived_at,id DESC);
CREATE INDEX idx_ops_quotes_opportunity ON ops_quotes(opportunity_id,archived_at,id DESC);
CREATE INDEX idx_ops_quotes_owner ON ops_quotes(owner_id,archived_at,id DESC);

CREATE TABLE ops_quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  quote_id TEXT NOT NULL REFERENCES ops_quotes(public_id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL CHECK(line_number BETWEEN 1 AND 50),
  sku TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL CHECK(length(description) BETWEEN 1 AND 2000),
  unit TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL CHECK(typeof(quantity) = 'integer' AND quantity BETWEEN 1 AND 9007199254740991),
  unit_price_minor INTEGER NOT NULL CHECK(typeof(unit_price_minor) = 'integer' AND unit_price_minor BETWEEN 0 AND 1000000000000),
  line_total_minor INTEGER NOT NULL CHECK(typeof(line_total_minor) = 'integer' AND line_total_minor BETWEEN 0 AND 1000000000000),
  CHECK(line_total_minor = quantity * unit_price_minor),
  UNIQUE(quote_id,line_number)
);
CREATE INDEX idx_ops_quote_items_quote ON ops_quote_items(quote_id,line_number);

CREATE TRIGGER ops_quote_active_insert BEFORE INSERT ON ops_quotes
WHEN NOT EXISTS(SELECT 1 FROM crm_customers WHERE public_id=NEW.customer_id AND archived_at IS NULL) OR
 (NEW.opportunity_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM crm_opportunities WHERE public_id=NEW.opportunity_id AND customer_id=NEW.customer_id AND archived_at IS NULL))
BEGIN SELECT RAISE(ABORT,'Quote requires active matching customer and opportunity'); END;
CREATE TRIGGER ops_quote_active_update BEFORE UPDATE OF customer_id,opportunity_id,status,archived_at ON ops_quotes
WHEN NEW.archived_at IS NULL AND NEW.status IN ('draft','issued') AND (
 NOT EXISTS(SELECT 1 FROM crm_customers WHERE public_id=NEW.customer_id AND archived_at IS NULL) OR
 (NEW.opportunity_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM crm_opportunities WHERE public_id=NEW.opportunity_id AND customer_id=NEW.customer_id AND archived_at IS NULL)))
BEGIN SELECT RAISE(ABORT,'Quote requires active matching customer and opportunity'); END;
CREATE TRIGGER ops_quote_frozen_header BEFORE UPDATE OF
 quote_number,family_id,revision,revision_of,customer_id,opportunity_id,title,currency,valid_until,
 seller_name,seller_email,seller_phone,seller_address,recipient_company,recipient_name,recipient_email,recipient_phone,
 billing_address,shipping_address,terms,notes,subtotal_minor,discount_minor,tax_minor,shipping_minor,total_minor,
 snapshot_json,snapshot_sha256,issued_at,issued_by ON ops_quotes
WHEN OLD.status != 'draft'
BEGIN SELECT RAISE(ABORT,'Issued quotation content is immutable; create a revision'); END;
CREATE TRIGGER ops_quote_no_reopen BEFORE UPDATE OF status ON ops_quotes
WHEN (OLD.status != 'draft' AND NEW.status='draft') OR (OLD.status IN ('accepted','declined') AND NEW.status != OLD.status)
BEGIN SELECT RAISE(ABORT,'Issued quotation status cannot be reopened'); END;
CREATE TRIGGER ops_quote_no_issued_delete BEFORE DELETE ON ops_quotes WHEN OLD.status != 'draft'
BEGIN SELECT RAISE(ABORT,'Issued quotations must be archived instead of deleted'); END;
CREATE TRIGGER ops_quote_item_frozen_insert BEFORE INSERT ON ops_quote_items
WHEN (SELECT status FROM ops_quotes WHERE public_id=NEW.quote_id) != 'draft'
BEGIN SELECT RAISE(ABORT,'Issued quotation items are immutable'); END;
CREATE TRIGGER ops_quote_item_frozen_update BEFORE UPDATE ON ops_quote_items
WHEN (SELECT status FROM ops_quotes WHERE public_id=OLD.quote_id) != 'draft' OR (SELECT status FROM ops_quotes WHERE public_id=NEW.quote_id) != 'draft'
BEGIN SELECT RAISE(ABORT,'Issued quotation items are immutable'); END;
CREATE TRIGGER ops_quote_item_frozen_delete BEFORE DELETE ON ops_quote_items
WHEN (SELECT status FROM ops_quotes WHERE public_id=OLD.quote_id) != 'draft'
BEGIN SELECT RAISE(ABORT,'Issued quotation items are immutable'); END;

CREATE TRIGGER ops_quote_customer_archive BEFORE UPDATE OF archived_at ON crm_customers
WHEN OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL AND
 EXISTS(SELECT 1 FROM ops_quotes WHERE customer_id=OLD.public_id AND archived_at IS NULL AND status IN ('draft','issued'))
BEGIN SELECT RAISE(ABORT,'Active quotations prevent customer archiving'); END;
CREATE TRIGGER ops_quote_opportunity_archive BEFORE UPDATE OF archived_at ON crm_opportunities
WHEN OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL AND
 EXISTS(SELECT 1 FROM ops_quotes WHERE opportunity_id=OLD.public_id AND archived_at IS NULL AND status IN ('draft','issued'))
BEGIN SELECT RAISE(ABORT,'Active quotations prevent opportunity archiving'); END;
CREATE TRIGGER ops_quote_opportunity_customer BEFORE UPDATE OF customer_id ON crm_opportunities
WHEN NEW.customer_id != OLD.customer_id AND EXISTS(SELECT 1 FROM ops_quotes WHERE opportunity_id=OLD.public_id)
BEGIN SELECT RAISE(ABORT,'Quotation history prevents opportunity customer reassignment'); END;
