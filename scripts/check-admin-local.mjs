/** Real workerd/D1 acceptance. Intentionally rejects non-loopback targets and uses local-only fixtures. */
import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
const origin = process.env.ADMIN_LOCAL_URL || 'http://127.0.0.1:8787';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname)) throw new Error('Local QA only.');
const password = process.env.ADMIN_LOCAL_PASSWORD || 'local-workspace-2026';
const run = crypto.randomUUID().slice(0, 8), results = [];
const test = async (name, fn) => {
  const start = performance.now();
  try { await fn(); results.push({ name, ok: true, ms: Math.round(performance.now() - start) }); }
  catch (error) { results.push({ name, ok: false, message: error.message }); throw error; }
};
function client(ip) {
  const cookies = new Map(); let csrf = '';
  async function request(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
    const h = { 'cf-connecting-ip': ip, ...headers };
    if (cookies.size) h.cookie = [...cookies].map(([k, v]) => `${k}=${v}`).join('; ');
    if (method !== 'GET' && method !== 'HEAD') { h.origin ??= origin; if (csrf) h['x-csrf-token'] ??= csrf; }
    if (body !== undefined && typeof body !== 'string') { h['content-type'] = 'application/json'; body = JSON.stringify(body); }
    const response = await fetch(`${origin}${path}`, { method, body, headers: h, redirect: 'manual' });
    for (const cookie of response.headers.getSetCookie()) {
      const first = cookie.split(';')[0], pos = first.indexOf('='); cookies.set(first.slice(0, pos), first.slice(pos + 1));
    }
    const text = await response.text();
    if (raw) return { response, text };
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { response, data, text };
  }
  return { request, cookies, async login(email, pass) {
    const form = await request('/admin', { raw: true });
    const token = form.text.match(/name="csrf_token" value="([a-f0-9]+)"/)?.[1];
    assert.ok(token, 'Login CSRF hidden field missing');
    const result = await request('/admin/auth/login', { method: 'POST', body: new URLSearchParams({ email, password: pass, csrf_token: token }).toString(),
      headers: { 'content-type': 'application/x-www-form-urlencoded' } });
    assert.equal(result.response.status, 303, 'Sign-in should redirect');
    const app = await request('/admin', { raw: true });
    const boot = JSON.parse(app.text.match(/id="workspace-bootstrap">([^<]+)<\/script>/)?.[1] || '{}');
    assert.ok(boot.csrfToken, 'Authenticated workspace CSRF missing'); csrf = boot.csrfToken;
    return boot;
  } };
}
const owner = client(`192.0.2.${Math.floor(Math.random() * 200) + 1}`);
let customer, opportunity, task, member, viewer;
try {
  await test('Unauthenticated JSON endpoints return 401 without HTML', async () => {
    const r = await owner.request('/admin/api/customers'); assert.equal(r.response.status, 401); assert.equal(r.data.error.code, 'UNAUTHENTICATED');
  });
  await test('Login and static assets load under strict CSP', async () => {
    const r = await owner.request('/admin', { raw: true }); assert.equal(r.response.status, 200);
    assert.match(r.response.headers.get('content-security-policy'), /script-src 'self'/);
    assert.match(r.response.headers.get('cache-control'), /no-store/);
    for (const path of ['/admin/assets/workspace.css', '/admin/assets/workspace.js']) assert.equal((await owner.request(path)).response.status, 200);
  });
  await test('Real Worker owner sign-in and bootstrap', async () => {
    const boot = await owner.login('', password); assert.equal(boot.principal.role, 'owner');
    const r = await owner.request('/admin/api/bootstrap'); assert.equal(r.response.status, 200); assert.equal(r.data.data.workspace.tenancy, 'deployment');
  });
  await test('Operational metadata reports actual schema without secrets', async () => {
    const r = await owner.request('/admin/api/system'); assert.equal(r.response.status, 200, r.text);
    assert.equal(r.data.data.workspace.tenancy, 'deployment'); assert.equal(r.data.data.migration.latest, '0006_operations_quotes.sql');
    assert.ok(!r.text.includes(password)); assert.ok(!r.text.includes('password_hash'));
  });
  if (process.env.ADMIN_CHECK_BACKUP === '1') await test('Manual backup is verified using actual workerd, local D1 and local R2', async () => {
    const r = await owner.request('/admin/api/system/backup', { method: 'POST', body: { password } });
    assert.equal(r.response.status, 200, r.text); assert.equal(r.data.data.verified, true);
    const status = await owner.request('/admin/api/system'); assert.equal(status.data.data.backup.verified, true); assert.equal(status.data.data.backup.stale, false);
  });
  await test('Owner can create a salted staff account in actual workerd', async () => {
    const r = await owner.request('/admin/api/team', { method: 'POST', body: { name: `Local QA ${run}`, email: `local-qa-${run}@example.test`, password: 'Local-QA-staff-2026', role: 'viewer' } });
    assert.equal(r.response.status, 201, r.text); member = r.data.data; assert.ok(!('password_hash' in member));
  });
  await test('Staff scrypt authentication works in actual workerd', async () => {
    viewer = client(`198.51.100.${Math.floor(Math.random() * 200) + 1}`);
    const boot = await viewer.login(member.email, 'Local-QA-staff-2026'); assert.equal(boot.principal.role, 'viewer');
  });
  await test('Viewer cannot write, export, audit or manage team', async () => {
    for (const path of ['/admin/api/team', '/admin/api/audit', '/admin/api/export?resource=customers', '/admin/api/system']) assert.equal((await viewer.request(path)).response.status, 403, path);
    assert.equal((await viewer.request('/admin/api/customers', { method: 'POST', body: { name: 'Forbidden' } })).response.status, 403);
  });
  await test('Cross-origin write is denied before business logic', async () => {
    const r = await owner.request('/admin/api/customers', { method: 'POST', headers: { origin: 'https://attacker.example' }, body: { name: 'Forbidden' } }); assert.equal(r.response.status, 403);
  });
  await test('Customer creation and search persist in D1', async () => {
    const r = await owner.request('/admin/api/customers', { method: 'POST', body: { name: `Local QA ${run} <script>`, email: 'example@example.test', country: 'Singapore' } });
    assert.equal(r.response.status, 201, r.text); customer = r.data.data;
    const search = await owner.request(`/admin/api/customers?q=${run}`); assert.ok(search.data.data.some(row => row.public_id === customer.public_id));
  });
  await test('Optimistic conflict returns 409 and preserves saved version', async () => {
    const first = await owner.request(`/admin/api/customers/${customer.public_id}`, { method: 'PATCH', body: { version: customer.version, notes: 'Local QA saved' } });
    assert.equal(first.response.status, 200, first.text);
    const stale = await owner.request(`/admin/api/customers/${customer.public_id}`, { method: 'PATCH', body: { version: customer.version, notes: 'Must not overwrite' } });
    assert.equal(stale.response.status, 409); customer = first.data.data;
  });
  await test('Customer to opportunity to task workflow persists', async () => {
    let r = await owner.request('/admin/api/opportunities', { method: 'POST', body: { title: `Local QA project ${run}`, customer_id: customer.public_id, amount_minor: 125000, currency: 'USD', stage: 'proposal', probability: 60 } });
    assert.equal(r.response.status, 201, r.text); opportunity = r.data.data;
    r = await owner.request('/admin/api/tasks', { method: 'POST', body: { title: `Local QA follow-up ${run}`, customer_id: customer.public_id, opportunity_id: opportunity.public_id, due_date: '2026-11-01', priority: 'high' } });
    assert.equal(r.response.status, 201, r.text); task = r.data.data;
  });
  await test('Activity writes and dashboard return actual records', async () => {
    const activity = await owner.request('/admin/api/activities', { method: 'POST', body: { customer_id: customer.public_id, opportunity_id: opportunity.public_id, type: 'note', subject: `Local QA note ${run}`, body: 'Local-only acceptance fixture.' } }); assert.equal(activity.response.status, 201, activity.text);
    const dash = await owner.request('/admin/api/dashboard'); assert.equal(dash.response.status, 200); assert.ok(dash.data.data);
  });
  await test('Archive guards, child archive, parent archive and restore work', async () => {
    let r = await owner.request(`/admin/api/customers/${customer.public_id}`, { method: 'DELETE', body: { version: customer.version } }); assert.equal(r.response.status, 409);
    r = await owner.request(`/admin/api/tasks/${task.public_id}`, { method: 'DELETE', body: { version: task.version } }); assert.equal(r.response.status, 200, r.text); task = r.data.data;
    r = await owner.request(`/admin/api/opportunities/${opportunity.public_id}`, { method: 'DELETE', body: { version: opportunity.version } }); assert.equal(r.response.status, 200, r.text); opportunity = r.data.data;
    r = await owner.request(`/admin/api/customers/${customer.public_id}`, { method: 'DELETE', body: { version: customer.version } }); assert.equal(r.response.status, 200, r.text); customer = r.data.data;
    r = await owner.request(`/admin/api/customers/${customer.public_id}/restore`, { method: 'POST', body: { version: customer.version } }); assert.equal(r.response.status, 200, r.text); customer = r.data.data;
  });
  await test('Safe filtered export and preserved operational routes work', async () => {
    const r = await owner.request(`/admin/api/export?resource=customers&q=${run}`, { raw: true }); assert.equal(r.response.status, 200); assert.match(r.text, new RegExp(run)); assert.ok(!r.text.includes('password_hash'));
    for (const path of ['/admin/order-intents', '/admin/events', '/admin/legacy.css']) assert.equal((await owner.request(path)).response.status, 200, path);
  });
  await test('Team deactivation invalidates existing staff session immediately', async () => {
    const r = await owner.request(`/admin/api/team/${member.id}`, { method: 'PATCH', body: { version: member.version, active: false } }); assert.equal(r.response.status, 200, r.text);
    assert.equal((await viewer.request('/admin/api/bootstrap')).response.status, 401);
  });
  await test('Sign out revokes server session and rejects replay', async () => {
    const saved = new Map(owner.cookies);
    assert.equal((await owner.request('/admin/logout', { method: 'POST', body: {} })).response.status, 303);
    owner.cookies.clear(); for (const [k, v] of saved) owner.cookies.set(k, v);
    assert.equal((await owner.request('/admin/api/bootstrap')).response.status, 401);
  });
} finally {
  const summary = { runtime: 'actual workerd + local D1', origin, run, at: new Date().toISOString(), results, passed: results.filter(r => r.ok).length, total: results.length };
  await mkdir('artifacts/admin-saas-20261103', { recursive: true });
  await writeFile('artifacts/admin-saas-20261103/local-worker-checks.json', JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}
