-- Real, versioned contacts and personal/team saved views.
CREATE TABLE crm_contacts (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT NOT NULL UNIQUE,
 customer_id TEXT NOT NULL REFERENCES crm_customers(public_id),
 name TEXT NOT NULL,
 job_title TEXT NOT NULL DEFAULT '',
 email TEXT NOT NULL DEFAULT '',
 phone TEXT NOT NULL DEFAULT '',
 is_primary INTEGER NOT NULL DEFAULT 0 CHECK(is_primary IN (0,1)),
 notes TEXT NOT NULL DEFAULT '',
 version INTEGER NOT NULL DEFAULT 1,
 mutation_token TEXT NOT NULL,
 archived_at TEXT,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE INDEX idx_crm_contacts_customer ON crm_contacts(customer_id,archived_at,id);
CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);
CREATE UNIQUE INDEX idx_crm_contacts_primary ON crm_contacts(customer_id) WHERE is_primary=1 AND archived_at IS NULL;
CREATE TABLE workspace_views (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 resource TEXT NOT NULL,
 visibility TEXT NOT NULL CHECK(visibility IN ('private','team')),
 owner_id TEXT NOT NULL,
 config_json TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE INDEX idx_workspace_views_owner ON workspace_views(owner_id,resource);
CREATE INDEX idx_workspace_views_team ON workspace_views(visibility,resource);
CREATE TRIGGER crm_contacts_active_customer_insert BEFORE INSERT ON crm_contacts
WHEN NOT EXISTS(SELECT 1 FROM crm_customers WHERE public_id=NEW.customer_id AND archived_at IS NULL)
BEGIN SELECT RAISE(ABORT,'Contacts require an active customer'); END;
CREATE TRIGGER crm_contacts_active_customer_update BEFORE UPDATE ON crm_contacts
WHEN NEW.archived_at IS NULL AND NOT EXISTS(SELECT 1 FROM crm_customers WHERE public_id=NEW.customer_id AND archived_at IS NULL)
BEGIN SELECT RAISE(ABORT,'Contacts require an active customer'); END;
