-- Deployment-local intelligence. Keys are AES-GCM ciphertext; no legacy data import.
PRAGMA foreign_keys = ON;
CREATE TABLE intel_instance_state (
 id INTEGER PRIMARY KEY CHECK(id=1), instance_id TEXT NOT NULL UNIQUE,
 created_at TEXT NOT NULL
);
CREATE TABLE intel_model_settings (
 id INTEGER PRIMARY KEY CHECK(id=1), provider TEXT NOT NULL,
 base_url TEXT NOT NULL, model TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN(0,1)),
 key_ciphertext TEXT NOT NULL DEFAULT '', version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 last_tested_at TEXT, last_test_status TEXT, updated_by TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE intel_conversations (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 160),
 language TEXT NOT NULL DEFAULT 'en' CHECK(language IN('en','zh','de','ja')),
 archived_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX idx_intel_conversations_owner ON intel_conversations(owner_id,updated_at DESC);
CREATE TABLE intel_runs (
 id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES intel_conversations(id), actor_id TEXT NOT NULL,
 request_id TEXT NOT NULL, request_hash TEXT NOT NULL, mode TEXT NOT NULL CHECK(mode IN('deterministic','provider')),
 status TEXT NOT NULL CHECK(status IN('running','succeeded','failed')),
 context_json TEXT NOT NULL DEFAULT '{}', response_json TEXT, error_code TEXT,
 started_at TEXT NOT NULL, completed_at TEXT, UNIQUE(actor_id,request_id)
);
CREATE UNIQUE INDEX idx_intel_one_running ON intel_runs(conversation_id) WHERE status='running';
CREATE INDEX idx_intel_runs_created ON intel_runs(started_at DESC);
CREATE TABLE intel_messages (
 sequence INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, conversation_id TEXT NOT NULL REFERENCES intel_conversations(id),
 run_id TEXT NOT NULL REFERENCES intel_runs(id), role TEXT NOT NULL CHECK(role IN('user','assistant')),
 content TEXT NOT NULL CHECK(length(content)<=32000), citations_json TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL,
 UNIQUE(run_id,role)
);
CREATE INDEX idx_intel_messages_conversation ON intel_messages(conversation_id,sequence);
CREATE TABLE intel_model_usage (
 id TEXT PRIMARY KEY, run_id TEXT REFERENCES intel_runs(id), actor_id TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN('chat','test')), provider TEXT NOT NULL, model TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN('succeeded','failed')),
 prompt_tokens INTEGER, completion_tokens INTEGER, total_tokens INTEGER,
 duration_ms INTEGER NOT NULL CHECK(duration_ms>=0), error_code TEXT, created_at TEXT NOT NULL
);
CREATE INDEX idx_intel_usage_created ON intel_model_usage(created_at DESC);
CREATE TABLE intel_memory (
 id TEXT PRIMARY KEY, title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
 content TEXT NOT NULL CHECK(length(content) BETWEEN 1 AND 12000),
 category TEXT NOT NULL CHECK(category IN('business','customer','product','process','preference','general','rule')),
 source_ref TEXT NOT NULL DEFAULT '', valid_until TEXT, archived_at TEXT,
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0), created_by TEXT NOT NULL, updated_by TEXT NOT NULL,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX idx_intel_memory_active ON intel_memory(archived_at,category,updated_at DESC);
CREATE TABLE intel_documents (
 id TEXT PRIMARY KEY, title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
 filename TEXT NOT NULL CHECK(length(filename) BETWEEN 1 AND 240),
 media_type TEXT NOT NULL CHECK(media_type IN('text/plain','text/markdown')),
 content TEXT NOT NULL CHECK(length(content) BETWEEN 1 AND 204800), sha256 TEXT NOT NULL,
 source_ref TEXT NOT NULL DEFAULT '', archived_at TEXT, version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 created_by TEXT NOT NULL, updated_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX idx_intel_documents_active ON intel_documents(archived_at,updated_at DESC);
CREATE TABLE intel_license_events (
 sequence INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, action TEXT NOT NULL CHECK(action IN('activate','deactivate')),
 token TEXT, claims_json TEXT NOT NULL DEFAULT '{}', token_sha256 TEXT,
 actor_id TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX idx_intel_license_created ON intel_license_events(created_at DESC,id DESC);
CREATE TRIGGER intel_license_events_no_update BEFORE UPDATE ON intel_license_events BEGIN SELECT RAISE(ABORT,'License history is append only'); END;
CREATE TRIGGER intel_license_events_no_delete BEFORE DELETE ON intel_license_events BEGIN SELECT RAISE(ABORT,'License history is append only'); END;
CREATE TRIGGER intel_messages_no_update BEFORE UPDATE ON intel_messages BEGIN SELECT RAISE(ABORT,'Conversation messages are immutable'); END;
CREATE TRIGGER intel_messages_no_delete BEFORE DELETE ON intel_messages BEGIN SELECT RAISE(ABORT,'Conversation messages are immutable'); END;
