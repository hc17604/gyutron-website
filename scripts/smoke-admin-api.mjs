/** Real SQLite integration checks for CRM SQL, atomic audit, roles and HTTP APIs.
 * Uses Node 24 built-in SQLite; no service credentials or production writes.
 */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handleAdminApi, workspaceCsv } from '../src/api/admin-api.mjs';
import { validatePayload } from '../src/platform/crm/schema.mjs';
import { workspaceDate, workspaceTimeZone } from '../src/platform/crm/time.mjs';
import { handleLegacyAdmin } from '../src/api/admin-legacy.mjs';

const sqlite = new DatabaseSync(':memory:');
sqlite.exec('PRAGMA foreign_keys=ON');
for (const name of ['0001_init.sql', '0002_order_intents.sql', '0003_admin_workspace.sql', '0004_admin_identity.sql', '0005_crm_relation_guards.sql']) sqlite.exec(readFileSync(new URL(`../migrations/${name}`, import.meta.url), 'utf8'));
for (const [id, role, active] of [['USER-sales', 'sales', 1], ['USER-viewer', 'viewer', 1], ['USER-manager', 'manager', 1], ['USER-inactive', 'sales', 0]]) {
  sqlite.prepare('INSERT INTO admin_users (id,email,name,role,password_hash,active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').run(id, `${id}@example.test`, id, role, 'test-only-placeholder', active, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
}
const calls = [];
const db = {
  prepare(sql) {
    const statement = { sql, values: [], bind(...values) { this.values = values; return this; },
      async first() { calls.push(sql); return sqlite.prepare(sql).get(...this.values) || null; },
      async all() { calls.push(sql); return { success: true, results: sqlite.prepare(sql).all(...this.values), meta: { changes: 0 } }; },
      async run() { calls.push(sql); const info = sqlite.prepare(sql).run(...this.values); return { success: true, meta: { changes: Number(info.changes) } }; },
    }; return statement;
  },
  async batch(statements) {
    sqlite.exec('BEGIN IMMEDIATE');
    try { const results = []; for (const s of statements) results.push(/^\s*SELECT\b/i.test(s.sql) ? await s.all() : await s.run()); sqlite.exec('COMMIT'); return results; }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  },
};
const principal = { id: 'owner', name: 'Operator', email: 'owner@example.test', role: 'owner' };
const viewer = { id: 'USER-viewer', name: 'Read only', role: 'viewer' };
const sales = { id: 'USER-sales', name: 'Sales', role: 'sales' };
const env = { DB: db };
let passed = 0;
const failures = [];
async function test(name, fn) { try { await fn(); passed++; } catch (error) { failures.push({ name, error: error.message, stack: error.stack }); } }
async function api(path, { method = 'GET', body, actor = principal, origin = 'https://www.gyutron.test', headers = {} } = {}) {
  const request = new Request(`https://www.gyutron.test/admin/api/${path}`, { method, headers: { origin, ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...headers }, ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }) });
  const response = await handleAdminApi(request, env, {}, new URL(request.url), actor);
  const type = response.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await response.json() : await response.text();
  return { response, data };
}
async function legacy(path, { method = 'GET', form, actor = { ...principal, csrfToken: 'test-csrf' }, origin = 'https://www.gyutron.test' } = {}) {
  const request = new Request(`https://www.gyutron.test/admin/${path}`, { method, headers: { origin, ...(form ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) }, ...(form ? { body: form instanceof URLSearchParams ? form : new URLSearchParams(form) } : {}) });
  const response = await handleLegacyAdmin(request, env, {}, new URL(request.url), actor);
  return { response, text: await response.text() };
}
let customer, opportunity, task, activity;

