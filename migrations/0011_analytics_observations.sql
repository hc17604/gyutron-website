-- Aggregate-only external metrics; no visitor identifiers, cookies, PII or raw CSV.
CREATE TABLE ops_analytics_imports (
 id TEXT PRIMARY KEY,
 source_id TEXT NOT NULL REFERENCES ops_data_sources(id),
 sha256 TEXT NOT NULL CHECK(length(sha256)=64),
 row_count INTEGER NOT NULL CHECK(row_count BETWEEN 1 AND 500),
 status TEXT NOT NULL DEFAULT 'completed' CHECK(status='completed'),
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL,
 mutation_token TEXT NOT NULL,
 UNIQUE(source_id,sha256)
);
CREATE TABLE ops_analytics_observations (
 id TEXT PRIMARY KEY,
 source_id TEXT NOT NULL REFERENCES ops_data_sources(id),
 date TEXT NOT NULL CHECK(length(date)=10 AND date(date) IS NOT NULL AND date(date)=date),
 date_to TEXT NOT NULL CHECK(length(date_to)=10 AND date(date_to) IS NOT NULL AND date(date_to)=date_to AND date_to>=date),
 metric TEXT NOT NULL CHECK(metric IN ('visitors','sessions','page_views','impressions','clicks','ctr','conversion_rate','search_impressions','search_clicks','search_ctr','ad_spend','ad_impressions','ad_clicks','ai_impressions','ai_clicks')),
 value_exact TEXT,
 numerator TEXT,
 denominator TEXT,
 unit TEXT NOT NULL CHECK(unit IN ('count','minor','ratio')),
 currency TEXT NOT NULL DEFAULT '',
 series TEXT NOT NULL CHECK(series IN ('self','peer_average','peer_leader')),
 device TEXT NOT NULL DEFAULT '',country TEXT NOT NULL DEFAULT '',product TEXT NOT NULL DEFAULT '',keyword TEXT NOT NULL DEFAULT '',channel TEXT NOT NULL DEFAULT '',industry TEXT NOT NULL DEFAULT '',
 scope_hash TEXT NOT NULL CHECK(length(scope_hash)=64),
 import_id TEXT NOT NULL REFERENCES ops_analytics_imports(id),
 version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL,updated_at TEXT NOT NULL,
 CHECK((unit='ratio' AND value_exact IS NULL AND numerator IS NOT NULL AND denominator IS NOT NULL) OR (unit!='ratio' AND value_exact IS NOT NULL AND numerator IS NULL AND denominator IS NULL)),
 CHECK((unit='minor' AND length(currency)=3) OR (unit!='minor' AND currency='')),
 CHECK((metric='ad_spend' AND unit='minor') OR (metric IN ('ctr','conversion_rate','search_ctr') AND unit='ratio') OR (metric NOT IN ('ad_spend','ctr','conversion_rate','search_ctr') AND unit='count')),
 CHECK(value_exact IS NULL OR (length(value_exact) BETWEEN 1 AND 30 AND value_exact NOT GLOB '*[^0-9]*' AND (value_exact='0' OR substr(value_exact,1,1)!='0'))),
 CHECK(numerator IS NULL OR (length(numerator) BETWEEN 1 AND 30 AND numerator NOT GLOB '*[^0-9]*' AND (numerator='0' OR substr(numerator,1,1)!='0'))),
 CHECK(denominator IS NULL OR (length(denominator) BETWEEN 1 AND 30 AND denominator NOT GLOB '*[^0-9]*' AND substr(denominator,1,1)!='0')),
 CHECK(unit!='ratio' OR length(numerator)<length(denominator) OR (length(numerator)=length(denominator) AND numerator<=denominator)),
 CHECK(length(device)<=120 AND length(country)<=120 AND length(product)<=120 AND length(keyword)<=120 AND length(channel)<=120 AND length(industry)<=120),
 UNIQUE(source_id,date,date_to,metric,currency,series,scope_hash)
);
CREATE INDEX idx_ops_observations_scope ON ops_analytics_observations(source_id,metric,date,date_to,series);
CREATE INDEX idx_ops_observations_import ON ops_analytics_observations(import_id);
CREATE INDEX idx_ops_analytics_imports_created ON ops_analytics_imports(created_at DESC,id);
CREATE TRIGGER ops_observation_capacity BEFORE INSERT ON ops_analytics_observations
WHEN NOT EXISTS(SELECT 1 FROM ops_analytics_observations WHERE source_id=NEW.source_id AND date=NEW.date AND date_to=NEW.date_to AND metric=NEW.metric AND currency=NEW.currency AND series=NEW.series AND scope_hash=NEW.scope_hash)
 AND (SELECT COUNT(*) FROM ops_analytics_observations)>=15000
BEGIN SELECT RAISE(ABORT,'ANALYTICS_CAPACITY'); END;
CREATE TRIGGER ops_analytics_import_capacity BEFORE INSERT ON ops_analytics_imports
WHEN NOT EXISTS(SELECT 1 FROM ops_analytics_imports WHERE source_id=NEW.source_id AND sha256=NEW.sha256)
 AND (SELECT COUNT(*) FROM ops_analytics_imports)>=1000
BEGIN SELECT RAISE(ABORT,'ANALYTICS_IMPORT_CAPACITY'); END;
CREATE TRIGGER ops_observation_source_insert BEFORE INSERT ON ops_analytics_observations
WHEN NOT EXISTS(SELECT 1 FROM ops_analytics_imports i JOIN ops_data_sources s ON s.id=i.source_id WHERE i.id=NEW.import_id AND i.source_id=NEW.source_id AND s.kind='csv_generic' AND s.enabled=1)
BEGIN SELECT RAISE(ABORT,'ANALYTICS_SOURCE_INVALID'); END;
CREATE TRIGGER ops_observation_source_update BEFORE UPDATE OF import_id,source_id ON ops_analytics_observations
WHEN NOT EXISTS(SELECT 1 FROM ops_analytics_imports i JOIN ops_data_sources s ON s.id=i.source_id WHERE i.id=NEW.import_id AND i.source_id=NEW.source_id AND s.kind='csv_generic' AND s.enabled=1)
BEGIN SELECT RAISE(ABORT,'ANALYTICS_SOURCE_INVALID'); END;
