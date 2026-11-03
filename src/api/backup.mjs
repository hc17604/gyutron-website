/** Consistent D1 snapshots to private R2. Recovery: docs/admin-backup-recovery.md. */
import { emitEvent } from '../platform/db/events.mjs';
import { getDb } from '../platform/db/client.mjs';
import { sha256Hex } from '../platform/security/hash.mjs';

// Independent of config.TABLES, which also governs public Data API access.
const CORE_BACKUP_TABLES = Object.freeze([
  'leads', 'rfqs', 'support_requests', 'download_requests',
  'order_intents', 'order_intent_items', 'events', 'api_keys',
  'crm_customers', 'crm_opportunities', 'crm_tasks', 'crm_activities',
  'crm_audit', 'crm_intake_links', 'admin_users',
]);
export const BACKUP_TABLES = Object.freeze([...CORE_BACKUP_TABLES, 'ops_quotes', 'ops_quote_items']);
export const EXCLUDED_BACKUP_TABLES = Object.freeze(['admin_sessions', 'admin_owner_sessions', 'admin_login_attempts']);
export const BACKUP_SCHEMA_VERSION = 3;
export const MAX_BACKUP_ROWS = 25000;
export const MAX_BACKUP_BYTES = 8 * 1024 * 1024;
const MAX_DATA_BYTES = MAX_BACKUP_BYTES - 256 * 1024;
const DAILY_KEEP = 30, WEEKLY_KEEP = 12;
const encoder = new TextEncoder();
const optionalTables = ['d1_migrations'];
const permittedTables = new Set([...BACKUP_TABLES, ...EXCLUDED_BACKUP_TABLES, ...optionalTables]);
const requiredSchemaTables = [...BACKUP_TABLES, ...EXCLUDED_BACKUP_TABLES];
const identifier = name => '"' + name.replaceAll('"', '""') + '"';
const isApplicationTable = name => !name.startsWith('sqlite_') && !name.startsWith('_cf_');
const fail = code => Object.assign(new Error(code), { backupCode: code });

