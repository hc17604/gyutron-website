-- GYUTRON Operations: additive CRM workspace. Customer isolation remains one
-- Worker + D1 database per deployment. No changes to public submission tables.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS crm_customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 200),
  contact_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'prospect' CHECK(status IN ('prospect','active','inactive')),
  owner_id TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_crm_customers_status ON crm_customers(archived_at,status,id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_customers_owner ON crm_customers(owner_id,archived_at,id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_customers_email ON crm_customers(email);

CREATE TABLE IF NOT EXISTS crm_opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
  customer_id TEXT NOT NULL REFERENCES crm_customers(public_id),
  stage TEXT NOT NULL DEFAULT 'qualification' CHECK(stage IN ('qualification','discovery','proposal','negotiation','won','lost')),
  amount_minor INTEGER NOT NULL DEFAULT 0 CHECK(amount_minor >= 0 AND amount_minor <= 1000000000000),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK(currency IN ('USD','EUR','CNY','JPY','GBP','SGD')),
  probability INTEGER NOT NULL DEFAULT 10 CHECK(probability BETWEEN 0 AND 100),
  expected_close_date TEXT NOT NULL DEFAULT '',
  owner_id TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_stage ON crm_opportunities(archived_at,stage,id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_customer ON crm_opportunities(customer_id,archived_at,id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_owner ON crm_opportunities(owner_id,archived_at,id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_close ON crm_opportunities(archived_at,expected_close_date);

CREATE TABLE IF NOT EXISTS crm_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
  customer_id TEXT REFERENCES crm_customers(public_id),
  opportunity_id TEXT REFERENCES crm_opportunities(public_id),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','done')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
  due_date TEXT NOT NULL DEFAULT '',
  owner_id TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status_due ON crm_tasks(archived_at,status,due_date,id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_owner ON crm_tasks(owner_id,archived_at,id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_customer ON crm_tasks(customer_id,archived_at,id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_opportunity ON crm_tasks(opportunity_id,archived_at,id DESC);

CREATE TABLE IF NOT EXISTS crm_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  customer_id TEXT REFERENCES crm_customers(public_id),
  opportunity_id TEXT REFERENCES crm_opportunities(public_id),
  type TEXT NOT NULL CHECK(type IN ('note','call','email','meeting')),
  subject TEXT NOT NULL CHECK(length(subject) BETWEEN 1 AND 200),
  body TEXT NOT NULL DEFAULT '',
  occurred_at TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created ON crm_activities(id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activities_customer ON crm_activities(customer_id,id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activities_opportunity ON crm_activities(opportunity_id,id DESC);

CREATE TABLE IF NOT EXISTS crm_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_crm_audit_created ON crm_audit(id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_audit_entity ON crm_audit(entity_type,entity_id,id DESC);
CREATE INDEX IF NOT EXISTS idx_crm_audit_actor ON crm_audit(actor_id,id DESC);
CREATE TABLE IF NOT EXISTS crm_intake_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  source_resource TEXT NOT NULL CHECK(source_resource IN ('leads','rfqs','support','downloads')),
  source_id TEXT NOT NULL,
  customer_id TEXT NOT NULL REFERENCES crm_customers(public_id),
  opportunity_id TEXT REFERENCES crm_opportunities(public_id),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(source_resource, source_id)
);
CREATE INDEX IF NOT EXISTS idx_crm_intake_customer ON crm_intake_links(customer_id);

CREATE TRIGGER IF NOT EXISTS crm_customer_archive_guard BEFORE UPDATE OF archived_at ON crm_customers
WHEN OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL AND (
  EXISTS(SELECT 1 FROM crm_opportunities WHERE customer_id = OLD.public_id AND archived_at IS NULL AND stage NOT IN ('won','lost')) OR
  EXISTS(SELECT 1 FROM crm_tasks WHERE customer_id = OLD.public_id AND archived_at IS NULL AND status != 'done')
)
BEGIN SELECT RAISE(ABORT, 'Resolve active opportunities and tasks before archiving'); END;
CREATE TRIGGER IF NOT EXISTS crm_opportunity_archive_guard BEFORE UPDATE OF archived_at ON crm_opportunities
WHEN OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL AND
  EXISTS(SELECT 1 FROM crm_tasks WHERE opportunity_id = OLD.public_id AND archived_at IS NULL AND status != 'done')
BEGIN SELECT RAISE(ABORT, 'Resolve active tasks before archiving'); END;
CREATE TRIGGER IF NOT EXISTS crm_opportunity_active_customer BEFORE INSERT ON crm_opportunities
WHEN NOT EXISTS(SELECT 1 FROM crm_customers WHERE public_id = NEW.customer_id AND archived_at IS NULL)
BEGIN SELECT RAISE(ABORT, 'Select an active customer'); END;
CREATE TRIGGER IF NOT EXISTS crm_task_active_relations BEFORE INSERT ON crm_tasks
WHEN (NEW.customer_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM crm_customers WHERE public_id = NEW.customer_id AND archived_at IS NULL)) OR
  (NEW.opportunity_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM crm_opportunities WHERE public_id = NEW.opportunity_id AND archived_at IS NULL))
BEGIN SELECT RAISE(ABORT, 'Select active related records'); END;
CREATE TRIGGER IF NOT EXISTS crm_activity_active_relations BEFORE INSERT ON crm_activities
WHEN (NEW.customer_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM crm_customers WHERE public_id = NEW.customer_id AND archived_at IS NULL)) OR
  (NEW.opportunity_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM crm_opportunities WHERE public_id = NEW.opportunity_id AND archived_at IS NULL))
BEGIN SELECT RAISE(ABORT, 'Select active related records'); END;

-- Keep historical customer/opportunity relationships intact even when requests
-- arrive concurrently between an application's validation and transactional write.
CREATE TRIGGER IF NOT EXISTS crm_opportunity_customer_guard BEFORE UPDATE OF customer_id ON crm_opportunities
WHEN OLD.customer_id != NEW.customer_id AND (
  EXISTS(SELECT 1 FROM crm_tasks WHERE opportunity_id = OLD.public_id) OR
  EXISTS(SELECT 1 FROM crm_activities WHERE opportunity_id = OLD.public_id) OR
  EXISTS(SELECT 1 FROM crm_intake_links WHERE opportunity_id = OLD.public_id)
)
BEGIN SELECT RAISE(ABORT, 'Related records prevent customer reassignment'); END;
CREATE TRIGGER IF NOT EXISTS crm_task_customer_insert BEFORE INSERT ON crm_tasks
WHEN NEW.opportunity_id IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM crm_opportunities WHERE public_id = NEW.opportunity_id AND customer_id IS NEW.customer_id
)
BEGIN SELECT RAISE(ABORT, 'Opportunity and customer must match'); END;
CREATE TRIGGER IF NOT EXISTS crm_task_customer_update BEFORE UPDATE OF customer_id, opportunity_id ON crm_tasks
WHEN NEW.opportunity_id IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM crm_opportunities WHERE public_id = NEW.opportunity_id AND customer_id IS NEW.customer_id
)
BEGIN SELECT RAISE(ABORT, 'Opportunity and customer must match'); END;
CREATE TRIGGER IF NOT EXISTS crm_activity_customer_insert BEFORE INSERT ON crm_activities
WHEN NEW.opportunity_id IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM crm_opportunities WHERE public_id = NEW.opportunity_id AND customer_id IS NEW.customer_id
)
BEGIN SELECT RAISE(ABORT, 'Opportunity and customer must match'); END;
CREATE TRIGGER IF NOT EXISTS crm_audit_no_update BEFORE UPDATE ON crm_audit
BEGIN SELECT RAISE(ABORT, 'Audit records are append-only'); END;
CREATE TRIGGER IF NOT EXISTS crm_audit_no_delete BEFORE DELETE ON crm_audit
BEGIN SELECT RAISE(ABORT, 'Audit records are append-only'); END;
