/** Real SQLite integration checks for workspace authentication, staff and routing.
 * Run with Node 24. Test credentials are generated in memory and never printed.
 */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handleAdmin } from '../src/api/admin.mjs';
import {
  hashStaffPassword, verifyStaffPassword, createWorkspaceSession, getWorkspacePrincipal,
  revokeWorkspaceSession, workspaceCookie, SESSION_COOKIE, allowLoginAttempt,
} from '../src/platform/security/workspace-auth.mjs';
import { createSessionCookie } from '../src/platform/security/admin-auth.mjs';
import { sha256Hex } from '../src/platform/security/hash.mjs';

const sqlite = new DatabaseSync(':memory:'); sqlite.exec('PRAGMA foreign_keys = ON');
let beforeBatch = null;
for (const migration of ['0001_init.sql', '0002_order_intents.sql', '0003_admin_workspace.sql', '0004_admin_identity.sql', '0005_crm_relation_guards.sql']) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), 'utf8'));
sqlite.exec('CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)');
for (const name of ['0001_init.sql', '0002_order_intents.sql', '0003_admin_workspace.sql', '0004_admin_identity.sql', '0005_crm_relation_guards.sql']) sqlite.prepare('INSERT INTO d1_migrations (name) VALUES (?)').run(name);
const db = {
  prepare(sql) {
    return { sql, values: [], bind(...values) { this.values = values; return this; },
      async first() { return sqlite.prepare(sql).get(...this.values) || null; },
      async all() { return { success: true, results: sqlite.prepare(sql).all(...this.values), meta: { changes: 0 } }; },
      async run() { const info = sqlite.prepare(sql).run(...this.values); return { success: true, meta: { changes: Number(info.changes) } }; },
    };
  },
  async batch(statements) {
    if (beforeBatch) { const hook = beforeBatch; beforeBatch = null; hook(statements); }
    sqlite.exec('BEGIN IMMEDIATE');
    try { const results = []; for (const statement of statements) results.push(/^\s*SELECT\b/i.test(statement.sql) ? await statement.all() : await statement.run()); sqlite.exec('COMMIT'); return results; }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  },
};
const env = { DB: db, ADMIN_PASSWORD: crypto.randomUUID() + crypto.randomUUID(), ADMIN_SECRET: crypto.randomUUID(), IP_HASH_SALT: crypto.randomUUID() };
const staffPassword = crypto.randomUUID(), replacementPassword = crypto.randomUUID();
const staffHash = await hashStaffPassword(staffPassword);
for (const [id, role, active] of [['staff-manager', 'manager', 1], ['staff-sales', 'sales', 1], ['staff-viewer', 'viewer', 1], ['staff-disabled', 'sales', 0]]) sqlite.prepare('INSERT INTO admin_users (id,email,name,role,password_hash,active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').run(id, `${id}@example.test`, id, role, staffHash, active, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
const user = id => sqlite.prepare('SELECT * FROM admin_users WHERE id = ?').get(id);
const ownerSession = await createWorkspaceSession(db, env);
const sessions = { owner: ownerSession };
for (const id of ['staff-manager', 'staff-sales', 'staff-viewer']) sessions[id] = await createWorkspaceSession(db, env, user(id));
let passed = 0; const failures = [];
async function test(name, fn) { try { await fn(); passed++; } catch (error) { failures.push({ name, stack: error.stack }); } }
function cookie(session) { return session ? `${SESSION_COOKIE}=${session.token}` : ''; }
async function route(path = '', { method = 'GET', body, session = null, origin = 'https://www.gyutron.test', headers = {}, csrf = true, requestBody } = {}) {
  const request = new Request(`https://www.gyutron.test/admin${path}`, { method, headers: {
    origin, ...(session ? { cookie: cookie(session), ...(csrf ? { 'x-csrf-token': session.csrfToken } : {}) } : {}),
    ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...headers,
  }, ...(requestBody ? { body: requestBody, duplex: 'half' } : body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }) });
  const response = await handleAdmin(request, env, {}, new URL(request.url));
  const text = await response.text(); let data;
  try { data = JSON.parse(text); } catch { data = null; }
  return { response, text, data };
}
async function login(email, password, { origin = 'https://www.gyutron.test', ip = crypto.randomUUID(), token, cookieToken } = {}) {
  const initial = await route('');
  const fromCookie = initial.response.headers.getSetCookie().find(value => value.startsWith('gy_workspace_login='))?.split(';')[0]?.split('=')[1];
  const formToken = token ?? fromCookie;
  return route('/auth/login', { method: 'POST', requestBody: new URLSearchParams({ email, password, csrf_token: formToken }), origin, headers: {
    'content-type': 'application/x-www-form-urlencoded', cookie: `gy_workspace_login=${cookieToken ?? fromCookie}`, 'cf-connecting-ip': ip,
  } });
}
function countedStream({ chunks = 100, size = 4096 } = {}) {
  const state = { pulls: 0, cancelled: false, closed: false };
  const stream = new ReadableStream({
    pull(controller) { state.pulls++; if (state.pulls > chunks) { state.closed = true; controller.close(); } else controller.enqueue(new TextEncoder().encode('x'.repeat(size))); },
    cancel() { state.cancelled = true; },
  });
  return { stream, state };
}