/** Schema, row-count and data reads in this batch share one D1 transaction. */
export async function createBackupSnapshot(db, { exportedAt = new Date().toISOString(), backupId = crypto.randomUUID() } = {}) {
  const found = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
  const names = new Set((found.results || []).map(row => row.name));
  if (requiredSchemaTables.some(table => !names.has(table))) throw fail('BACKUP_SCHEMA_INCOMPLETE');
  if ([...names].some(name => isApplicationTable(name) && !permittedTables.has(name))) throw fail('BACKUP_UNTRACKED_TABLE');
  const tableNames = [...BACKUP_TABLES, ...optionalTables.filter(table => names.has(table))];
  const columnInfo = await db.batch(tableNames.map(table => db.prepare(`PRAGMA table_info(${identifier(table)})`)));
  if (columnInfo.some(item => item.success === false)) throw fail('BACKUP_SCHEMA_INCOMPLETE');
  const countsSql = tableNames.map(table => `(SELECT COUNT(*) FROM ${identifier(table)})`);
  const bytesSql = tableNames.map((table, index) => {
    const columns = (columnInfo[index].results || []).map(row => row.name);
    if (!columns.length || columns.some(column => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column))) throw fail('BACKUP_UNSUPPORTED_COLUMN');
    const object = `json_object(${columns.flatMap(column => [`'${column}'`, identifier(column)]).join(',')})`;
    return `(SELECT COALESCE(SUM(length(CAST(${object} AS BLOB)) + 1),0) FROM ${identifier(table)})`;
  });
  const rowsExpression = countsSql.join(' + '), bytesExpression = bytesSql.join(' + ');
  const statsSql = `SELECT ${rowsExpression} AS row_count, ${bytesExpression} AS byte_count, ${countsSql.map((sql, index) => `${sql} AS ${identifier('count_' + tableNames[index])}`).join(',')}`;
  const estimate = await db.prepare(statsSql).first();
  if (Number(estimate?.row_count) > MAX_BACKUP_ROWS) throw fail('BACKUP_ROW_LIMIT');
  if (Number(estimate?.byte_count) > MAX_DATA_BYTES) throw fail('BACKUP_BYTE_LIMIT');
  const queries = [db.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY type, name")];
  queries.push(db.prepare(statsSql));
  for (const table of tableNames) {
    // The same bound is repeated inside each SELECT, in the SAME transaction.
    // If data grows after preflight, SQL returns no rows instead of allocating
    // an oversized result inside the 128 MiB Worker isolate.
    queries.push(db.prepare(`SELECT * FROM ${identifier(table)} WHERE (${rowsExpression}) <= ${MAX_BACKUP_ROWS} AND (${bytesExpression}) <= ${MAX_DATA_BYTES} LIMIT ${MAX_BACKUP_ROWS + 1}`));
  }
  const sequenceIndex = queries.length;
  if (names.has('sqlite_sequence')) queries.push(db.prepare('SELECT name, seq FROM sqlite_sequence ORDER BY name'));
  const result = await db.batch(queries);
  if (result.some(item => item.success === false)) throw fail('BACKUP_SNAPSHOT_FAILED');
  const stats = result[1].results?.[0];
  if (!stats || !Number.isSafeInteger(Number(stats.row_count)) || !Number.isSafeInteger(Number(stats.byte_count))) throw fail('BACKUP_SNAPSHOT_FAILED');
  if (Number(stats.row_count) > MAX_BACKUP_ROWS) throw fail('BACKUP_ROW_LIMIT');
  if (Number(stats.byte_count) > MAX_DATA_BYTES) throw fail('BACKUP_BYTE_LIMIT');
  const schema = result[0].results || [];
  const currentTables = schema.filter(row => row.type === 'table').map(row => row.name);
  if (requiredSchemaTables.some(name => !currentTables.includes(name)) || schema.some(row => !permittedTables.has(row.tbl_name)) || currentTables.some(name => optionalTables.includes(name) && !tableNames.includes(name))) throw fail('BACKUP_SCHEMA_CHANGED');
  const tables = {}, counts = {};
  for (let index = 0; index < tableNames.length; index++) {
    const table = tableNames[index], rows = result[2 + index].results || [];
    const actual = Number(stats['count_' + table]);
    if (!Number.isSafeInteger(actual) || actual !== rows.length) throw fail('BACKUP_INCOMPLETE_TABLE');
    tables[table] = rows; counts[table] = actual;
  }
  if (Object.values(counts).reduce((sum, value) => sum + value, 0) > MAX_BACKUP_ROWS) throw fail('BACKUP_ROW_LIMIT');
  const sequences = names.has('sqlite_sequence') ? (result[sequenceIndex].results || []).filter(row => tableNames.includes(row.name)) : [];
  const snapshot = {
    manifest: {
      schema_version: BACKUP_SCHEMA_VERSION, application_schema_baseline: 'operations-quotes-0006',
      backup_id: backupId, exported_at: exportedAt, date: exportedAt.slice(0, 10), timezone: 'UTC',
      table_names: tableNames, excluded_tables: [...EXCLUDED_BACKUP_TABLES], counts,
      migration_tracking_table: names.has('d1_migrations') ? 'd1_migrations' : null,
      migrations: (tables.d1_migrations || []).map(row => ({ ...row })),
      migration_version: (tables.d1_migrations || []).map(row => row.name).filter(name => typeof name === 'string').sort().at(-1) || null,
      schema_sha256: await sha256Hex(JSON.stringify(schema)),
      contains_password_hashes: true, restores_active_sessions: false,
    }, schema, sequences, tables,
  };
  if (encoder.encode(JSON.stringify(snapshot)).byteLength > MAX_BACKUP_BYTES) throw fail('BACKUP_BYTE_LIMIT');
  return snapshot;
}

