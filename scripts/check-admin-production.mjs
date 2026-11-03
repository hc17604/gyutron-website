/** Explicit live checks. Read one JSON line on stdin; never print passwords, cookies or customer rows. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { posix } from 'node:path';
if (process.stdin.isTTY) process.stdin.setRawMode(true);
console.log('Ready for live-check JSON on stdin (input hidden).');
const input = await new Promise((resolve, reject) => {
  const lines = createInterface({ input: process.stdin, terminal: false });
  lines.once('line', line => { lines.close(); try { resolve(JSON.parse(line)); } catch { reject(new Error('Expected one JSON line.')); } });
});
if (process.stdin.isTTY) process.stdin.setRawMode(false);
process.stdin.pause();
if (typeof input.password !== 'string' || !input.password) throw new Error('An owner credential is required on stdin.');
const origin = 'https://www.gyutron.com', results = [], observations = {};
const ref = input.ref || 'fa373c7';
if (!/^[a-f0-9]{7,40}$/.test(ref)) throw new Error('Invalid source reference.');
function sourceModuleUrl(file) {
  let source = execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
  source = source.replace(/^(import\s+[^\n]+?\s+from\s+)(['"])(\.[^'"]+)\2/gm,
    (_match, prefix, quote, relative) => `${prefix}${quote}${sourceModuleUrl(posix.join(posix.dirname(file), relative))}${quote}`);
  return 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
}
const test = async (name, fn) => {
  const start = performance.now();
  try { await fn(); results.push({ name, ok: true, ms: Math.round(performance.now() - start) }); }
  catch (error) { results.push({ name, ok: false, message: error.message.slice(0, 500) }); }
};
function client() {
  const jar = new Map(); let csrf = '';
  const request = async (path, method = 'GET', body, overrides = {}) => {
    const headers = { ...overrides };
    if (jar.size) headers.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
    if (!['GET', 'HEAD'].includes(method)) { headers.origin ??= origin; if (csrf) headers['x-csrf-token'] ??= csrf; }
    if (body && typeof body !== 'string') { headers['content-type'] = 'application/json'; body = JSON.stringify(body); }
    const response = await fetch(origin + path, { method, body, headers, redirect: 'manual' });
    for (const cookie of response.headers.getSetCookie()) {
      const first = cookie.split(';')[0], pos = first.indexOf('='); jar.set(first.slice(0, pos), first.slice(pos + 1));
    }
    const text = await response.text(); let data;
    try { data = JSON.parse(text); } catch { data = null; }
    return { response, text, data };
  };
  return { request, jar, async login(email, password) {
    const form = await request('/admin');
    const token = form.text.match(/name="csrf_token" value="([a-f0-9]+)"/)?.[1];
    assert.ok(token, 'Expected the new login form');
    const fields = { password, csrf_token: token };
    if (email) fields.email = email;
    const signed = await request('/admin/auth/login', 'POST', new URLSearchParams(fields).toString(), { 'content-type': 'application/x-www-form-urlencoded' });
    assert.equal(signed.response.status, 303, 'Live sign-in did not succeed');
    const cookie = signed.response.headers.getSetCookie().find(value => value.startsWith('gy_workspace='));
    assert.match(cookie || '', /HttpOnly/); assert.match(cookie || '', /Secure/); assert.match(cookie || '', /SameSite=Strict/);
    const app = await request('/admin');
    const boot = JSON.parse(app.text.match(/id="workspace-bootstrap">([^<]+)<\/script>/)?.[1] || '{}');
    assert.ok(boot.csrfToken); csrf = boot.csrfToken; return boot;
  } };
}
const owner = client(); let staffMember = null;
await test('Production denies unauthenticated business APIs and old cookies', async () => {
  for (const path of ['/admin/api/bootstrap', '/admin/api/customers', '/admin/api/quotes', '/admin/api/export?resource=customers']) {
    const r = await owner.request(path, 'GET', undefined, { cookie: 'gy_admin=legacy.invalid' });
    assert.equal(r.response.status, 401); assert.equal(r.data?.error?.code, 'UNAUTHENTICATED');
  }
});
await test('Production core, quotation and locale assets exactly match the committed source', async () => {
  for (const [file, name, path] of [
    ['client.mjs', 'ADMIN_CLIENT', '/admin/assets/workspace.js'], ['styles.mjs', 'ADMIN_STYLES', '/admin/assets/workspace.css'],
    ['quotes-client.mjs', 'QUOTES_CLIENT', '/admin/assets/quotes.js'], ['quotes-styles.mjs', 'QUOTES_STYLES', '/admin/assets/quotes.css'],
    ['locale-assets.mjs', 'ADMIN_LOCALE_CLIENT', '/admin/assets/locales.js']
  ]) {
    const module = await import(sourceModuleUrl(`src/admin/${file}`));
    const r = await owner.request(path); assert.equal(r.response.status, 200);
    assert.equal(r.text.replaceAll('\r\n', '\n'), module[name].replaceAll('\r\n', '\n'));
    assert.match(r.response.headers.get('cache-control'), /no-store/);
    observations.version = r.response.headers.get('x-gyutron-admin');
  }
});
await test('Four live language forms have exactly one password input and no account field', async () => {
  for (const lang of ['en', 'zh', 'de', 'ja']) {
    const response = await fetch(`${origin}/admin?lang=${lang}`), html = await response.text();
    assert.equal(response.status, 200);
    assert.equal((html.match(/type="password"/g) || []).length, 1, lang);
    assert.ok(!/type="email"|name="email"/.test(html), lang);
    assert.match(html, new RegExp(`<html lang="${lang === 'zh' ? 'zh-CN' : lang}"`));
  }
});
await test('Production owner sign-in creates a secure revocable session', async () => {
  const boot = await owner.login('', input.password); assert.equal(boot.principal.role, 'owner');
});
await test('Production quotation lists and protected print assets load without creating records', async () => {
  const list = await owner.request('/admin/api/quotes'); assert.equal(list.response.status, 200); assert.ok(list.data?.data);
  for (const [name, path] of [['QUOTE_PRINT_CSS', '/admin/quotes/assets/print.css'], ['QUOTE_PRINT_JS', '/admin/quotes/assets/print.js']]) {
    const module = await import(sourceModuleUrl('src/platform/quotes/document.mjs'));
    const asset = await owner.request(path); assert.equal(asset.response.status, 200);
    assert.equal(asset.text.replaceAll('\r\n', '\n'), module[name].replaceAll('\r\n', '\n'));
    assert.match(asset.response.headers.get('cache-control'), /no-store/);
  }
  const missing = await owner.request('/admin/quotes/QUO-00000000-0000-0000-0000-000000000000/print');
  assert.equal(missing.response.status, 404);
});
await test('Production bootstrap, actual dashboard and operational metadata load', async () => {
  for (const path of ['/admin/api/bootstrap', '/admin/api/dashboard', '/admin/api/system']) {
    const r = await owner.request(path); assert.equal(r.response.status, 200, path); assert.ok(r.data?.data);
    if (path.endsWith('/system')) observations.system = { migration: r.data.data.migration.latest, backup: r.data.data.backup.status, ownerCredentialStrong: r.data.data.security.ownerCredentialStrong };
  }
});
await test('Live CSP and no-store protect authenticated HTML', async () => {
  const r = await owner.request('/admin'); assert.match(r.response.headers.get('content-security-policy'), /script-src 'self'/);
  assert.ok(!r.response.headers.get('content-security-policy').includes('unsafe-inline'));
  assert.match(r.response.headers.get('cache-control'), /no-store/); assert.equal(r.response.headers.get('x-frame-options'), 'DENY');
});
await test('Live missing-CSRF and cross-origin writes are rejected', async () => {
  let r = await owner.request('/admin/api/customers', 'POST', {}, { 'x-csrf-token': 'invalid' }); assert.equal(r.response.status, 403);
  r = await owner.request('/admin/api/customers', 'POST', {}, { origin: 'https://not-this-workspace.example' }); assert.equal(r.response.status, 403);
});
await test('Preserved order intake/events and filtered CSV remain protected and usable', async () => {
  for (const path of ['/admin/order-intents', '/admin/events', '/admin/legacy.css', '/admin/api/export?resource=customers']) assert.equal((await owner.request(path)).response.status, 200, path);
});
if (input.staffCheck === true) await test('Production staff password hashing, login and viewer RBAC work', async () => {
  const password = crypto.randomUUID() + crypto.randomUUID(), email = `runtime-verification-${crypto.randomUUID()}@example.test`;
  const created = await owner.request('/admin/api/team', 'POST', { name: 'Temporary runtime verification', email, password, role: 'viewer' });
  assert.equal(created.response.status, 201, 'Production staff creation failed'); staffMember = created.data.data;
  assert.ok(!Object.hasOwn(staffMember, 'password_hash'));
  const viewer = client(); const boot = await viewer.login(email, password); assert.equal(boot.principal.role, 'viewer');
  for (const path of ['/admin/api/team', '/admin/api/audit', '/admin/api/system']) assert.equal((await viewer.request(path)).response.status, 403, path);
  const disabled = await owner.request(`/admin/api/team/${staffMember.id}`, 'PATCH', { version: staffMember.version, active: false }); assert.equal(disabled.response.status, 200);
  staffMember = disabled.data.data;
  assert.equal((await viewer.request('/admin/api/bootstrap')).response.status, 401);
  observations.disabledRuntimeAccount = { id: staffMember.id, email: staffMember.email, active: staffMember.active };
});
if (staffMember && staffMember.active !== 0) await test('Temporary staff account is disabled after runtime check', async () => {
  const r = await owner.request(`/admin/api/team/${staffMember.id}`, 'PATCH', { version: staffMember.version, active: false });
  assert.equal(r.response.status, 200); observations.disabledRuntimeAccount = { id: staffMember.id, email: staffMember.email, active: 0 };
});
if (input.backupCheck === true) await test('Production manual backup completes and passes actual private R2 verification', async () => {
  const r = await owner.request('/admin/api/system/backup', 'POST', { password: input.password });
  assert.equal(r.response.status, 200, 'Production backup did not verify'); assert.equal(r.data.data.verified, true);
  const state = await owner.request('/admin/api/system'); assert.equal(state.data.data.backup.verified, true); assert.equal(state.data.data.backup.stale, false);
  observations.backupVerified = true;
});
await test('Production logout rejects replay of the just-issued session', async () => {
  const saved = new Map(owner.jar); assert.equal((await owner.request('/admin/logout', 'POST', {})).response.status, 303);
  owner.jar.clear(); for (const [key, value] of saved) owner.jar.set(key, value);
  assert.equal((await owner.request('/admin/api/bootstrap')).response.status, 401);
});
await test('Brand and storefront remain available', async () => {
  for (const url of [origin + '/', origin + '/de/', origin + '/ja/', origin + '/api/v1/health', 'https://shop.gyutron.com/']) {
    const r = await fetch(url); assert.equal(r.status, 200, url); await r.body?.cancel();
  }
});
const report = { at: new Date().toISOString(), origin, sourceRef: ref, observations, results, passed: results.filter(x => x.ok).length, total: results.length };
await mkdir('artifacts/admin-saas-20261103', { recursive: true });
const label = typeof input.label === 'string' && /^[a-z0-9-]{1,32}$/.test(input.label) ? `-${input.label}` : '';
await writeFile(`artifacts/admin-saas-20261103/production-core${label}-checks.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (results.some(x => !x.ok)) process.exitCode = 1;
