-- Dedicated-instance operating data. Native website records remain in their original tables.
PRAGMA foreign_keys=ON;
CREATE TABLE ops_data_sources (
 id TEXT PRIMARY KEY,name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 200),kind TEXT NOT NULL CHECK(kind IN ('native_website','csv_generic','shopify_csv')),
 enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,last_sync_at TEXT
);
INSERT INTO ops_data_sources(id,name,kind,created_at,updated_at) VALUES('native-website','GYUTRON website','native_website',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'));
CREATE TABLE ops_sync_runs (
 id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES ops_data_sources(id),kind TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('running','completed','failed')),
 counts_json TEXT NOT NULL DEFAULT '{}',error TEXT,created_at TEXT NOT NULL,completed_at TEXT
);
CREATE INDEX idx_ops_sync_source ON ops_sync_runs(source_id,created_at DESC);
CREATE TABLE ops_import_batches (
 id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES ops_data_sources(id),entity TEXT NOT NULL CHECK(entity IN ('orders','order_items','customers','payments')),
 format TEXT NOT NULL CHECK(format IN ('generic','shopify')),status TEXT NOT NULL CHECK(status IN ('preview','processing','completed')),
 mapping_json TEXT NOT NULL,headers_json TEXT NOT NULL,total_rows INTEGER NOT NULL,valid_rows INTEGER NOT NULL,invalid_rows INTEGER NOT NULL,duplicate_rows INTEGER NOT NULL,
 processed_rows INTEGER NOT NULL DEFAULT 0,imported_rows INTEGER NOT NULL DEFAULT 0,failed_rows INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 1,
 lease_token TEXT,lease_until TEXT,created_by TEXT NOT NULL,created_at TEXT NOT NULL,completed_at TEXT,sync_run_id TEXT REFERENCES ops_sync_runs(id)
);
CREATE INDEX idx_ops_import_created ON ops_import_batches(created_at DESC);
CREATE TRIGGER ops_import_pending_capacity BEFORE INSERT ON ops_import_batches WHEN COALESCE((SELECT SUM(total_rows) FROM ops_import_batches WHERE status!='completed'),0)+NEW.total_rows>2000 BEGIN SELECT RAISE(ABORT,'IMPORT_PENDING_CAPACITY'); END;
CREATE TABLE ops_import_rows (
 id TEXT PRIMARY KEY,batch_id TEXT NOT NULL REFERENCES ops_import_batches(id),row_number INTEGER NOT NULL,
 external_id TEXT,data_json TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','imported','failed','duplicate')),error TEXT,
 UNIQUE(batch_id,row_number)
);
CREATE INDEX idx_ops_import_pending ON ops_import_rows(batch_id,status,row_number);
CREATE TABLE ops_commerce_customers (
 id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES ops_data_sources(id),external_id TEXT NOT NULL,name TEXT NOT NULL DEFAULT '',email TEXT NOT NULL DEFAULT '',company TEXT NOT NULL DEFAULT '',country TEXT NOT NULL DEFAULT '',
 source_created_at TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(source_id,external_id)
);
CREATE TABLE ops_commerce_orders (
 id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES ops_data_sources(id),external_id TEXT NOT NULL,order_number TEXT NOT NULL DEFAULT '',customer_external_id TEXT NOT NULL DEFAULT '',customer_email TEXT NOT NULL DEFAULT '',country TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL CHECK(status IN ('pending','paid','fulfilled','cancelled','refunded','partially_refunded')),fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled' CHECK(fulfillment_status IN ('unfulfilled','partial','fulfilled')),
 currency TEXT NOT NULL CHECK(length(currency)=3),total_minor INTEGER NOT NULL CHECK(typeof(total_minor)='integer' AND total_minor BETWEEN 0 AND 1000000000000),
 paid_at TEXT,fulfilled_at TEXT,source_created_at TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(source_id,external_id)
);
CREATE INDEX idx_ops_orders_filter ON ops_commerce_orders(source_id,source_created_at,currency,status);
CREATE TABLE ops_commerce_order_items (
 id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES ops_data_sources(id),external_id TEXT NOT NULL,order_external_id TEXT NOT NULL,sku TEXT NOT NULL DEFAULT '',title TEXT NOT NULL DEFAULT '',
 quantity INTEGER NOT NULL CHECK(typeof(quantity)='integer' AND quantity BETWEEN 1 AND 1000000),currency TEXT NOT NULL CHECK(length(currency)=3),unit_price_minor INTEGER NOT NULL CHECK(typeof(unit_price_minor)='integer' AND unit_price_minor BETWEEN 0 AND 1000000000000),
 line_total_minor INTEGER NOT NULL CHECK(typeof(line_total_minor)='integer' AND line_total_minor BETWEEN 0 AND 1000000000000),source_created_at TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,
 UNIQUE(source_id,external_id),FOREIGN KEY(source_id,order_external_id) REFERENCES ops_commerce_orders(source_id,external_id),CHECK(line_total_minor=quantity*unit_price_minor)
);
CREATE INDEX idx_ops_items_order ON ops_commerce_order_items(source_id,order_external_id);
CREATE TRIGGER ops_item_currency_insert BEFORE INSERT ON ops_commerce_order_items WHEN NOT EXISTS(SELECT 1 FROM ops_commerce_orders WHERE source_id=NEW.source_id AND external_id=NEW.order_external_id AND currency=NEW.currency) BEGIN SELECT RAISE(ABORT,'Item requires a matching parent order and currency'); END;
CREATE TRIGGER ops_item_currency_update BEFORE UPDATE OF source_id,order_external_id,currency ON ops_commerce_order_items WHEN NOT EXISTS(SELECT 1 FROM ops_commerce_orders WHERE source_id=NEW.source_id AND external_id=NEW.order_external_id AND currency=NEW.currency) BEGIN SELECT RAISE(ABORT,'Item requires a matching parent order and currency'); END;
CREATE TRIGGER ops_order_currency_update BEFORE UPDATE OF currency ON ops_commerce_orders WHEN EXISTS(SELECT 1 FROM ops_commerce_order_items WHERE source_id=OLD.source_id AND order_external_id=OLD.external_id AND currency!=NEW.currency) BEGIN SELECT RAISE(ABORT,'Order currency conflicts with existing items'); END;
CREATE TABLE ops_commerce_payments (
 id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES ops_data_sources(id),external_id TEXT NOT NULL,order_external_id TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','paid','failed','refunded')),
 currency TEXT NOT NULL CHECK(length(currency)=3),amount_minor INTEGER NOT NULL CHECK(typeof(amount_minor)='integer' AND amount_minor BETWEEN 0 AND 1000000000000),method TEXT NOT NULL DEFAULT '',
 source_created_at TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(source_id,external_id)
);
CREATE INDEX idx_ops_payments_order ON ops_commerce_payments(source_id,order_external_id,currency);
CREATE TABLE ops_reports (
 id TEXT PRIMARY KEY,type TEXT NOT NULL CHECK(type IN ('daily','weekly','opportunities')),title TEXT NOT NULL,language TEXT NOT NULL,filters_json TEXT NOT NULL,summary_json TEXT NOT NULL,content_markdown TEXT NOT NULL,
 rules_snapshot_json TEXT NOT NULL,created_by TEXT NOT NULL,created_at TEXT NOT NULL,run_id TEXT UNIQUE
);
CREATE INDEX idx_ops_reports_created ON ops_reports(created_at DESC);
CREATE TRIGGER ops_reports_no_update BEFORE UPDATE ON ops_reports BEGIN SELECT RAISE(ABORT,'Generated reports are immutable'); END;
CREATE TABLE ops_rules (
 id TEXT PRIMARY KEY,name TEXT NOT NULL,template TEXT NOT NULL,enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),config_json TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE ops_rule_versions (
 id TEXT PRIMARY KEY,rule_id TEXT NOT NULL REFERENCES ops_rules(id),version INTEGER NOT NULL,name TEXT NOT NULL,enabled INTEGER NOT NULL,config_json TEXT NOT NULL,created_by TEXT NOT NULL,created_at TEXT NOT NULL,UNIQUE(rule_id,version)
);
CREATE TRIGGER ops_rule_versions_no_update BEFORE UPDATE ON ops_rule_versions BEGIN SELECT RAISE(ABORT,'Rule history is immutable'); END;
CREATE TABLE ops_automations (
 id TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('rules','report','native_sync')),rule_id TEXT REFERENCES ops_rules(id),enabled INTEGER NOT NULL CHECK(enabled IN (0,1)),interval_minutes INTEGER NOT NULL CHECK(interval_minutes BETWEEN 15 AND 10080),
 config_json TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,next_run_at TEXT NOT NULL,last_run_at TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE INDEX idx_ops_automation_due ON ops_automations(enabled,next_run_at);