async function writeVerified(bucket, key, payload, sha256, backupId) {
  const size = encoder.encode(payload).byteLength;
  const stored = await bucket.put(key, payload, {
    httpMetadata: { contentType: 'application/json', cacheControl: 'private, no-store' },
    customMetadata: { sha256, backup_id: backupId, schema_version: String(BACKUP_SCHEMA_VERSION), sensitive: 'password-hashes' },
  });
  if (!stored) throw fail('BACKUP_R2_WRITE_FAILED');
  try {
    const readback = await bucket.get(key);
    if (!readback || (readback.size != null && readback.size !== size)) throw fail('BACKUP_R2_VERIFY_FAILED');
    const text = await readback.text();
    if (encoder.encode(text).byteLength !== size || await sha256Hex(text) !== sha256 || readback.customMetadata?.sha256 !== sha256) throw fail('BACKUP_R2_VERIFY_FAILED');
  } catch (error) {
    try { await bucket.delete(key); } catch { /* Uncommitted orphan never affects retention. */ }
    throw error;
  }
  // A marker is written only AFTER the full payload was verified. Retention
  // counts markers, never failed/orphaned payloads or unknown legacy objects.
  // If this write has an uncertain outcome, retain the VERIFIED payload: a
  // possibly persisted marker must never point to content we just removed.
  const markerKey = key.replace(/^backups\//, 'backups/committed/');
  const marker = await bucket.put(markerKey, JSON.stringify({ key, backup_id: backupId, sha256, verified: true }), {
    httpMetadata: { contentType: 'application/json', cacheControl: 'private, no-store' },
    customMetadata: { payload_key: key, sha256, backup_id: backupId },
  });
  if (!marker) throw fail('BACKUP_R2_COMMIT_FAILED');
}

/** Keep the latest successful UTC dates, preserving multiple runs on one day. */
async function prune(bucket, prefix, keep) {
  try {
    const markerPrefix = prefix.replace(/^backups\//, 'backups/committed/');
    const objects = []; let cursor;
    do {
      const page = await bucket.list({ prefix: markerPrefix, limit: 1000, ...(cursor ? { cursor } : {}) });
      objects.push(...(page.objects || []));
      if (page.truncated && (!page.cursor || page.cursor === cursor)) throw fail('BACKUP_RETENTION_CURSOR');
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
    const dated = objects.map(object => ({ key: object.key, date: object.key.slice(markerPrefix.length).match(/^(\d{4}-\d{2}-\d{2})(?:T[^/]+)?\.json$/)?.[1] })).filter(object => object.date);
    const keepDates = new Set([...new Set(dated.map(object => object.date))].sort().slice(-keep));
    const remove = dated.filter(object => !keepDates.has(object.date)).flatMap(object => [object.key.replace(/^backups\/committed\//, 'backups/'), object.key]);
    for (let offset = 0; offset < remove.length; offset += 1000) await bucket.delete(remove.slice(offset, offset + 1000));
    return { ok: true, deleted: remove.length };
  } catch (error) {
    console.error('backup retention failed', error?.backupCode || error?.name || 'Error');
    return { ok: false };
  }
}

/** Existing scheduled Worker entry point. Snapshot contents never enter logs. */
export async function runBackup(env) {
  const db = getDb(env);
  if (!db || !env.R2) {
    console.error('backup skipped: missing storage binding');
    return { ok: false, reason: 'missing binding' };
  }
  const exportedAt = new Date().toISOString(), backupId = crypto.randomUUID();
  try {
    const snapshot = await createBackupSnapshot(db, { exportedAt, backupId });
    const payload = JSON.stringify(snapshot), sha256 = await sha256Hex(payload);
    const stamp = exportedAt.replaceAll(':', '-').replaceAll('.', '-');
    const filename = `${stamp}-${backupId}.json`, key = `backups/daily/${filename}`;
    await writeVerified(env.R2, key, payload, sha256, backupId);
    const weeklyKey = new Date(exportedAt).getUTCDay() === 0 ? `backups/weekly/${filename}` : null;
    if (weeklyKey) await writeVerified(env.R2, weeklyKey, payload, sha256, backupId);
    const retention = { daily: await prune(env.R2, 'backups/daily/', DAILY_KEEP), weekly: await prune(env.R2, 'backups/weekly/', WEEKLY_KEEP) };
    await emitEvent(db, env, {
      eventType: 'backup.created', entityType: 'backup', entityId: backupId,
      payload: { backup_id: backupId, key, weekly_key: weeklyKey, counts: snapshot.manifest.counts, schema_version: BACKUP_SCHEMA_VERSION, verified: true, retention_ok: retention.daily.ok && retention.weekly.ok },
    });
    return { ok: true, date: snapshot.manifest.date, backupId, key, weeklyKey, counts: snapshot.manifest.counts, sha256, retention };
  } catch (error) {
    const reason = error?.backupCode || 'BACKUP_FAILED';
    console.error('backup failed', reason);
    await emitEvent(db, env, { eventType: 'backup.failed', entityType: 'backup', entityId: backupId, payload: { reason } });
    return { ok: false, reason, backupId };
  }
}

function sqlValue(value) {
  if (value == null) return 'NULL';
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value))) throw fail('RESTORE_INVALID_NUMBER');
    return String(value);
  }
  if (typeof value !== 'string') throw fail('RESTORE_UNSUPPORTED_VALUE');
  if (value.includes('\0')) return `CAST(X'${Array.from(encoder.encode(value), byte => byte.toString(16).padStart(2, '0')).join('')}' AS TEXT)`;
  return `'${value.replaceAll("'", "''")}'`;
}

/** Offline recovery helper. Output is for a NEW isolated DB, never an HTTP route. */
export async function backupToSql(snapshot) {
  const manifest = snapshot?.manifest;
  const formatTables = manifest?.schema_version === 2 ? CORE_BACKUP_TABLES : manifest?.schema_version === BACKUP_SCHEMA_VERSION ? BACKUP_TABLES : null;
  if (!formatTables || !Array.isArray(snapshot.schema) || !snapshot.tables || typeof snapshot.tables !== 'object') throw fail('RESTORE_UNSUPPORTED_FORMAT');
  const restorePermitted = new Set([...formatTables, ...EXCLUDED_BACKUP_TABLES, ...optionalTables]);
  if (await sha256Hex(JSON.stringify(snapshot.schema)) !== manifest.schema_sha256) throw fail('RESTORE_SCHEMA_CHECKSUM');
  if (EXCLUDED_BACKUP_TABLES.some(table => table in snapshot.tables)) throw fail('RESTORE_SESSION_DATA_FORBIDDEN');
  const tableNames = Object.keys(snapshot.tables);
  if (formatTables.some(table => !tableNames.includes(table)) || tableNames.some(table => !restorePermitted.has(table))) throw fail('RESTORE_TABLE_LIST');
  if (!Array.isArray(manifest.table_names) || [...manifest.table_names].sort().join(',') !== [...tableNames].sort().join(',')) throw fail('RESTORE_TABLE_LIST');
  for (const table of tableNames) if (!Array.isArray(snapshot.tables[table]) || snapshot.tables[table].length !== manifest.counts?.[table]) throw fail('RESTORE_ROW_COUNT');
  const schemaTables = snapshot.schema.filter(row => row.type === 'table').map(row => row.name);
  if ([...formatTables, ...EXCLUDED_BACKUP_TABLES, ...tableNames].some(table => !schemaTables.includes(table)) || new Set(snapshot.schema.map(row => row.name)).size !== snapshot.schema.length) throw fail('RESTORE_SCHEMA_INCOMPLETE');
  if (snapshot.schema.some(row => !['table', 'index', 'trigger', 'view'].includes(row.type) || !restorePermitted.has(row.tbl_name) || typeof row.sql !== 'string' || !/^CREATE\s/i.test(row.sql))) throw fail('RESTORE_SCHEMA_INVALID');
  const strictDdl = row => row.sql.replace(/^(CREATE\s+(?:UNIQUE\s+)?(?:TABLE|INDEX|TRIGGER|VIEW))\s+IF\s+NOT\s+EXISTS\s+/i, '$1 ') + ';';
  const lines = ['-- Sensitive recovery SQL: contains customer records and password hashes.', '-- Restore only into a NEW isolated database. Existing tables cause a failure.', 'PRAGMA defer_foreign_keys = ON;'];
  lines.push(...snapshot.schema.filter(row => row.type === 'table').map(strictDdl));
  for (const table of tableNames) {
    for (const row of snapshot.tables[table]) {
      const columns = Object.keys(row);
      if (!columns.length || columns.some(column => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column))) throw fail('RESTORE_COLUMN_INVALID');
      lines.push(`INSERT INTO ${identifier(table)} (${columns.map(identifier).join(',')}) VALUES (${columns.map(column => sqlValue(row[column])).join(',')});`);
    }
  }
  for (const sequence of snapshot.sequences || []) {
    if (!tableNames.includes(sequence.name) || !Number.isSafeInteger(sequence.seq) || sequence.seq < 0) throw fail('RESTORE_SEQUENCE_INVALID');
    lines.push(`UPDATE sqlite_sequence SET seq = MAX(seq, ${sequence.seq}) WHERE name = ${sqlValue(sequence.name)};`);
    lines.push(`INSERT INTO sqlite_sequence (name,seq) SELECT ${sqlValue(sequence.name)},${sequence.seq} WHERE NOT EXISTS(SELECT 1 FROM sqlite_sequence WHERE name = ${sqlValue(sequence.name)});`);
  }
  // Install guards AFTER restoring valid historical rows: closed opportunities
  // may legitimately belong to archived customers in the source snapshot.
  lines.push(...snapshot.schema.filter(row => row.type !== 'table').map(strictDdl));
  lines.push('PRAGMA foreign_key_check;');
  return lines.join('\n') + '\n';
}