await test('password hashing is salted, bounded and verifies without plaintext storage', async () => {
  const another = await hashStaffPassword(staffPassword); assert.notEqual(another, staffHash);
  assert.ok(!staffHash.includes(staffPassword)); assert.equal(await verifyStaffPassword(staffPassword, staffHash), true);
  assert.equal(await verifyStaffPassword('wrong-password', staffHash), false); assert.equal(await verifyStaffPassword('x'.repeat(257), staffHash), false);
  await assert.rejects(() => hashStaffPassword('too-short')); assert.equal(await verifyStaffPassword(staffPassword, 'malformed'), false);
});
await test('sessions use opaque tokens, hashed storage and secure cookie attributes', async () => {
  const hash = await sha256Hex(ownerSession.token), stored = sqlite.prepare('SELECT * FROM admin_owner_sessions WHERE token_hash = ?').get(hash);
  assert.ok(stored); assert.ok(!Object.values(stored).includes(ownerSession.token)); assert.match(ownerSession.token, /^[a-f0-9]{64}$/);
  const header = workspaceCookie(ownerSession.token); for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/admin']) assert.ok(header.includes(attribute));
});
await test('unauthenticated APIs are JSON 401 and old signed cookies are rejected', async () => {
  const r = await route('/api/customers'); assert.equal(r.response.status, 401); assert.equal(r.data.error.code, 'UNAUTHENTICATED');
  const oldCookie = (await createSessionCookie(env)).split(';')[0];
  const legacy = await route('/api/bootstrap', { headers: { cookie: oldCookie } }); assert.equal(legacy.response.status, 401);
});
await test('login and workspace shell emit strict CSP and bounded disclosure', async () => {
  const loginPage = await route(''); assert.equal(loginPage.response.status, 200); assert.ok(loginPage.text.includes('/admin/auth/login'));
  const workspace = await route('', { session: ownerSession }); assert.equal(workspace.response.status, 200);
  assert.ok(workspace.text.includes('/admin/assets/workspace.js')); assert.ok(!workspace.text.includes(env.ADMIN_PASSWORD)); assert.ok(!workspace.text.includes('password_hash'));
  for (const response of [loginPage.response, workspace.response]) { assert.ok(response.headers.get('content-security-policy').includes("script-src 'self'")); assert.equal(response.headers.get('x-frame-options'), 'DENY'); assert.equal(response.headers.get('x-content-type-options'), 'nosniff'); assert.ok(response.headers.get('cache-control').includes('no-store')); }
});
await test('public workspace assets are read-only and unknown assets do not expose files', async () => {
  assert.equal((await route('/assets/workspace.css')).response.status, 200);
  assert.equal((await route('/assets/workspace.js')).response.status, 200);
  assert.equal((await route('/assets/workspace.js', { method: 'POST', body: {} })).response.status, 405);
  assert.equal((await route('/assets/.dev.vars')).response.status, 404);
});
await test('login enforces same-origin and double-submit CSRF', async () => {
  assert.equal((await login('', env.ADMIN_PASSWORD, { origin: 'https://attacker.test' })).response.status, 403);
  assert.equal((await login('', env.ADMIN_PASSWORD, { token: '0'.repeat(64), cookieToken: '1'.repeat(64) })).response.status, 403);
  const valid = await login('', env.ADMIN_PASSWORD); assert.equal(valid.response.status, 303); assert.ok(valid.response.headers.getSetCookie().some(value => value.startsWith('gy_workspace=')));
});
await test('staff, disabled staff and unknown emails use explicit login results', async () => {
  assert.equal((await login('staff-sales@example.test', staffPassword)).response.status, 303);
  assert.equal((await login('staff-disabled@example.test', staffPassword)).response.status, 401);
  const unknown = await login('unknown@example.test', staffPassword), wrong = await login('staff-sales@example.test', 'wrong-password');
  assert.equal(unknown.response.status, 401); assert.equal(wrong.response.status, 401);
  assert.ok(unknown.text.includes('The email or password is incorrect.')); assert.ok(wrong.text.includes('The email or password is incorrect.'));
});
await test('login throttling is atomic and counts attempts without recording raw IP', async () => {
  const request = new Request('https://www.gyutron.test/admin/auth/login', { headers: { 'cf-connecting-ip': '192.0.2.77' } });
  const results = [];
  for (let i = 0; i < 6; i++) results.push(await allowLoginAttempt(db, request, env));
  assert.ok(results.slice(0, 5).every(r => r.ok)); assert.equal(results[5].ok, false); assert.ok(results[5].retryAfter > 0);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM admin_login_attempts WHERE key_hash LIKE '%192.0.2.77%'").get().n, 0);
});
await test('all JSON writes require matching session CSRF and same Origin', async () => {
  const options = { method: 'POST', body: { name: 'Test customer' }, session: ownerSession };
  assert.equal((await route('/api/customers', { ...options, csrf: false })).response.status, 403);
  assert.equal((await route('/api/customers', { ...options, origin: 'https://attacker.test' })).response.status, 403);
  assert.equal((await route('/api/customers', { ...options, headers: { 'x-csrf-token': 'wrong' } })).response.status, 403);
  assert.equal((await route('/api/customers', options)).response.status, 201);
});
await test('viewer and manager cannot manage staff or escalate their roles', async () => {
  const staffBody = { name: 'Forbidden', email: 'forbidden@example.test', password: staffPassword, role: 'manager' };
  for (const id of ['staff-manager', 'staff-sales', 'staff-viewer']) {
    const r = await route('/api/team', { method: 'POST', body: staffBody, session: sessions[id] }); assert.equal(r.response.status, 403);
    assert.equal((await route('/api/team', { session: sessions[id] })).response.status, 403);
  }
});
let createdMember;
await test('owner creates a named account without leaking credentials in response or audit', async () => {
  const r = await route('/api/team', { method: 'POST', session: ownerSession, body: { name: 'New staff', email: 'new.staff@example.test', password: staffPassword, role: 'sales' } });
  assert.equal(r.response.status, 201); createdMember = r.data.data;
  assert.equal(createdMember.password_hash, undefined); assert.ok(!r.text.includes(staffPassword));
  const stored = user(createdMember.id); assert.ok(stored.password_hash.startsWith('scrypt$'));
  const audits = sqlite.prepare('SELECT metadata_json FROM crm_audit WHERE entity_type=? AND entity_id=?').all('team', createdMember.id);
  assert.ok(!JSON.stringify(audits).includes(staffPassword)); assert.ok(!JSON.stringify(audits).includes(stored.password_hash));
});
await test('staff creation validates roles, duplicate emails and overposting', async () => {
  const body = { name: 'Other', email: 'new.staff@example.test', password: staffPassword, role: 'sales' };
  assert.equal((await route('/api/team', { method: 'POST', session: ownerSession, body })).response.status, 409);
  assert.equal((await route('/api/team', { method: 'POST', session: ownerSession, body: { ...body, email: 'owner-role@example.test', role: 'owner' } })).response.status, 422);
  assert.equal((await route('/api/team', { method: 'POST', session: ownerSession, body: { ...body, email: 'overpost@example.test', active: 1 } })).response.status, 422);
});
await test('team updates are optimistic and revoke previously issued sessions', async () => {
  const session = await createWorkspaceSession(db, env, user(createdMember.id));
  const first = await route(`/api/team/${createdMember.id}`, { method: 'PATCH', session: ownerSession, body: { name: 'Renamed staff', version: createdMember.version } });
  assert.equal(first.response.status, 200);
  const stale = await route(`/api/team/${createdMember.id}`, { method: 'PATCH', session: ownerSession, body: { name: 'Stale', version: createdMember.version } }); assert.equal(stale.response.status, 409);
  assert.equal((await route('/api/bootstrap', { session })).response.status, 401); createdMember = first.data.data;
});
await test('password reset rejects an in-flight old-password login session', async () => {
  const beforeReset = user(createdMember.id);
  assert.equal(await verifyStaffPassword(staffPassword, beforeReset.password_hash), true);
  const reset = await route(`/api/team/${createdMember.id}/password`, { method: 'POST', session: ownerSession, body: { password: replacementPassword, version: createdMember.version } });
  assert.equal(reset.response.status, 200); createdMember = reset.data.data;
  // Simulates login verification finishing before reset, then session insertion
  // arriving after reset/revocation. The stale hash snapshot must remain invalid.
  const staleSession = await createWorkspaceSession(db, env, beforeReset);
  assert.equal((await route('/api/bootstrap', { session: staleSession })).response.status, 401);
  assert.equal(await verifyStaffPassword(staffPassword, user(createdMember.id).password_hash), false);
  assert.equal(await verifyStaffPassword(replacementPassword, user(createdMember.id).password_hash), true);
});
await test('deactivated users lose access immediately even with a stored session', async () => {
  const session = await createWorkspaceSession(db, env, user('staff-sales'));
  sqlite.prepare('UPDATE admin_users SET active=0 WHERE id=?').run('staff-sales');
  assert.equal((await route('/api/bootstrap', { session })).response.status, 401);
  sqlite.prepare('UPDATE admin_users SET active=1 WHERE id=?').run('staff-sales');
});
await test('session expiry and idle limits revoke database rows', async () => {
  const expired = await createWorkspaceSession(db, env), hash = await sha256Hex(expired.token);
  sqlite.prepare('UPDATE admin_owner_sessions SET expires_at=? WHERE token_hash=?').run('2020-01-01T00:00:00.000Z', hash);
  assert.equal((await route('/api/bootstrap', { session: expired })).response.status, 401); assert.equal(sqlite.prepare('SELECT token_hash FROM admin_owner_sessions WHERE token_hash=?').get(hash), undefined);
  const idle = await createWorkspaceSession(db, env), idleHash = await sha256Hex(idle.token);
  sqlite.prepare('UPDATE admin_owner_sessions SET last_seen_at=? WHERE token_hash=?').run('2020-01-01T00:00:00.000Z', idleHash);
  assert.equal((await route('/api/bootstrap', { session: idle })).response.status, 401);
});
await test('owner credential rotation invalidates all previous owner sessions', async () => {
  const request = new Request('https://www.gyutron.test/admin', { headers: { cookie: cookie(ownerSession) } });
  assert.equal(await getWorkspacePrincipal(request, { ...env, ADMIN_SECRET: crypto.randomUUID() }, db), null);
});
await test('logout requires POST+CSRF, deletes session and clears cookie', async () => {
  const session = await createWorkspaceSession(db, env);
  assert.equal((await route('/logout', { session })).response.status, 405);
  assert.equal((await route('/logout', { method: 'POST', session, csrf: false })).response.status, 403);
  const r = await route('/logout', { method: 'POST', session }); assert.equal(r.response.status, 303);
  assert.ok(r.response.headers.getSetCookie().some(value => value.includes('Max-Age=0')));
  assert.equal((await route('/api/bootstrap', { session })).response.status, 401);
});
await test('legacy operational pages and stylesheet obey the external-style CSP', async () => {
  const r = await route('/order-intents', { session: ownerSession }); assert.equal(r.response.status, 200);
  assert.ok(r.text.includes('href="/admin/legacy.css"')); assert.ok(!r.text.includes('<style>'));
  const style = await route('/legacy.css', { session: ownerSession }); assert.equal(style.response.status, 200); assert.ok(style.response.headers.get('content-type').includes('text/css'));
  assert.equal((await route('/order-intents', { session: sessions['staff-viewer'] })).response.status, 403);
});
await test('bounded login body cancels unknown-length streams before full consumption', async () => {
  const { stream, state } = countedStream();
  const r = await route('/auth/login', { method: 'POST', requestBody: stream, headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.equal(r.response.status, 413); assert.equal(state.cancelled, true); assert.equal(state.closed, false); assert.ok(state.pulls < 10);
});
await test('bounded team JSON body cancels unknown-length streams before full consumption', async () => {
  const { stream, state } = countedStream();
  const r = await route('/api/team', { method: 'POST', session: ownerSession, requestBody: stream, headers: { 'content-type': 'application/json' } });
  assert.ok([400, 413].includes(r.response.status)); assert.equal(state.cancelled, true); assert.equal(state.closed, false); assert.ok(state.pulls < 10);
});
await test('native form CSRF reads reject oversized streams without tee-cancellation hangs', async () => {
  const { stream, state } = countedStream();
  const request = new Request('https://www.gyutron.test/admin/order-intents/OI-stream-check', { method: 'POST', duplex: 'half', body: stream, headers: {
    origin: 'https://www.gyutron.test', cookie: cookie(ownerSession), 'content-type': 'application/x-www-form-urlencoded',
  } });
  const pending = handleAdmin(request, env, {}, new URL(request.url));
  let timer;
  const response = await Promise.race([pending, new Promise(resolve => { timer = setTimeout(() => resolve(null), 1000); })]);
  clearTimeout(timer);
  if (!response) { await request.body.cancel(); await pending; assert.fail('Oversized native form hung while cancelling a cloned body stream.'); }
  assert.equal(response.status, 413); assert.equal(state.cancelled, true); assert.equal(state.closed, false); assert.ok(state.pulls >= 17 && state.pulls < 25);
});
await test('native logout form remains readable after router body-CSRF validation', async () => {
  const session = await createWorkspaceSession(db, env);
  const r = await route('/logout', { method: 'POST', session, csrf: false, requestBody: new URLSearchParams({ csrf_token: session.csrfToken }), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.equal(r.response.status, 303); assert.equal((await route('/api/bootstrap', { session })).response.status, 401);
});
await test('legacy review form survives the router and legacy double CSRF checks', async () => {
  sqlite.prepare('INSERT INTO order_intents (public_id,request_fingerprint,request_type,contact_name,company,email,shipping_address_line1,shipping_city,shipping_postal_code,shipping_country,item_count,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run('OI-router-form', 'fixture-fingerprint', 'order_request', 'Buyer', 'Native form test', 'native@example.test', 'Industrial Road', 'Singapore', '123456', 'SG', 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
  const r = await route('/order-intents/OI-router-form', { method: 'POST', session: ownerSession, csrf: false,
    requestBody: new URLSearchParams({ csrf_token: ownerSession.csrfToken, action: 'save', updated_at: '2026-01-01T00:00:00.000Z', status: 'reviewing', internal_note: 'Native form verified' }),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });
  assert.equal(r.response.status, 303); assert.equal(sqlite.prepare('SELECT status FROM order_intents WHERE public_id=?').get('OI-router-form').status, 'reviewing');
});
await test('HEAD suppresses response bodies and service failures stay generic', async () => {
  const head = await route('', { method: 'HEAD', session: ownerSession }); assert.equal(head.response.status, 200); assert.equal(head.text, '');
  const request = new Request('https://www.gyutron.test/admin/api/customers', { headers: { cookie: cookie(ownerSession) } });
  const response = await handleAdmin(request, { ADMIN_PASSWORD: env.ADMIN_PASSWORD, DB: { prepare() { throw new Error('sensitive SQL details'); } } }, {}, new URL(request.url));
  assert.equal(response.status, 503); assert.ok(!(await response.text()).includes('sensitive SQL details'));
});
await test('a failed team audit rolls back member creation and password changes', async () => {
  const beforeCount = sqlite.prepare('SELECT COUNT(*) AS n FROM admin_users').get().n;
  sqlite.exec("CREATE TEMP TRIGGER fail_staff_audit BEFORE INSERT ON crm_audit BEGIN SELECT RAISE(ABORT,'test audit unavailable'); END");
  const create = await route('/api/team', { method: 'POST', session: ownerSession, body: { name: 'Rollback account', email: 'rollback.staff@example.test', role: 'sales', password: staffPassword } });
  assert.equal(create.response.status, 503); assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM admin_users').get().n, beforeCount);
  const before = user(createdMember.id), session = await createWorkspaceSession(db, env, before);
  const reset = await route(`/api/team/${createdMember.id}/password`, { method: 'POST', session: ownerSession, body: { version: before.version, password: crypto.randomUUID() } });
  assert.equal(reset.response.status, 503); assert.equal(user(createdMember.id).password_hash, before.password_hash);
  assert.equal((await route('/api/bootstrap', { session })).response.status, 200);
  sqlite.exec('DROP TRIGGER fail_staff_audit');
});
await test('concurrent team capacity check cannot create account 501 or ghost audit', async () => {
  const count = sqlite.prepare('SELECT COUNT(*) AS n FROM admin_users').get().n;
  const insert = sqlite.prepare('INSERT INTO admin_users (id,email,name,role,password_hash,active,created_at,updated_at) VALUES (?,?,?,?,?,1,?,?)');
  for (let index = count; index < 499; index++) insert.run(`capacity-${index}`, `capacity-${index}@example.test`, 'Capacity fixture', 'viewer', staffHash, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
  const beforeAudits = sqlite.prepare('SELECT COUNT(*) AS n FROM crm_audit').get().n;
  beforeBatch = () => insert.run('capacity-final', 'capacity-final@example.test', 'Concurrent final account', 'viewer', staffHash, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
  const r = await route('/api/team', { method: 'POST', session: ownerSession, body: { name: 'Overflow', email: 'capacity-overflow@example.test', role: 'viewer', password: staffPassword } });
  assert.equal(r.response.status, 422); assert.equal(r.data.error.code, 'TEAM_LIMIT');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM admin_users').get().n, 500);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM crm_audit').get().n, beforeAudits);
});
await test('System operational metadata permits managers and excludes secrets and backup addresses', async () => {
  sqlite.prepare('INSERT INTO events (event_id,event_type,payload_json,created_at) VALUES (?,?,?,?)').run('EVT-system-metadata', 'backup.created', JSON.stringify({ verified: true, schema_version: 2, counts: { leads: 2, admin_users: 500 }, retention_ok: true, key: 'sensitive/private-backup-key', sha256: 'sensitive-whole-file-hash', secret: env.ADMIN_PASSWORD }), new Date().toISOString());
  for (const id of ['owner', 'staff-manager']) {
    const r = await route('/api/system', { session: sessions[id] }); assert.equal(r.response.status, 200);
    assert.equal(r.data.data.workspace.tenancy, 'deployment'); assert.equal(r.data.data.backup.verified, true); assert.equal(r.data.data.backup.totalRows, 502);
    for (const secret of [env.ADMIN_PASSWORD, 'sensitive/private-backup-key', 'sensitive-whole-file-hash', staffHash]) assert.ok(!r.text.includes(secret));
    assert.equal(r.data.data.migration.latest, '0005_crm_relation_guards.sql');
  }
  for (const id of ['staff-sales', 'staff-viewer']) assert.equal((await route('/api/system', { session: sessions[id] })).response.status, 403);
});
await test('manual backup requires owner, CSRF, POST and current password; storage failure is not success', async () => {
  assert.equal((await route('/api/system/backup', { session: ownerSession })).response.status, 405);
  assert.equal((await route('/api/system/backup', { method: 'POST', session: sessions['staff-manager'], body: { password: env.ADMIN_PASSWORD } })).response.status, 403);
  assert.equal((await route('/api/system/backup', { method: 'POST', session: ownerSession, csrf: false, body: { password: env.ADMIN_PASSWORD } })).response.status, 403);
  assert.equal((await route('/api/system/backup', { method: 'POST', session: ownerSession, body: {} })).response.status, 422);
  assert.equal((await route('/api/system/backup', { method: 'POST', session: ownerSession, body: { password: 'incorrect' } })).response.status, 403);
  const r = await route('/api/system/backup', { method: 'POST', session: ownerSession, body: { password: env.ADMIN_PASSWORD } });
  assert.equal(r.response.status, 503); assert.equal(r.data.error.code, 'BACKUP_FAILED'); assert.ok(!r.text.includes(env.ADMIN_PASSWORD));
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM crm_audit WHERE action='backup.requested'").get().n, 0);
});

sqlite.close();
for (const failure of failures) console.error(`FAIL ${failure.name}\n${failure.stack}`);
console.log(JSON.stringify({ passed, failed: failures.length, checks: passed + failures.length, storage: 'real SQLite in memory', productionWrites: false }, null, 2));
if (failures.length) process.exitCode = 1;