CREATE TABLE ops_automation_runs (
 id TEXT PRIMARY KEY,automation_id TEXT REFERENCES ops_automations(id),trigger_kind TEXT NOT NULL CHECK(trigger_kind IN ('manual','scheduled','rule')),
 kind TEXT NOT NULL CHECK(kind IN ('rules','report','native_sync')),status TEXT NOT NULL CHECK(status IN ('queued','running','completed','failed')),snapshot_json TEXT NOT NULL,
 cursor TEXT NOT NULL DEFAULT '',rule_index INTEGER NOT NULL DEFAULT 0,attempts INTEGER NOT NULL DEFAULT 0,lease_token TEXT,lease_until TEXT,dedupe_key TEXT NOT NULL UNIQUE,
 processed INTEGER NOT NULL DEFAULT 0,findings_count INTEGER NOT NULL DEFAULT 0,error TEXT,result_json TEXT NOT NULL DEFAULT '{}',created_by TEXT NOT NULL,created_at TEXT NOT NULL,started_at TEXT,completed_at TEXT
);
CREATE INDEX idx_ops_runs_queue ON ops_automation_runs(status,lease_until,created_at);
CREATE TABLE ops_rule_findings (
 id TEXT PRIMARY KEY,rule_id TEXT NOT NULL REFERENCES ops_rules(id),entity_type TEXT NOT NULL,entity_id TEXT NOT NULL,title TEXT NOT NULL,priority TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('open','resolved')),task_id TEXT NOT NULL REFERENCES crm_tasks(public_id),first_run_id TEXT NOT NULL REFERENCES ops_automation_runs(id),last_run_id TEXT NOT NULL REFERENCES ops_automation_runs(id),
 evidence_json TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(rule_id,entity_type,entity_id)
);
CREATE INDEX idx_ops_findings_run ON ops_rule_findings(last_run_id);
