/** Real SQLite checks for exact dashboard money beyond JavaScript's safe integer range. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { readWorkspaceDashboard } from '../src/platform/crm/repository.mjs';

const sqlite = new DatabaseSync(':memory:');
sqlite.exec('PRAGMA foreign_keys=ON');
for (const migration of ['0001_init.sql', '0002_order_intents.sql', '0003_admin_workspace.sql', '0004_admin_identity.sql', '0005_crm_relation_guards.sql', '0006_operations_quotes.sql']) {
  sqlite.exec(readFileSync(new URL('../migrations/' + migration, import.meta.url), 'utf8'));
}
let returnedRows = 0;
const db = {
  prepare(sql) {
    return {
      sql, values: [],
      bind(...values) { this.values = values; return this; },
      async all() {
        const rows = sqlite.prepare(sql).all(...this.values);
        returnedRows += rows.length;
        return { success: true, results: rows, meta: { changes: 0 } };
      },
    };
  },
  async batch(statements) {
    sqlite.exec('BEGIN');
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.all());
      sqlite.exec('COMMIT');
      return results;
    } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  },
};
const viewer = { id: 'USER-aggregation-viewer', name: 'Aggregation QA', role: 'viewer' };
const stamp = '2026-11-03T00:00:00.000Z';
const dashboard = () => readWorkspaceDashboard(db, viewer, { timeZone: 'Asia/Singapore' });
const group = (data, currency, stage) => data.pipeline.find(row => row.currency === currency && row.stage === stage);
let passed = 0;
const failures = [];
async function test(name, run) {
  try { await run(); passed++; }
  catch (error) { failures.push({ name, error: error.message, stack: error.stack }); }
}

await test('empty database returns empty pipeline and real zero counts', async () => {
  const data = await dashboard();
  assert.deepEqual(data.pipeline, []);
  assert.equal(data.counts.customers, 0);
  assert.equal(data.counts.open_opportunities, 0);
});

sqlite.prepare('INSERT INTO crm_customers(public_id,name,owner_id,created_at,updated_at) VALUES(?,?,?,?,?)')
  .run('CUS-aggregation', 'Synthetic aggregation QA', 'owner', stamp, stamp);
const insert = sqlite.prepare('INSERT INTO crm_opportunities(public_id,title,customer_id,stage,amount_minor,currency,owner_id,archived_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)');
let sequence = 0;
function add(amount, currency = 'USD', stage = 'qualification', archived = false) {
  insert.run('OPP-aggregation-' + ++sequence, 'Synthetic opportunity ' + sequence, 'CUS-aggregation', stage, amount, currency, 'owner', archived ? stamp : null, stamp, stamp);
}
sqlite.exec('BEGIN');
for (let index = 0; index < 9010; index++) add(1000000000000);
add(1);
for (let index = 0; index < 9007; index++) add(1000000000000, 'CNY', 'proposal');
add(199254740991, 'CNY', 'proposal'); // Sum is exactly Number.MAX_SAFE_INTEGER.
add(1999, 'USD', 'negotiation'); add(1999, 'USD', 'negotiation'); add(5, 'USD', 'negotiation');
add(125001, 'JPY');
add(999999, 'EUR', 'discovery'); add(999999, 'EUR', 'discovery'); add(2, 'EUR', 'discovery');
add(0, 'GBP', 'proposal');
add(9876, 'EUR', 'lost'); add(3456, 'USD', 'won');
add(1000000000000, 'USD', 'qualification', true);
sqlite.exec('COMMIT');

await test('9010 maximum-value opportunities plus one minor unit retain the final digit', async () => {
  const row = group(await dashboard(), 'USD', 'qualification');
  assert.equal(row.count, 9011);
  assert.equal(row.amount_minor_exact, '9010000000000001');
  assert.equal(row.amount_minor, null);
  assert.equal(BigInt(row.amount_minor_exact), 9010n * 1000000000000n + 1n);
  assert.doesNotThrow(() => JSON.stringify(row));
});

await test('safe-integer compatibility includes the exact maximum safe integer', async () => {
  const data = await dashboard();
  const boundary = group(data, 'CNY', 'proposal');
  assert.equal(boundary.amount_minor_exact, '9007199254740991');
  assert.equal(boundary.amount_minor, Number.MAX_SAFE_INTEGER);
  const normal = group(data, 'USD', 'negotiation');
  assert.equal(normal.amount_minor_exact, '4003');
  assert.equal(normal.amount_minor, 4003);
});

await test('currency and stage groups stay separate, zero groups survive and remainders carry exactly', async () => {
  const data = await dashboard();
  assert.equal(group(data, 'JPY', 'qualification').amount_minor_exact, '125001');
  assert.equal(group(data, 'EUR', 'discovery').amount_minor_exact, '2000000');
  assert.equal(group(data, 'GBP', 'proposal').amount_minor_exact, '0');
  assert.equal(group(data, 'GBP', 'proposal').amount_minor, 0);
  assert.equal(group(data, 'EUR', 'lost').amount_minor_exact, '9876');
  const openUsd = data.pipeline.filter(row => row.currency === 'USD' && !['won', 'lost'].includes(row.stage))
    .reduce((total, row) => total + BigInt(row.amount_minor_exact), 0n);
  assert.equal(openUsd.toString(), '9010000000004004');
  assert.equal(data.pipeline.length, 8);
});

await test('archived opportunities are excluded and dashboard reads only aggregate result rows', async () => {
  returnedRows = 0;
  const data = await dashboard();
  assert.equal(data.counts.customers, 1);
  assert.equal(data.counts.open_opportunities, 18027);
  assert.equal(group(data, 'USD', 'qualification').count, 9011);
  assert.ok(returnedRows < 100, 'A dashboard must not materialize its 18,000+ source opportunity rows.');
});

sqlite.close();
console.log(JSON.stringify({ passed, failed: failures.length, checks: passed + failures.length, fixtureOpportunities: sequence, storage: 'real SQLite in memory', productionWrites: false, ...(failures.length ? { failures } : {}) }, null, 2));
if (failures.length) process.exitCode = 1;
