/** Sustained quotation exercise against an isolated local Worker. No production targets. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.QUOTE_SOAK_URL || 'http://127.0.0.1:8792';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname)) throw new Error('Loopback required.');
const seconds = Number(process.env.QUOTE_SOAK_SECONDS || 5400);
if (!Number.isInteger(seconds) || seconds < 60 || seconds > 10800) throw new Error('Invalid duration.');
const sourceRef = process.env.QUOTE_SOAK_REF;
if (!/^[a-f0-9]{7,40}$/.test(sourceRef || '')) throw new Error('A pinned source reference is required.');
const password = process.env.QUOTE_SOAK_PASSWORD || 'quote-soak-local-2026';
const started = Date.now(), run = crypto.randomUUID().slice(0, 8), jar = new Map(), timings = [], errors = [];
let csrf = '', cycles = 0, requests = 0, lastReport = 0;
const counts = { issued: 0, revisions: 0, conflicts: 0, prints: 0, archives: 0, backups: 0, sessionRevocations: 0 };
async function call(path, method = 'GET', value, expected = 200) {
  const headers = { 'cf-connecting-ip': '192.0.2.201' };
  if (jar.size) headers.cookie = [...jar].map(([key, value]) => `${key}=${value}`).join('; ');
  if (method !== 'GET') { headers.origin = origin; if (csrf) headers['x-csrf-token'] = csrf; }
  let body = value;
  if (value && typeof value !== 'string') { headers['content-type'] = 'application/json'; body = JSON.stringify(value); }
  else if (typeof value === 'string') headers['content-type'] = 'application/x-www-form-urlencoded';
  const begin = performance.now();
  const response = await fetch(origin + path, { method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(15000) });
  for (const cookie of response.headers.getSetCookie()) { const [first] = cookie.split(';'), index = first.indexOf('='); jar.set(first.slice(0, index), first.slice(index + 1)); }
  const text = await response.text(); requests++; timings.push(performance.now() - begin);
  if (timings.length > 20000) timings.splice(0, 1000);
  assert.equal(response.status, expected, `${path}: ${response.status}`);
  let data; try { data = JSON.parse(text); } catch { data = null; }
  return { data, text };
}
async function login() {
  csrf = ''; jar.clear();
  const page = await call('/admin'); assert.ok(!/name="email"/.test(page.text));
  const token = page.text.match(/name="csrf_token" value="([a-f0-9]+)"/)?.[1]; assert.ok(token);
  await call('/admin/auth/login', 'POST', new URLSearchParams({ password, csrf_token: token }).toString(), 303);
  const app = await call('/admin'); csrf = JSON.parse(app.text.match(/id="workspace-bootstrap">([^<]+)<\/script>/)[1]).csrfToken;
  assert.ok(csrf);
}
async function quotationCycle() {
  let customer = (await call('/admin/api/customers', 'POST', { name: `Quote soak ${run} ${cycles}` }, 201)).data.data;
  const yen = cycles % 120 === 0;
  const currency = yen ? 'JPY' : 'USD', total = yen ? 567500 : 5675, multiplier = yen ? 100 : 1;
  let quote = (await call('/admin/api/quotes', 'POST', {
    customer_id: customer.public_id, title: `Synthetic inspection ${cycles}`, currency,
    items: [{ sku: `SOAK-${cycles}`, description: 'Local synthetic quotation · 本地验收', quantity: 3, unit_price_minor: 1999 * multiplier }],
    discount_minor: 997 * multiplier, tax_minor: 375 * multiplier, shipping_minor: 300 * multiplier,
    notes: 'Synthetic local fixture. No external message.', terms: 'Local test only.'
  }, 201)).data.data;
  assert.equal(quote.total_minor, total);
  const staleVersion = quote.version;
  quote = (await call(`/admin/api/quotes/${quote.public_id}`, 'PATCH', { version: quote.version, terms: 'Verified local terms.' })).data.data;
  await call(`/admin/api/quotes/${quote.public_id}`, 'PATCH', { version: staleVersion, terms: 'Stale' }, 409); counts.conflicts++;
  quote = (await call(`/admin/api/quotes/${quote.public_id}/issue`, 'POST', { version: quote.version })).data.data; counts.issued++;
  const lang = ['en', 'zh', 'de', 'ja'][Math.floor(cycles / 60) % 4];
  const printPath = `/admin/quotes/${quote.public_id}/print?lang=${lang}`, before = (await call(printPath)).text; counts.prints++;
  await call(`/admin/quotes/${quote.public_id}/print.css?lang=${lang}`);
  customer = (await call(`/admin/api/customers/${customer.public_id}`, 'PATCH', { version: customer.version, name: `Changed local recipient ${run} ${cycles}` })).data.data;
  assert.equal((await call(printPath)).text, before); counts.prints++;
  await call(`/admin/api/quotes/${quote.public_id}`, 'PATCH', { version: quote.version, title: 'Forbidden' }, 409); counts.conflicts++;
  await call(`/admin/api/customers/${customer.public_id}`, 'DELETE', { version: customer.version }, 409); counts.conflicts++;
  let revision = (await call(`/admin/api/quotes/${quote.public_id}/revise`, 'POST', { version: quote.version }, 201)).data.data; counts.revisions++;
  assert.equal((await call(`/admin/api/quotes/${quote.public_id}/revise`, 'POST', { version: quote.version })).data.data.public_id, revision.public_id);
  revision = (await call(`/admin/api/quotes/${revision.public_id}`, 'DELETE', { version: revision.version })).data.data; counts.archives++;
  revision = (await call(`/admin/api/quotes/${revision.public_id}/restore`, 'POST', { version: revision.version })).data.data;
  assert.equal(revision.items.length, 1); assert.equal(revision.total_minor, total);
  quote = (await call(`/admin/api/quotes/${quote.public_id}`)).data.data;
  quote = (await call(`/admin/api/quotes/${quote.public_id}/status`, 'POST', { version: quote.version, status: 'accepted', note: `PRIVATE-SOAK-${run}` })).data.data;
  assert.ok(!(await call(printPath)).text.includes(`PRIVATE-SOAK-${run}`)); counts.prints++;
  for (const record of [revision, quote]) { await call(`/admin/api/quotes/${record.public_id}`, 'DELETE', { version: record.version }); counts.archives++; }
  await call(`/admin/api/customers/${customer.public_id}`, 'DELETE', { version: customer.version }); counts.archives++;
}
function summary(final = false) {
  const sorted = [...timings].sort((a, b) => a - b), percentile = p => sorted.length ? Math.round(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]) : null;
  return { run, runtime: 'isolated pinned quotation workerd + D1 + R2', sourceRef, origin, startedAt: new Date(started).toISOString(), at: new Date().toISOString(), durationSeconds: Math.round((Date.now() - started) / 1000), targetSeconds: seconds, final, requests, cycles, counts, latencyMs: { p50: percentile(.5), p95: percentile(.95), max: Math.round(sorted.at(-1) || 0) }, errors, productionRequests: 0 };
}
await mkdir('artifacts/admin-saas-20261103', { recursive: true });
const reportPath = 'artifacts/admin-saas-20261103/local-soak-quotes.json';
await login();
while (Date.now() - started < seconds * 1000) {
  const iteration = Date.now();
  try {
    await Promise.all([call('/admin/api/quotes?limit=50'), call('/admin/api/dashboard')]);
    if (cycles % 60 === 0) await quotationCycle();
    if (cycles % 1200 === 0) { assert.equal((await call('/admin/api/system/backup', 'POST', { password })).data.data.verified, true); counts.backups++; }
    if (cycles > 0 && cycles % 600 === 0) {
      const old = new Map(jar); await call('/admin/logout', 'POST', {}, 303);
      jar.clear(); for (const [key, value] of old) jar.set(key, value);
      await call('/admin/api/quotes', 'GET', undefined, 401); counts.sessionRevocations++; await login();
    }
    cycles++;
  } catch (error) { errors.push({ at: new Date().toISOString(), cycle: cycles, message: error.message.slice(0, 220) }); break; }
  if (Date.now() - lastReport >= 60000) { const report = summary(); await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify({ durationSeconds: report.durationSeconds, requests, errors: errors.length })); lastReport = Date.now(); }
  await new Promise(resolve => setTimeout(resolve, Math.max(0, 1000 - (Date.now() - iteration))));
}
await writeFile(reportPath, JSON.stringify(summary(true), null, 2) + '\n');
console.log(JSON.stringify(summary(true), null, 2));
if (errors.length) process.exitCode = 1;