await test('anonymous and unknown roles are rejected before SQL', async () => {
  const before = calls.length;
  assert.equal((await api('customers', { actor: null })).response.status, 401);
  assert.equal((await api('customers', { actor: { id: 'x', role: 'admin' } })).response.status, 401);
  assert.equal(calls.length, before);
});
await test('bootstrap returns safe identity and explicit deployment isolation', async () => {
  const r = await api('bootstrap', { actor: { ...principal, password_hash: 'secret' } });
  assert.equal(r.response.status, 200); assert.equal(r.data.data.workspace.tenancy, 'deployment');
  assert.equal(r.data.data.principal.password_hash, undefined); assert.equal(r.data.data.permissions.export, true);
});
await test('cross-site and missing Origin writes fail closed', async () => {
  assert.equal((await api('customers', { method: 'POST', body: { name: 'Blocked' }, origin: 'https://attacker.test' })).response.status, 403);
  assert.equal((await api('customers', { method: 'POST', body: { name: 'Blocked' }, origin: '' })).response.status, 403);
});
await test('viewer cannot create records', async () => {
  const r = await api('customers', { method: 'POST', actor: viewer, body: { name: 'Blocked' } }); assert.equal(r.response.status, 403);
});
await test('invalid JSON, unknown fields and overlarge payloads are explicit', async () => {
  assert.equal((await api('customers', { method: 'POST', body: '{invalid' })).response.status, 400);
  assert.equal((await api('customers', { method: 'POST', body: { name: 'A', role: 'owner' } })).response.status, 422);
  assert.equal((await api('customers', { method: 'POST', body: { name: 'A' }, headers: { 'content-length': '100000' } })).response.status, 413);
  assert.equal((await api('customers', { method: 'POST', body: JSON.stringify({ name: 'A', notes: 'x'.repeat(70000) }) })).response.status, 413);
});
await test('strict validation rejects integer coercion and impossible dates', async () => {
  assert.throws(() => validatePayload('opportunities', { title: 'A', customer_id: 'CUS-A', amount_minor: '10' }));
  assert.throws(() => validatePayload('tasks', { title: 'A', due_date: '2026-02-30' }));
  assert.throws(() => validatePayload('tasks', { title: 'A', due_date: '2026-13-01' }));
  assert.throws(() => validatePayload('customers', { name: 'A', website: 'javascript:alert(1)' }));
  assert.throws(() => validatePayload('customers', { name: 'A', website: 'https://user:pass@example.test' }));
});
await test('create customer persists an audit and event transactionally', async () => {
  const r = await api('customers', { method: 'POST', body: { name: 'Factory One', contact_name: 'Lin', email: 'LIN@Example.test', country: 'Singapore' } });
  assert.equal(r.response.status, 201); customer = r.data.data;
  assert.equal(customer.version, 1); assert.equal(customer.email, 'lin@example.test'); assert.equal(customer.owner_id, principal.id);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM crm_audit WHERE entity_id = ?').get(customer.public_id).n, 1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM events WHERE entity_id = ?').get(customer.public_id).n, 1);
});
await test('second related opportunity with money and customer name', async () => {
  const r = await api('opportunities', { method: 'POST', body: { title: 'Vision inspection cell', customer_id: customer.public_id, amount_minor: 1250000, currency: 'USD', expected_close_date: '2026-12-01' } });
  assert.equal(r.response.status, 201); opportunity = r.data.data; assert.equal(opportunity.customer_name, 'Factory One');
});
await test('invalid relationships never create rows', async () => {
  const r = await api('opportunities', { method: 'POST', body: { title: 'Missing relation', customer_id: 'MISSING' } });
  assert.equal(r.response.status, 422); assert.equal(r.data.error.code, 'INVALID_RELATION');
});
await test('task infers customer from linked opportunity', async () => {
  const r = await api('tasks', { method: 'POST', body: { title: 'Prepare proposal', opportunity_id: opportunity.public_id, due_date: '2020-01-01', priority: 'high' } });
  assert.equal(r.response.status, 201); task = r.data.data; assert.equal(task.customer_id, customer.public_id); assert.equal(task.customer_name, customer.name);
});
await test('cross-customer opportunity references are rejected', async () => {
  const c = await api('customers', { method: 'POST', body: { name: 'Other customer' } });
  const r = await api('tasks', { method: 'POST', body: { title: 'Mismatch', customer_id: c.data.data.public_id, opportunity_id: opportunity.public_id } });
  assert.equal(r.response.status, 422); assert.equal(r.data.error.code, 'RELATION_MISMATCH');
});
await test('activity stores immutable author identity', async () => {
  const r = await api('activities', { method: 'POST', actor: sales, body: { type: 'call', subject: 'Technical requirements', body: 'Customer requests a sample test.', customer_id: customer.public_id } });
  assert.equal(r.response.status, 201); activity = r.data.data; assert.equal(activity.actor_name, 'Sales');
  assert.equal((await api(`activities/${activity.public_id}`, { method: 'PATCH', body: { subject: 'Rewrite', version: 1 } })).response.status, 405);
});
await test('filtered list searches are bound and SQL metacharacters stay literal', async () => {
  const r = await api('customers?q=Factory&status=prospect&page=1&limit=1');
  assert.equal(r.response.status, 200); assert.equal(r.data.meta.total, 1); assert.equal(r.data.data.length, 1); assert.equal(r.data.data[0].id, undefined);
  assert.equal((await api("customers?q='OR%201=1--")).data.meta.total, 0);
  assert.equal((await api('customers?q=%25')).data.meta.total, 0);
  assert.equal((await api('customers?status=unsafe')).response.status, 422);
  assert.equal((await api('customers?page=1.2')).response.status, 422);
  assert.equal((await api('customers?limit=999')).response.status, 422);
});
await test('valid update increments version, stale update emits no audit/event', async () => {
  const r = await api(`customers/${customer.public_id}`, { method: 'PATCH', body: { name: 'Factory One Updated', version: customer.version } });
  assert.equal(r.response.status, 200); customer = r.data.data; assert.equal(customer.version, 2);
  const beforeAudit = sqlite.prepare('SELECT COUNT(*) AS n FROM crm_audit').get().n;
  const beforeEvents = sqlite.prepare('SELECT COUNT(*) AS n FROM events').get().n;
  const stale = await api(`customers/${customer.public_id}`, { method: 'PATCH', body: { name: 'Stale', version: 1 } });
  assert.equal(stale.response.status, 409); assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM crm_audit').get().n, beforeAudit);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM events').get().n, beforeEvents);
});
await test('won/lost stages normalize probability without dropping value', async () => {
  const r = await api(`opportunities/${opportunity.public_id}`, { method: 'PATCH', body: { stage: 'won', version: opportunity.version } });
  assert.equal(r.response.status, 200); opportunity = r.data.data; assert.equal(opportunity.probability, 100); assert.equal(opportunity.amount_minor, 1250000);
});
await test('sales can write but cannot archive, export or read audit', async () => {
  assert.equal((await api(`tasks/${task.public_id}`, { method: 'PATCH', actor: sales, body: { status: 'in_progress', version: task.version } })).response.status, 200);
  assert.equal((await api(`customers/${customer.public_id}`, { method: 'DELETE', actor: sales, body: { version: customer.version } })).response.status, 403);
  assert.equal((await api('export?resource=customers', { actor: sales })).response.status, 403);
  assert.equal((await api('audit', { actor: viewer })).response.status, 403);
});
await test('archive is reversible, versioned, hidden by default and blocks edits', async () => {
  assert.equal((await api(`customers/${customer.public_id}`, { method: 'DELETE', body: { version: customer.version } })).response.status, 409);
  task = (await api(`tasks/${task.public_id}`)).data.data;
  task = (await api(`tasks/${task.public_id}`, { method: 'DELETE', body: { version: task.version } })).data.data;
  const r = await api(`customers/${customer.public_id}`, { method: 'DELETE', body: { version: customer.version } }); assert.equal(r.response.status, 200); customer = r.data.data;
  assert.ok(customer.archived_at); assert.equal((await api('customers?q=Factory')).data.meta.total, 0);
  assert.equal((await api('customers?archived=true')).data.meta.total, 1);
  assert.equal((await api(`customers/${customer.public_id}`, { method: 'PATCH', body: { name: 'No', version: customer.version } })).response.status, 409);
  assert.equal((await api('opportunities', { method: 'POST', body: { title: 'Archived customer', customer_id: customer.public_id } })).response.status, 422);
  const restored = await api(`customers/${customer.public_id}/restore`, { method: 'POST', body: { version: customer.version } });
  assert.equal(restored.response.status, 200); customer = restored.data.data; assert.equal(customer.archived_at, null);
  task = (await api(`tasks/${task.public_id}/restore`, { method: 'POST', body: { version: task.version } })).data.data;
});
await test('audit is append-only at SQL layer', async () => {
  assert.throws(() => sqlite.exec("UPDATE crm_audit SET summary='tamper'"), /append-only/);
  assert.throws(() => sqlite.exec('DELETE FROM crm_audit'), /append-only/);
});
await test('failed audit insert rolls back the business write and event', async () => {
  const before = sqlite.prepare('SELECT COUNT(*) AS n FROM crm_customers').get().n;
  sqlite.exec("CREATE TEMP TRIGGER test_fail_audit BEFORE INSERT ON crm_audit BEGIN SELECT RAISE(ABORT,'simulated audit failure'); END");
  const r = await api('customers', { method: 'POST', body: { name: 'Must roll back' } });
  sqlite.exec('DROP TRIGGER test_fail_audit');
  assert.equal(r.response.status, 503); assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM crm_customers').get().n, before);
});
await test('real inbox keeps legacy fields private and uses optimistic timestamps', async () => {
  sqlite.prepare('INSERT INTO leads (public_id,name,company,email,ip_hash,user_agent,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').run('LEAD-test', 'Buyer', 'Factory One', 'buyer@example.test', 'private-hash', 'private-agent', 'new', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
  const list = await api('intake?resource=leads'); assert.equal(list.data.meta.total, 1); assert.equal(list.data.data[0].ip_hash, undefined); assert.equal(list.data.data[0].user_agent, undefined);
  const r = await api('intake/leads/LEAD-test', { method: 'PATCH', body: { status: 'replied', internal_note: 'Responded', updated_at: '2026-01-01T00:00:00.000Z' } });
  assert.equal(r.response.status, 200); assert.equal(r.data.data.status, 'replied');
  assert.equal((await api('intake/leads/LEAD-test', { method: 'PATCH', body: { status: 'closed', updated_at: '2026-01-01T00:00:00.000Z' } })).response.status, 409);
  assert.equal((await api('intake/order-intents')).response.status, 404);
});
await test('dashboard uses real counts and groups money by currency', async () => {
  const r = await api('dashboard', { actor: viewer }); assert.equal(r.response.status, 200);
  assert.equal(r.data.data.counts.customers, 2); assert.equal(r.data.data.counts.open_opportunities, 0);
  assert.equal(r.data.data.counts.overdue_tasks, 1); assert.equal(r.data.data.counts.unread_intake, 0);
  assert.equal(r.data.data.pipeline[0].currency, 'USD'); assert.equal(r.data.data.recentActivities[0].actor_name, 'Sales');
});
await test('CSV export is complete and defuses spreadsheet formulas', async () => {
  const r = await api('export?resource=customers'); assert.equal(r.response.status, 200); assert.equal(r.response.headers.get('x-export-row-count'), '2');
  assert.ok(r.data.includes('Factory One Updated')); assert.ok(r.response.headers.get('content-disposition').includes('customers-'));
  const csv = workspaceCsv([{ value: '=1+1', other: ' \t@SUM(A1)', numeric: -25, text: 'safe,"quoted"' }], ['value', 'other', 'numeric', 'text']);
  assert.ok(csv.includes("'=1+1")); assert.ok(csv.includes("' \t@SUM(A1)")); assert.ok(csv.includes(',-25,')); assert.ok(csv.includes('"safe,""quoted"""'));
});
await test('HTTP security headers and explicit unsupported methods', async () => {
  const r = await api('customers'); assert.equal(r.response.headers.get('cache-control'), 'no-store, private'); assert.equal(r.response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal((await api('dashboard', { method: 'POST', body: {} })).response.status, 405);
  assert.equal((await api('missing')).response.status, 404);
  assert.equal((await api('customers/%ZZ')).response.status, 400);
});
await test('owner assignments only target active members and sales cannot reassign', async () => {
  assert.equal((await api(`customers/${customer.public_id}`, { method: 'PATCH', body: { owner_id: 'missing', version: customer.version } })).response.status, 422);
  assert.equal((await api(`customers/${customer.public_id}`, { method: 'PATCH', body: { owner_id: 'USER-inactive', version: customer.version } })).response.status, 422);
  assert.equal((await api(`customers/${customer.public_id}`, { method: 'PATCH', actor: sales, body: { owner_id: 'USER-sales', version: customer.version } })).response.status, 403);
  const r = await api(`customers/${customer.public_id}`, { method: 'PATCH', body: { owner_id: 'USER-sales', version: customer.version } }); assert.equal(r.response.status, 200); customer = r.data.data;
  assert.equal(customer.owner_id, 'USER-sales');
});
await test('customer reassignment preserves linked task and activity history', async () => {
  const other = (await api('customers?q=Other')).data.data[0];
  const r = await api(`opportunities/${opportunity.public_id}`, { method: 'PATCH', body: { customer_id: other.public_id, version: opportunity.version } });
  assert.equal(r.response.status, 409); assert.equal(r.data.error.code, 'RELATED_RECORDS');
  assert.throws(() => sqlite.prepare('UPDATE crm_opportunities SET customer_id = ? WHERE public_id = ?').run(other.public_id, opportunity.public_id), /reassignment/);
});
await test('inquiry conversion creates linked customer and RFQ opportunity once', async () => {
  sqlite.prepare('INSERT INTO rfqs (public_id,name,company,email,application_description,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').run('RFQ-convert', 'Buyer', 'Convert Factory', 'convert@example.test', 'Inspect industrial parts on a conveyor.', 'new', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
  const first = await api('intake/rfqs/RFQ-convert/convert', { method: 'POST', body: { amount_minor: 500000, currency: 'EUR' } });
  assert.equal(first.response.status, 201); assert.equal(first.data.meta.already_converted, false); assert.ok(first.data.data.customer_id); assert.ok(first.data.data.opportunity_id);
  const second = await api('intake/rfqs/RFQ-convert/convert', { method: 'POST', body: {} });
  assert.equal(second.response.status, 200); assert.equal(second.data.meta.already_converted, true); assert.equal(second.data.data.customer_id, first.data.data.customer_id);
  const detail = await api('intake/rfqs/RFQ-convert'); assert.equal(detail.data.data.conversion.customer_id, first.data.data.customer_id); assert.equal(detail.data.data.status, 'reviewing');
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM crm_customers WHERE name='Convert Factory'").get().n, 1);
  assert.equal(sqlite.prepare('SELECT currency FROM crm_opportunities WHERE public_id=?').get(first.data.data.opportunity_id).currency, 'EUR');
});
await test('conversion can use an existing customer and cannot convert spam', async () => {
  const r = await api('intake/leads/LEAD-test/convert', { method: 'POST', body: { customer_id: customer.public_id, create_opportunity: false } });
  assert.equal(r.response.status, 201); assert.equal(r.data.data.customer_id, customer.public_id); assert.equal(r.data.data.opportunity_id, null);
  sqlite.prepare('INSERT INTO leads (public_id,name,status,created_at,updated_at) VALUES (?,?,?,?,?)').run('LEAD-spam', 'Spam', 'spam', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
  assert.equal((await api('intake/leads/LEAD-spam/convert', { method: 'POST', body: {} })).response.status, 409);
});
await test('conversion failure rolls back customer, opportunity, mapping and source status', async () => {
  sqlite.prepare('INSERT INTO rfqs (public_id,name,company,email,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run('RFQ-rollback', 'Buyer', 'Rollback Factory', 'rollback@example.test', 'new', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
  sqlite.exec("CREATE TEMP TRIGGER test_fail_convert BEFORE INSERT ON crm_audit BEGIN SELECT RAISE(ABORT,'simulated failure'); END");
  const r = await api('intake/rfqs/RFQ-rollback/convert', { method: 'POST', body: {} });
  sqlite.exec('DROP TRIGGER test_fail_convert'); assert.equal(r.response.status, 503);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM crm_customers WHERE name='Rollback Factory'").get().n, 0);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM crm_intake_links WHERE source_id='RFQ-rollback'").get().n, 0);
  assert.equal(sqlite.prepare("SELECT status FROM rfqs WHERE public_id='RFQ-rollback'").get().status, 'new');
});
await test('conversion rejects invalid optional field types instead of creating unintended records', async () => {
  for (const body of [{ customer_id: 0 }, { title: 0 }, { amount_minor: '100' }, { currency: 'BAD' }, { expected_close_date: null }]) {
    const r = await api('intake/rfqs/RFQ-rollback/convert', { method: 'POST', body }); assert.equal(r.response.status, 422);
  }
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM crm_intake_links WHERE source_id='RFQ-rollback'").get().n, 0);
});
await test('activity timestamps reject impossible dates and normalize timezone offsets', async () => {
  assert.throws(() => validatePayload('activities', { subject: 'Impossible date', occurred_at: '2026-02-30T12:00:00Z' }));
  const r = await api('activities', { method: 'POST', body: { subject: 'Timezone normalization', occurred_at: '2026-11-03T08:00:00+08:00' } });
  assert.equal(r.response.status, 201); assert.equal(r.data.data.occurred_at, '2026-11-03T00:00:00.000Z');
});
await test('business dates use configured timezone across local midnight', async () => {
  const instant = new Date('2026-11-02T16:30:00.000Z');
  assert.equal(workspaceDate('Asia/Singapore', instant), '2026-11-03');
  assert.equal(workspaceDate('UTC', instant), '2026-11-02');
  assert.equal(workspaceTimeZone({ ADMIN_TIMEZONE: 'Invalid/Timezone' }), 'Asia/Singapore');
  const bootstrap = await api('bootstrap'); assert.equal(bootstrap.data.data.workspace.timezone, 'Asia/Singapore');
  assert.equal(bootstrap.data.data.currencyMinorUnits.JPY, 0); assert.equal(bootstrap.data.data.currencyMinorUnits.USD, 2);
});
await test('mixed currency totals remain distinct including zero-decimal JPY', async () => {
  const jpy = await api('opportunities', { method: 'POST', body: { title: 'JPY opportunity', customer_id: customer.public_id, amount_minor: 200000, currency: 'JPY' } });
  assert.equal(jpy.response.status, 201);
  const r = await api('dashboard');
  assert.ok(r.data.data.pipeline.some(row => row.currency === 'JPY' && row.amount_minor === 200000));
  assert.ok(r.data.data.pipeline.some(row => row.currency === 'EUR' && row.amount_minor === 500000));
  assert.ok(r.data.data.pipeline.some(row => row.currency === 'USD' && row.amount_minor === 1250000));
});
await test('large lists paginate completely and exports never silently truncate', async () => {
  sqlite.exec('BEGIN');
  const insert = sqlite.prepare('INSERT INTO crm_customers (public_id,name,status,owner_id,created_at,updated_at) VALUES (?,?,?,?,?,?)');
  for (let i = 0; i < 10001; i++) insert.run(`CUS-volume-${i}`, `Bulk-${String(i).padStart(5, '0')}`, i === 10000 ? 'inactive' : 'active', 'owner', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
  sqlite.exec('COMMIT');
  const first = await api('customers?q=Bulk-&limit=100'); assert.equal(first.data.meta.total, 10001); assert.equal(first.data.meta.pages, 101); assert.equal(first.data.data.length, 100);
  const last = await api('customers?q=Bulk-&limit=100&page=101'); assert.equal(last.data.data.length, 1);
  const tooLarge = await api('export?resource=customers&q=Bulk-'); assert.equal(tooLarge.response.status, 422); assert.equal(tooLarge.data.error.code, 'EXPORT_LIMIT');
  const exact = await api('export?resource=customers&q=Bulk-&status=active'); assert.equal(exact.response.status, 200); assert.equal(exact.response.headers.get('x-export-row-count'), '10000');
  assert.equal(exact.data.trim().split('\r\n').length, 10001);
});
await test('SQL guards reject assignment, reopen and restore races against archived parents', async () => {
  const stamp = '2026-01-01T00:00:00Z';
  sqlite.prepare('INSERT INTO crm_customers (public_id,name,owner_id,archived_at,created_at,updated_at) VALUES (?,?,?,?,?,?)').run('CUS-archived-parent', 'Archived parent', 'owner', stamp, stamp, stamp);
  sqlite.prepare('INSERT INTO crm_tasks (public_id,title,owner_id,created_at,updated_at) VALUES (?,?,?,?,?)').run('TSK-race', 'Race guard', 'owner', stamp, stamp);
  assert.throws(() => sqlite.prepare('UPDATE crm_tasks SET customer_id=? WHERE public_id=?').run('CUS-archived-parent', 'TSK-race'), /active related records/);
  sqlite.prepare('UPDATE crm_tasks SET status=? WHERE public_id=?').run('done', 'TSK-race');
  sqlite.prepare('UPDATE crm_tasks SET customer_id=? WHERE public_id=?').run('CUS-archived-parent', 'TSK-race');
  assert.throws(() => sqlite.prepare('UPDATE crm_tasks SET status=? WHERE public_id=?').run('open', 'TSK-race'), /active related records/);
  sqlite.prepare('UPDATE crm_tasks SET archived_at=? WHERE public_id=?').run(stamp, 'TSK-race');
  sqlite.prepare('UPDATE crm_tasks SET status=? WHERE public_id=?').run('open', 'TSK-race');
  assert.throws(() => sqlite.prepare('UPDATE crm_tasks SET archived_at=NULL WHERE public_id=?').run('TSK-race'), /active related records/);
  const opp = sqlite.prepare('SELECT public_id FROM crm_opportunities LIMIT 1').get();
  assert.throws(() => sqlite.prepare('UPDATE crm_opportunities SET customer_id=?,stage=? WHERE public_id=?').run('CUS-archived-parent', 'qualification', opp.public_id));
});
await test('legacy views retain order fields/items, escape configuration and hide internal metadata', async () => {
  sqlite.prepare('INSERT INTO order_intents (public_id,request_fingerprint,request_type,contact_name,company,email,shipping_address_line1,shipping_city,shipping_postal_code,shipping_country,item_count,ip_hash,user_agent,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run('OI-review', 'private-fingerprint', 'proforma_invoice', 'Buyer', 'Legacy Factory', 'legacy@example.test', 'One Industrial Road', 'Singapore', '123456', 'SG', 1, 'private-ip', 'private-agent', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
  const id = sqlite.prepare('SELECT id FROM order_intents WHERE public_id=?').get('OI-review').id;
  sqlite.prepare('INSERT INTO order_intent_items (order_intent_id,line_number,sku,quantity,configuration_json) VALUES (?,?,?,?,?)').run(id, 1, 'GY-CV220-INLINE', 3, JSON.stringify({ lens: '<script>alert(1)</script>' }));
  const list = await legacy('order-intents'); assert.equal(list.response.status, 200); assert.ok(list.text.includes('Legacy Factory'));
  const detail = await legacy('order-intents/OI-review'); assert.equal(detail.response.status, 200); assert.ok(detail.text.includes('GY-CV220-INLINE')); assert.ok(detail.text.includes('&lt;script&gt;'));
  assert.ok(!detail.text.includes('private-fingerprint')); assert.ok(!detail.text.includes('private-ip')); assert.ok(!detail.text.includes('private-agent')); assert.ok(!detail.text.includes('value="delete"'));
  assert.ok(detail.text.includes('name="csrf_token"')); assert.ok(detail.text.includes('/admin#overview'));
});
await test('legacy operational roles and CSRF are enforced independently', async () => {
  assert.equal((await legacy('order-intents', { actor: sales })).response.status, 403);
  assert.equal((await legacy('events', { actor: viewer })).response.status, 403);
  assert.equal((await legacy('events', { actor: null })).response.status, 401);
  const form = { csrf_token: 'wrong', action: 'save', updated_at: '2026-01-01T00:00:00.000Z', status: 'reviewing' };
  assert.equal((await legacy('order-intents/OI-review', { method: 'POST', form })).response.status, 403);
  assert.equal((await legacy('order-intents/OI-review', { method: 'POST', form: { ...form, csrf_token: 'test-csrf' }, origin: 'https://attacker.test' })).response.status, 403);
});
await test('legacy order review is atomic, audited and optimistic', async () => {
  const form = { csrf_token: 'test-csrf', action: 'save', updated_at: '2026-01-01T00:00:00.000Z', status: 'reviewing', internal_note: 'Checked configuration' };
  const r = await legacy('order-intents/OI-review', { method: 'POST', form }); assert.equal(r.response.status, 303);
  assert.ok(r.response.headers.get('location').endsWith('?saved=1'));
  assert.equal(sqlite.prepare('SELECT status FROM order_intents WHERE public_id=?').get('OI-review').status, 'reviewing');
  const before = sqlite.prepare('SELECT COUNT(*) AS n FROM crm_audit WHERE entity_id=?').get('OI-review').n;
  const stale = await legacy('order-intents/OI-review', { method: 'POST', form }); assert.equal(stale.response.status, 409);
  assert.ok(stale.text.includes('Preserved internal note')); assert.ok(stale.text.includes('Checked configuration'));
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM crm_audit WHERE entity_id=?').get('OI-review').n, before);
  const current = sqlite.prepare('SELECT updated_at FROM order_intents WHERE public_id=?').get('OI-review').updated_at;
  sqlite.exec("CREATE TEMP TRIGGER test_fail_review BEFORE INSERT ON crm_audit BEGIN SELECT RAISE(ABORT,'simulated failure'); END");
  const failed = await legacy('order-intents/OI-review', { method: 'POST', form: { ...form, status: 'closed', updated_at: current } });
  sqlite.exec('DROP TRIGGER test_fail_review'); assert.equal(failed.response.status, 503);
  assert.equal(sqlite.prepare('SELECT status FROM order_intents WHERE public_id=?').get('OI-review').status, 'reviewing');
});
await test('legacy duplicate action/delete and oversized reviews are rejected', async () => {
  const current = sqlite.prepare('SELECT updated_at FROM order_intents WHERE public_id=?').get('OI-review').updated_at;
  const form = new URLSearchParams({ csrf_token: 'test-csrf', action: 'save', updated_at: current, status: 'reviewing' }); form.append('action', 'spam');
  assert.equal((await legacy('order-intents/OI-review', { method: 'POST', form })).response.status, 422);
  form.delete('action'); form.set('action', 'delete'); assert.equal((await legacy('order-intents/OI-review', { method: 'POST', form })).response.status, 422);
  form.set('action', 'save'); form.set('internal_note', 'x'.repeat(70000)); assert.equal((await legacy('order-intents/OI-review', { method: 'POST', form })).response.status, 413);
});
await test('legacy 5000-character Chinese notes fit the bounded encoded form and shared tokens load', async () => {
  const current = sqlite.prepare('SELECT updated_at FROM order_intents WHERE public_id=?').get('OI-review').updated_at;
  const note = '工业客户配置核实'.repeat(625);
  assert.equal(note.length, 5000);
  const r = await legacy('order-intents/OI-review', { method: 'POST', form: { csrf_token: 'test-csrf', action: 'save', status: 'reviewing', updated_at: current, internal_note: note } });
  assert.equal(r.response.status, 303); assert.equal(sqlite.prepare('SELECT internal_note FROM order_intents WHERE public_id=?').get('OI-review').internal_note, note);
  const detail = await legacy('order-intents/OI-review'); assert.ok(detail.text.includes('href="/brand-tokens.css"'));
  const style = await legacy('legacy.css'); assert.ok(!style.text.includes('--button-purple-deep:')); assert.ok(style.text.includes('var(--button-purple-deep)'));
});
await test('legacy CSV is filtered and excludes fingerprints, hashes and user agents', async () => {
  const r = await legacy('order-intents.csv?status=reviewing'); assert.equal(r.response.status, 200); assert.equal(r.response.headers.get('x-export-row-count'), '1');
  assert.ok(r.text.includes('Legacy Factory')); assert.ok(!r.text.includes('request_fingerprint')); assert.ok(!r.text.includes('ip_hash')); assert.ok(!r.text.includes('user_agent'));
  assert.equal((await legacy('order-intents.csv?status=unsafe')).response.status, 422);
  assert.equal((await legacy('order-intents?status=closed')).text.includes('Legacy Factory'), false);
});
await test('legacy events remain read-only with useful payload details', async () => {
  const id = sqlite.prepare('SELECT event_id FROM events ORDER BY id DESC LIMIT 1').get().event_id;
  const r = await legacy(`events/${id}`); assert.equal(r.response.status, 200); assert.ok(r.text.includes('Event payload'));
  assert.equal((await legacy(`events/${id}`, { method: 'POST', form: { action: 'delete' } })).response.status, 405);
  assert.equal((await legacy('events.csv')).response.status, 200);
});

sqlite.close();
for (const failure of failures) console.error(`FAIL ${failure.name}\n${failure.stack}`);
console.log(JSON.stringify({ passed, failed: failures.length, checks: passed + failures.length, storage: 'real SQLite in memory', productionWrites: false }, null, 2));
if (failures.length) process.exitCode = 1;
