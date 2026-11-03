/** Backup failure-path and isolated restore checks. No production credentials or writes. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { BACKUP_TABLES, EXTENDED_BACKUP_TABLES, EXCLUDED_BACKUP_TABLES, MAX_BACKUP_ROWS, MAX_BACKUP_BYTES, createBackupSnapshot, runBackup, backupToSql } from '../src/api/backup.mjs';
import { hashStaffPassword, verifyStaffPassword } from '../src/platform/security/workspace-auth.mjs';
import { sha256Hex } from '../src/platform/security/hash.mjs';
import { createHash } from 'node:crypto';
import { CONTENT_FIELDS } from '../src/platform/quotes/schema.mjs';
import { quoteSnapshot } from '../src/platform/quotes/repository.mjs';
import { renderQuoteDocument } from '../src/platform/quotes/document.mjs';
import { handleAdminSystem } from '../src/api/admin-system.mjs';

const migrations = ['0001_init.sql', '0002_order_intents.sql', '0003_admin_workspace.sql', '0004_admin_identity.sql', '0005_crm_relation_guards.sql', '0006_operations_quotes.sql','0007_operations.sql','0008_intelligence.sql','0009_workspace_experience.sql','0010_workspace_notifications.sql'];
const stamp = '2026-11-03T05:00:00.000Z';
const staffPassword = 'Recovery-test-password-only';
const staffHash = await hashStaffPassword(staffPassword);
const trickyText = "Factory O'Reilly; DROP TABLE leads;\n中文\0end";
let passed = 0; const failures = [];
async function test(name, action) { try { await action(); passed++; } catch (error) { failures.push({ name, error: error.message }); } }

function makeDatabase({ withTracking = true } = {}) {
  const sqlite = new DatabaseSync(':memory:'); sqlite.exec('PRAGMA foreign_keys=ON');
  for (const migration of migrations) sqlite.exec(readFileSync(new URL('../migrations/' + migration, import.meta.url), 'utf8'));
  if (withTracking) {
    sqlite.exec('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE,applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    for (const name of migrations) sqlite.prepare('INSERT INTO d1_migrations(name) VALUES(?)').run(name);
  }
  sqlite.prepare('INSERT INTO leads(public_id,name,message) VALUES(?,?,?)').run('LEAD-recovery', 'Recovery buyer', trickyText);
  for (const table of ['rfqs', 'support_requests', 'download_requests']) sqlite.prepare(`INSERT INTO ${table}(public_id) VALUES(?)`).run(table + '-recovery');
  sqlite.prepare('INSERT INTO events(event_id,event_type) VALUES(?,?)').run('EVT-recovery', 'recovery.fixture');
  sqlite.prepare('INSERT INTO events(id,event_id,event_type) VALUES(999,?,?)').run('EVT-deleted', 'recovery.deleted');
  sqlite.exec("DELETE FROM events WHERE event_id='EVT-deleted'");
  sqlite.prepare('INSERT INTO api_keys(public_id,key_hash,name) VALUES(?,?,?)').run('KEY-recovery', 'non-production-hash', 'Recovery fixture');
  sqlite.prepare(`INSERT INTO order_intents(public_id,request_fingerprint,request_type,contact_name,company,email,shipping_address_line1,shipping_city,shipping_postal_code,shipping_country,item_count)
    VALUES(?,?,?,?,?,?,?,?,?,?,1)`).run('OI-recovery', 'fixture-only', 'order_request', 'Recovery buyer', 'Recovery company', 'buyer@example.test', 'Fixture address', 'Singapore', '000000', 'SG');
  sqlite.prepare('INSERT INTO order_intent_items(order_intent_id,line_number,sku,quantity,configuration_json) VALUES(1,1,?,2,?)').run('GY-CV220-INLINE', '{"fixture":true}');
  sqlite.prepare('INSERT INTO admin_users(id,email,name,role,password_hash,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run('USR-recovery', 'staff@example.test', 'Recovery staff', 'sales', staffHash, stamp, stamp);
  sqlite.prepare('INSERT INTO admin_sessions(token_hash,user_id,csrf_token,created_at,expires_at,last_seen_at) VALUES(?,?,?,?,?,?)').run('session-fixture', 'USR-recovery', 'csrf-fixture', stamp, '2099-01-01', stamp);
  sqlite.prepare('INSERT INTO admin_owner_sessions(token_hash,csrf_token,credential_fingerprint,created_at,expires_at,last_seen_at) VALUES(?,?,?,?,?,?)').run('owner-session-fixture', 'owner-csrf-fixture', 'fingerprint-fixture', stamp, '2099-01-01', stamp);
  sqlite.prepare('INSERT INTO admin_login_attempts(key_hash,attempts,window_start) VALUES(?,4,1)').run('throttle-fixture');
  sqlite.prepare('INSERT INTO crm_customers(public_id,name,owner_id,created_at,updated_at) VALUES(?,?,?,?,?)').run('CUS-recovery', 'Recovery company', 'USR-recovery', stamp, stamp);
  sqlite.prepare('INSERT INTO crm_opportunities(public_id,title,customer_id,stage,probability,owner_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run('OPP-recovery', 'Closed historical deal', 'CUS-recovery', 'won', 100, 'USR-recovery', stamp, stamp);
  sqlite.prepare('INSERT INTO crm_tasks(public_id,title,customer_id,opportunity_id,status,owner_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run('TSK-recovery', 'Completed historical task', 'CUS-recovery', 'OPP-recovery', 'done', 'USR-recovery', stamp, stamp);
  sqlite.prepare('INSERT INTO crm_activities(public_id,customer_id,opportunity_id,type,subject,actor_id,actor_name,occurred_at,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run('ACT-recovery', 'CUS-recovery', 'OPP-recovery', 'note', 'Fixture history', 'USR-recovery', 'Recovery staff', stamp, stamp);
  sqlite.prepare('INSERT INTO crm_audit(public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run('AUD-recovery', 'USR-recovery', 'Recovery staff', 'sales', 'created', 'customers', 'CUS-recovery', 'Fixture audit', stamp);
  sqlite.prepare('INSERT INTO crm_intake_links(public_id,source_resource,source_id,customer_id,opportunity_id,created_by,created_at) VALUES(?,?,?,?,?,?,?)').run('LINK-recovery', 'leads', 'LEAD-recovery', 'CUS-recovery', 'OPP-recovery', 'USR-recovery', stamp);
  sqlite.prepare(`INSERT INTO ops_quotes(public_id,quote_number,family_id,revision,customer_id,opportunity_id,owner_id,title,currency,seller_name,recipient_company,subtotal_minor,discount_minor,tax_minor,shipping_minor,total_minor,mutation_token,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run('QTE-recovery', 'QT-RECOVERY-R1', 'QTE-recovery', 1, 'CUS-recovery', 'OPP-recovery', 'USR-recovery', 'Historical quote', 'USD', 'Recovery seller', 'Recovery company', 2468, 68, 100, 200, 2700, 'recovery-mutation', stamp, stamp);
  sqlite.prepare('INSERT INTO ops_quote_items(public_id,quote_id,line_number,description,quantity,unit_price_minor,line_total_minor) VALUES(?,?,1,?,2,1234,2468)').run('QTI-recovery', 'QTE-recovery', 'Historical item');
  const draft = sqlite.prepare('SELECT * FROM ops_quotes WHERE public_id=?').get('QTE-recovery');
  const items = sqlite.prepare('SELECT line_number,sku,description,unit,quantity,unit_price_minor,line_total_minor FROM ops_quote_items WHERE quote_id=? ORDER BY line_number').all('QTE-recovery');
  const quotationSnapshot = JSON.stringify({ schema_version: 1, quote_id: draft.public_id, quote_number: draft.quote_number, family_id: draft.family_id, revision: draft.revision, revision_of: draft.revision_of,
    ...Object.fromEntries(CONTENT_FIELDS.map(field => [field, draft[field]])), subtotal_minor: draft.subtotal_minor, total_minor: draft.total_minor, currency_minor_digits: 2,
    items, issuer: { id: 'owner', name: 'Recovery owner' }, issued_at: stamp, timezone: 'Asia/Singapore', issued_date: '2026-11-03', created_date: '2026-11-03' });
  const quotationSha256 = createHash('sha256').update(quotationSnapshot).digest('hex');
  sqlite.prepare("UPDATE ops_quotes SET status='issued',snapshot_json=?,snapshot_sha256=?,issued_at=?,issued_by=? WHERE public_id=?").run(quotationSnapshot, quotationSha256, stamp, 'owner', 'QTE-recovery');
  sqlite.prepare("UPDATE ops_quotes SET status='accepted',outcome_note=?,outcome_recorded_at=?,outcome_recorded_by=? WHERE public_id=?").run('Manual recorded outcome', stamp, 'owner', 'QTE-recovery');
  sqlite.prepare('UPDATE crm_customers SET archived_at=? WHERE public_id=?').run(stamp, 'CUS-recovery');
  const trace = { batches: [], individualReads: [] };
  const db = {
    prepare(query) {
      return { sql: query, values: [], bind(...values) { this.values = values; return this; },
        async first() { trace.individualReads.push(query); return sqlite.prepare(query).get(...this.values) || null; },
        async all() { trace.individualReads.push(query); return { success: true, results: sqlite.prepare(query).all(...this.values), meta: { changes: 0 } }; },
        async run() { return { success: true, meta: { changes: Number(sqlite.prepare(query).run(...this.values).changes) } }; },
      };
    },
    async batch(statements) {
      trace.batches.push(statements.map(statement => statement.sql)); sqlite.exec('BEGIN IMMEDIATE');
      try {
        const output = [];
        for (const statement of statements) output.push(/^\s*(SELECT|PRAGMA)\b/i.test(statement.sql) ? { success: true, results: sqlite.prepare(statement.sql).all(...statement.values), meta: { changes: 0 } } : await statement.run());
        sqlite.exec('COMMIT'); return output;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { sqlite, db, trace, quotationSnapshot, quotationSha256 };
}

function makeBucket({ pageSize = 1000, putFailure = false, corruptRead = false, listFailure = false, deleteFailure = false } = {}) {
  const objects = new Map(), deleted = []; let puts = 0;
  const faults = { corruptRead, deleteFailure };
  return { objects, deleted, faults, get puts() { return puts; },
    async put(key, value, options = {}) { puts++; if (putFailure) return null; objects.set(key, { value, customMetadata: options.customMetadata, httpMetadata: options.httpMetadata }); return { key, size: Buffer.byteLength(value), etag: 'fixture-etag' }; },
    async get(key) { const object = objects.get(key); if (!object) return null; return { size: Buffer.byteLength(object.value), customMetadata: object.customMetadata, async text() { return object.value + (faults.corruptRead ? 'corrupt' : ''); } }; },
    async list({ prefix, cursor }) {
      if (listFailure) throw new Error('simulated listing failure');
      const keys = [...objects.keys()].filter(key => key.startsWith(prefix)).sort(), start = Number(cursor || 0), limit = pageSize;
      const page = keys.slice(start, start + limit); return { objects: page.map(key => ({ key })), truncated: start + limit < keys.length, cursor: String(start + limit) };
    },
    async delete(keys) { if (faults.deleteFailure) throw new Error('simulated delete failure'); for (const key of Array.isArray(keys) ? keys : [keys]) { deleted.push(key); objects.delete(key); } },
  };
}

await test('explicit snapshot covers all persistent tables, tracking and schema in one transaction', async () => {
  const fixture = makeDatabase(); const snapshot = await createBackupSnapshot(fixture.db);
  assert.deepEqual(Object.keys(snapshot.tables), [...BACKUP_TABLES, 'd1_migrations']);
  for (const table of BACKUP_TABLES) assert.equal(snapshot.manifest.counts[table], fixture.sqlite.prepare(`SELECT COUNT(*) n FROM ${table}`).get().n);
  assert.equal(snapshot.manifest.migrations.length, 10); assert.equal(snapshot.manifest.schema_version, 4);
  for (const table of EXCLUDED_BACKUP_TABLES) { assert.equal(snapshot.tables[table], undefined); assert.ok(snapshot.schema.some(row => row.name === table)); }
  assert.equal(fixture.trace.batches.length, 2); assert.ok(fixture.trace.batches[0].every(sql => sql.startsWith('PRAGMA table_info'))); assert.ok(fixture.trace.batches[1][0].includes('sqlite_master'));
  assert.equal(fixture.trace.individualReads.length, 2);
});
await test('restore into isolated SQLite preserves every row, historical links, passwords and audit guards', async () => {
  const fixture = makeDatabase(); const snapshot = await createBackupSnapshot(fixture.db);
  const restored = new DatabaseSync(':memory:'); restored.exec('PRAGMA foreign_keys=ON; BEGIN IMMEDIATE');
  const restoreSql = await backupToSql(snapshot); restored.exec(restoreSql); restored.exec('COMMIT');
  assert.deepEqual(restored.prepare('PRAGMA foreign_key_check').all(), []);
  for (const [table, rows] of Object.entries(snapshot.tables)) assert.deepEqual(restored.prepare(`SELECT * FROM ${table}`).all().map(row => ({ ...row })), rows.map(row => ({ ...row })));
  for (const table of EXCLUDED_BACKUP_TABLES) assert.equal(restored.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n, 0);
  assert.equal(restored.prepare('SELECT message FROM leads').get().message, trickyText);
  assert.ok(await verifyStaffPassword(staffPassword, restored.prepare('SELECT password_hash FROM admin_users').get().password_hash));
  assert.throws(() => restored.exec("UPDATE crm_audit SET summary='tampered'"), /append-only/);
  assert.throws(() => restored.exec("UPDATE crm_opportunities SET stage='negotiation'"), /active customer/);
  assert.equal(restored.prepare('SELECT snapshot_json FROM ops_quotes').get().snapshot_json, fixture.quotationSnapshot);
  assert.equal(restored.prepare('SELECT snapshot_sha256 FROM ops_quotes').get().snapshot_sha256, fixture.quotationSha256);
  const readDb = { prepare(sql) { return { sql, values: [], bind(...values) { this.values = values; return this; } }; }, async batch(statements) { return statements.map(statement => ({ success: true, results: restored.prepare(statement.sql).all(...statement.values) })); } };
  const printable = await quoteSnapshot(readDb, 'QTE-recovery', { id: 'owner', role: 'owner' });
  assert.equal(printable.document.total_minor, 2700); assert.ok(renderQuoteDocument(printable, { lang: 'zh' }).includes('27.00'));
  assert.throws(() => restored.exec("UPDATE ops_quotes SET terms='tampered'"), /immutable/);
  assert.throws(() => restored.exec("DELETE FROM ops_quote_items"), /immutable/);
  assert.equal(restored.prepare("SELECT seq FROM sqlite_sequence WHERE name='events'").get().seq, 999);
  assert.throws(() => restored.exec(restoreSql), /already exists/);
});

await test('verified daily writes use unique IDs, private metadata and no live sessions', async () => {
  const { db } = makeDatabase(), bucket = makeBucket();
  const first = await runBackup({ DB: db, R2: bucket }); const second = await runBackup({ DB: db, R2: bucket });
  assert.equal(first.ok, true); assert.equal(second.ok, true); assert.notEqual(first.key, second.key);
  const object = bucket.objects.get(first.key); assert.equal(object.customMetadata.sha256, first.sha256); assert.equal(object.httpMetadata.cacheControl, 'private, no-store');
  const snapshot = JSON.parse(object.value); assert.equal(snapshot.tables.admin_users.length, 1); assert.equal(snapshot.tables.admin_sessions, undefined);
});
await test('Sunday creates a verified weekly copy and paginated retention preserves 30 daily / 12 weekly dates', async () => {
  const RealDate = Date;
  globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-11-08T18:00:00.000Z'])); } static now() { return new RealDate('2026-11-08T18:00:00.000Z').getTime(); } };
  try {
    const { db } = makeDatabase(), bucket = makeBucket({ pageSize: 3 });
    for (let index = 0; index < 35; index++) {
      const date = new Date(Date.UTC(2026, 9, 1 + index)).toISOString().slice(0, 10);
      bucket.objects.set(`backups/daily/${date}.json`, { value: 'old fixture' });
      bucket.objects.set(`backups/committed/daily/${date}.json`, { value: 'verified fixture marker' });
    }
    for (let index = 1; index <= 14; index++) {
      const date = new Date(Date.UTC(2026, 10, 8 - index * 7)).toISOString().slice(0, 10);
      bucket.objects.set(`backups/weekly/${date}.json`, { value: 'old fixture' });
      bucket.objects.set(`backups/committed/weekly/${date}.json`, { value: 'verified fixture marker' });
    }
    bucket.objects.set('backups/daily/readme.txt', { value: 'preserve' });
    const result = await runBackup({ DB: db, R2: bucket });
    assert.equal(result.ok, true); assert.ok(result.weeklyKey); assert.equal(bucket.objects.get(result.key).value, bucket.objects.get(result.weeklyKey).value);
    assert.equal([...bucket.objects.keys()].filter(key => key.startsWith('backups/daily/') && key.endsWith('.json')).length, 30);
    assert.equal([...bucket.objects.keys()].filter(key => key.startsWith('backups/weekly/') && key.endsWith('.json')).length, 12);
    assert.ok(bucket.objects.has('backups/daily/readme.txt')); assert.ok(result.retention.daily.deleted > 0);
  } finally { globalThis.Date = RealDate; }
});
await test('R2 null write fails closed without pruning successful history', async () => {
  const { db } = makeDatabase(), bucket = makeBucket({ putFailure: true });
  const result = await runBackup({ DB: db, R2: bucket }); assert.equal(result.ok, false); assert.equal(result.reason, 'BACKUP_R2_WRITE_FAILED'); assert.equal(bucket.deleted.length, 0);
});
await test('R2 corrupt readback is rejected before retention', async () => {
  const { db } = makeDatabase(), bucket = makeBucket({ corruptRead: true });
  const result = await runBackup({ DB: db, R2: bucket }); assert.equal(result.ok, false); assert.equal(result.reason, 'BACKUP_R2_VERIFY_FAILED'); assert.equal(bucket.objects.size, 0); assert.equal(bucket.deleted.length, 1);
});
await test('unknown app tables and incomplete migrations cannot silently produce a partial backup', async () => {
  const unknown = makeDatabase(); unknown.sqlite.exec('CREATE TABLE future_business_data(id INTEGER)');
  await assert.rejects(createBackupSnapshot(unknown.db), /BACKUP_UNTRACKED_TABLE/);
  const incomplete = makeDatabase(); incomplete.sqlite.exec('DROP TABLE crm_intake_links');
  await assert.rejects(createBackupSnapshot(incomplete.db), /BACKUP_SCHEMA_INCOMPLETE/);
});
await test('a truncated D1 result fails row-count verification', async () => {
  const { db } = makeDatabase(); const original = db.batch.bind(db);
  db.batch = async statements => { const result = await original(statements); if (statements[0].sql.includes('sqlite_master')) result[2].results = []; return result; };
  await assert.rejects(createBackupSnapshot(db), /BACKUP_INCOMPLETE_TABLE/);
});
await test('snapshot size limits produce an explicit failure', async () => {
  const { db, sqlite, trace } = makeDatabase(); sqlite.prepare('UPDATE crm_customers SET notes=?').run('x'.repeat(MAX_BACKUP_BYTES));
  await assert.rejects(createBackupSnapshot(db), /BACKUP_BYTE_LIMIT/); assert.equal(trace.batches.length, 1);
  assert.ok(trace.batches[0].every(sql => sql.startsWith('PRAGMA')));
});
await test('known excessive row counts fail before materializing table rows', async () => {
  const { db, sqlite, trace } = makeDatabase();
  sqlite.exec(`WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < ${MAX_BACKUP_ROWS}) INSERT INTO events(event_id,event_type) SELECT 'EVT-limit-'||n,'limit.fixture' FROM seq`);
  await assert.rejects(createBackupSnapshot(db), /BACKUP_ROW_LIMIT/); assert.equal(trace.batches.length, 1);
});
await test('concurrent byte growth is guarded inside the snapshot transaction before rows return', async () => {
  const { db, sqlite } = makeDatabase(); const original = db.batch.bind(db); let returnedRows = -1;
  db.batch = async statements => {
    if (!statements[0].sql.includes('sqlite_master')) return original(statements);
    sqlite.prepare('UPDATE crm_customers SET notes=?').run('x'.repeat(MAX_BACKUP_BYTES));
    const result = await original(statements);
    returnedRows = statements.reduce((count, statement, index) => count + (statement.sql.startsWith('SELECT *') ? result[index].results.length : 0), 0);
    return result;
  };
  await assert.rejects(createBackupSnapshot(db), /BACKUP_BYTE_LIMIT/); assert.equal(returnedRows, 0);
});
await test('failed payloads without commit markers never displace verified retention dates', async () => {
  const RealDate = Date; let moment = '2026-11-04T18:00:00.000Z';
  globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [moment])); } static now() { return new RealDate(moment).getTime(); } };
  try {
    const { db } = makeDatabase(), bucket = makeBucket({ pageSize: 3, corruptRead: true, deleteFailure: true });
    for (let index = 0; index < 30; index++) {
      const date = new Date(Date.UTC(2026, 9, 1 + index)).toISOString().slice(0, 10);
      bucket.objects.set(`backups/daily/${date}.json`, { value: 'verified historical fixture' });
      bucket.objects.set(`backups/committed/daily/${date}.json`, { value: 'historical marker' });
    }
    for (let day = 4; day <= 8; day++) { moment = `2026-11-0${day}T18:00:00.000Z`; assert.equal((await runBackup({ DB: db, R2: bucket })).ok, false); }
    bucket.faults.corruptRead = false; bucket.faults.deleteFailure = false; moment = '2026-11-09T18:00:00.000Z';
    const result = await runBackup({ DB: db, R2: bucket }); assert.equal(result.ok, true);
    assert.equal([...bucket.objects.keys()].filter(key => key.startsWith('backups/committed/daily/')).length, 30);
    assert.ok(bucket.objects.has('backups/daily/2026-10-02.json')); assert.equal(bucket.objects.has('backups/daily/2026-10-01.json'), false);
    assert.equal([...bucket.objects.keys()].filter(key => /^backups\/daily\/2026-11-0[4-8]T/.test(key)).length, 5);
  } finally { globalThis.Date = RealDate; }
});
await test('restore rejects schema tampering, missing rows, session data and legacy format', async () => {
  const { db } = makeDatabase(), snapshot = await createBackupSnapshot(db);
  const schema = structuredClone(snapshot); schema.schema[0].sql += ' '; await assert.rejects(backupToSql(schema), /RESTORE_SCHEMA_CHECKSUM/);
  const rows = structuredClone(snapshot); rows.tables.leads = []; await assert.rejects(backupToSql(rows), /RESTORE_ROW_COUNT/);
  const sessions = structuredClone(snapshot); sessions.tables.admin_sessions = []; await assert.rejects(backupToSql(sessions), /RESTORE_SESSION_DATA_FORBIDDEN/);
  await assert.rejects(backupToSql({ manifest: { schema_version: 1 }, tables: {} }), /RESTORE_UNSUPPORTED_FORMAT/);
});
await test('optional migration tracking is accurately identified', async () => {
  const { db } = makeDatabase({ withTracking: false }), snapshot = await createBackupSnapshot(db);
  assert.equal(snapshot.manifest.migration_tracking_table, null); assert.deepEqual(snapshot.manifest.migrations, []); assert.equal(snapshot.tables.d1_migrations, undefined);
});
await test('core format-2 snapshots remain restorable after quote format-3 release', async () => {
  const { db } = makeDatabase(), snapshot = await createBackupSnapshot(db);
  const legacy = structuredClone(snapshot);
  legacy.manifest.schema_version = 2; legacy.manifest.application_schema_baseline = 'admin-workspace-0005';
  const quoteTables = ['ops_quotes', 'ops_quote_items',...EXTENDED_BACKUP_TABLES];
  for (const table of quoteTables) { delete legacy.tables[table]; delete legacy.manifest.counts[table]; }
  legacy.manifest.table_names = legacy.manifest.table_names.filter(table => !quoteTables.includes(table));
  legacy.schema = legacy.schema.filter(row => !quoteTables.includes(row.tbl_name) && !row.name.startsWith('ops_quote_'));
  legacy.sequences = legacy.sequences.filter(row => !quoteTables.includes(row.name));
  legacy.tables.d1_migrations = legacy.tables.d1_migrations.filter(row => row.name < '0006');
  legacy.manifest.counts.d1_migrations = legacy.tables.d1_migrations.length;
  legacy.manifest.migrations = legacy.tables.d1_migrations; legacy.manifest.migration_version = '0005_crm_relation_guards.sql';
  legacy.manifest.schema_sha256 = await sha256Hex(JSON.stringify(legacy.schema));
  const restored = new DatabaseSync(':memory:'); restored.exec('PRAGMA foreign_keys=ON; BEGIN IMMEDIATE');
  restored.exec(await backupToSql(legacy)); restored.exec('COMMIT');
  assert.deepEqual(restored.prepare('PRAGMA foreign_key_check').all(), []);
  assert.equal(restored.prepare('SELECT COUNT(*) AS n FROM crm_customers').get().n, 1);
  assert.equal(restored.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name='ops_quotes'").get().n, 0);
  assert.equal(restored.prepare('SELECT COUNT(*) AS n FROM admin_sessions').get().n, 0);
  restored.exec(readFileSync(new URL('../migrations/0006_operations_quotes.sql', import.meta.url), 'utf8'));
  assert.equal(restored.prepare('SELECT COUNT(*) AS n FROM ops_quotes').get().n, 0);
});
await test('session table schema is required even though its live rows are excluded', async () => {
  const { db, sqlite } = makeDatabase(); sqlite.exec('DROP TABLE admin_owner_sessions');
  await assert.rejects(createBackupSnapshot(db), /BACKUP_SCHEMA_INCOMPLETE/);
});
await test('retention failure remains visible without invalidating a verified new snapshot', async () => {
  const { db } = makeDatabase(), bucket = makeBucket({ listFailure: true });
  const result = await runBackup({ DB: db, R2: bucket }); assert.equal(result.ok, true); assert.equal(result.retention.daily.ok, false); assert.equal(result.retention.weekly.ok, false);
});
await test('missing storage bindings cannot report success', async () => {
  assert.equal((await runBackup({})).ok, false);
});

await test('owner recovery history and SQL downloads verify committed payloads and deny managers',async()=>{
 const {db}=makeDatabase(),bucket=makeBucket(),env={DB:db,R2:bucket,ADMIN_PASSWORD:'recovery-fixture-password'},owner={id:'owner',name:'Recovery owner',role:'owner'};
 const result=await runBackup(env);assert.equal(result.ok,true);
 const filename=result.key.split('/').at(-1),base='https://test.example/admin/api/system/backups';
 const history=await handleAdminSystem(new Request(base),env,owner,'test');assert.equal(history.status,200);assert.equal((await history.json()).data[0].filename,filename);
 const verify=await handleAdminSystem(new Request(base+'/'+filename+'/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:env.ADMIN_PASSWORD})}),env,owner,'test');assert.equal(verify.status,200);assert.equal((await verify.json()).data.verified,true);
 const download=await handleAdminSystem(new Request(base+'/'+filename+'/sql'),env,owner,'test');assert.equal(download.status,200);assert.ok((await download.text()).includes('CREATE TABLE'));
 const denied=await handleAdminSystem(new Request(base+'/'+filename+'/json'),env,{id:'manager',role:'manager'},'test');assert.equal(denied.status,403);
 bucket.faults.corruptRead=true;assert.equal((await handleAdminSystem(new Request(base+'/'+filename+'/sql'),env,owner,'test')).status,409);
});

await test('long Unicode and JSON values restore intact through bounded D1 statements',async()=>{
  const fixture=makeDatabase();
  const text=("中'文😀\0".repeat(14000)).slice(0,100000);
  fixture.sqlite.prepare('UPDATE leads SET message=? WHERE public_id=?').run(text,'LEAD-recovery');
  const payload=JSON.stringify({text,valid:true});
  fixture.sqlite.prepare('UPDATE events SET payload_json=? WHERE event_id=?').run(payload,'EVT-recovery');
  const snapshot=await createBackupSnapshot(fixture.db),sql=await backupToSql(snapshot);
  assert.ok(sql.includes('CREATE TABLE "__gyutron_restore_text"'));
  // Every generated text chunk is below the platform statement limit, even
  // when NUL encoding doubles the UTF-8 representation.
  for(const line of sql.split('\n').filter(line=>line.startsWith('INSERT INTO')))assert.ok(Buffer.byteLength(line)<48000);
  const restored=new DatabaseSync(':memory:');restored.exec('PRAGMA foreign_keys=ON;BEGIN');restored.exec(sql);restored.exec('COMMIT');
  assert.equal(restored.prepare('SELECT message FROM leads WHERE public_id=?').get('LEAD-recovery').message,text);
  assert.deepEqual(JSON.parse(restored.prepare('SELECT payload_json FROM events WHERE event_id=?').get('EVT-recovery').payload_json),{text,valid:true});
  assert.equal(restored.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE name='__gyutron_restore_text'").get().n,0);
  assert.deepEqual(restored.prepare('PRAGMA foreign_key_check').all(),[]);
  restored.close();fixture.sqlite.close();
});

console.log(JSON.stringify({ passed, failed: failures.length, checks: passed + failures.length, storage: 'real SQLite; R2 failure behavior tested with an in-memory mock', productionWrites: false, ...(failures.length ? { failures } : {}) }, null, 2));
if (failures.length) process.exitCode = 1;
