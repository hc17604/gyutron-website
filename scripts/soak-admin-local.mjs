/** Sustained local workerd exercise. Never permits a production target. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.ADMIN_SOAK_URL || 'http://127.0.0.1:8789';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname)) throw new Error('This workload is restricted to loopback.');
const seconds = Number(process.env.ADMIN_SOAK_SECONDS || 9600);
if (!Number.isInteger(seconds) || seconds < 60 || seconds > 14400) throw new Error('Duration must be 60–14400 seconds.');
const password = process.env.ADMIN_SOAK_PASSWORD || 'soak-local-owner-2026';
const started = Date.now(), run = crypto.randomUUID().slice(0, 8), latencies = [], errors = [];
const jar = new Map(); let csrf = '', requests = 0, cycles = 0, backups = 0, lastReport = 0;
const counts = { reads: 0, creates: 0, updates: 0, conflicts: 0, archives: 0, restores: 0, negativeChecks: 0 };
async function call(path, method = 'GET', body, expected = 200, extra = {}) {
  const headers = { 'cf-connecting-ip': '192.0.2.198', ...extra };
  if (jar.size) headers.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
  if (method !== 'GET') { headers.origin = origin; if (csrf) headers['x-csrf-token'] = csrf; }
  if (body && typeof body !== 'string') { headers['content-type'] = 'application/json'; body = JSON.stringify(body); }
  const begin = performance.now();
  const response = await fetch(origin + path, { method, body, headers, redirect: 'manual', signal: AbortSignal.timeout(15000) });
  for (const cookie of response.headers.getSetCookie()) {
    const value = cookie.split(';')[0], pos = value.indexOf('='); jar.set(value.slice(0, pos), value.slice(pos + 1));
  }
  const text = await response.text(); requests++; latencies.push(performance.now() - begin);
  if (latencies.length > 20000) latencies.splice(0, 1000);
  assert.equal(response.status, expected, `${path}: unexpected status ${response.status}`);
  let data; try { data = JSON.parse(text); } catch { data = null; }
  if (method === 'GET') counts.reads++;
  return { response, text, data };
}
async function login() {
  csrf = ''; jar.clear();
  const page = await call('/admin');
  const token = page.text.match(/name="csrf_token" value="([a-f0-9]+)"/)?.[1]; assert.ok(token);
  await call('/admin/auth/login', 'POST', new URLSearchParams({ email: '', password, csrf_token: token }).toString(), 303,
    { 'content-type': 'application/x-www-form-urlencoded' });
  const app = await call('/admin');
  const boot = JSON.parse(app.text.match(/id="workspace-bootstrap">([^<]+)<\/script>/)?.[1] || '{}');
  csrf = boot.csrfToken; assert.ok(csrf);
}
async function mutationCycle() {
  let customer = (await call('/admin/api/customers', 'POST', { name: `Soak ${run} ${cycles}`, country: 'Singapore' }, 201)).data.data; counts.creates++;
  let opportunity = (await call('/admin/api/opportunities', 'POST', { title: `Soak project ${cycles}`, customer_id: customer.public_id, currency: cycles % 2 ? 'JPY' : 'USD', amount_minor: 1999, stage: 'discovery' }, 201)).data.data; counts.creates++;
  let task = (await call('/admin/api/tasks', 'POST', { title: `Soak follow-up ${cycles}`, customer_id: customer.public_id, opportunity_id: opportunity.public_id, due_date: '2026-11-03' }, 201)).data.data; counts.creates++;
  await call('/admin/api/activities', 'POST', { customer_id: customer.public_id, opportunity_id: opportunity.public_id, subject: `Soak note ${cycles}`, type: 'note', body: 'Isolated synthetic workload.' }, 201); counts.creates++;
  const version = task.version;
  task = (await call(`/admin/api/tasks/${task.public_id}`, 'PATCH', { version, status: 'done' })).data.data; counts.updates++;
  await call(`/admin/api/tasks/${task.public_id}`, 'PATCH', { version, status: 'open' }, 409); counts.conflicts++;
  await call(`/admin/api/customers/${customer.public_id}`, 'DELETE', { version: customer.version }, 409); counts.negativeChecks++;
  task = (await call(`/admin/api/tasks/${task.public_id}`, 'DELETE', { version: task.version })).data.data; counts.archives++;
  opportunity = (await call(`/admin/api/opportunities/${opportunity.public_id}`, 'DELETE', { version: opportunity.version })).data.data; counts.archives++;
  customer = (await call(`/admin/api/customers/${customer.public_id}`, 'DELETE', { version: customer.version })).data.data; counts.archives++;
  customer = (await call(`/admin/api/customers/${customer.public_id}/restore`, 'POST', { version: customer.version })).data.data; counts.restores++;
  customer = (await call(`/admin/api/customers/${customer.public_id}`, 'DELETE', { version: customer.version })).data.data; counts.archives++;
  const history = await call(`/admin/api/audit?entity_type=customers&entity_id=${customer.public_id}`); assert.ok(history.data.meta.total >= 4);
}
function summary(final = false) {
  const sorted = [...latencies].sort((a, b) => a - b), percentile = p => sorted.length ? Math.round(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]) : null;
  return { run, runtime: 'isolated pinned core workerd + D1 + R2', origin, sourceRef: 'fa373c7', startedAt: new Date(started).toISOString(), at: new Date().toISOString(), durationSeconds: Math.round((Date.now() - started) / 1000), targetSeconds: seconds,
    final, requests, cycles, backups, counts, latencyMs: { p50: percentile(.5), p95: percentile(.95), max: sorted.length ? Math.round(sorted.at(-1)) : null }, errors: [...errors], productionRequests: 0 };
}
await mkdir('artifacts/admin-saas-20261103', { recursive: true });
const reportPath = 'artifacts/admin-saas-20261103/local-soak-core.json';
await login();
while (Date.now() - started < seconds * 1000) {
  const iteration = Date.now();
  try {
    await Promise.all([call('/admin/api/dashboard'), call('/admin/api/customers?limit=50')]);
    if (cycles % 60 === 0) await mutationCycle();
    if (cycles % 1200 === 0) {
      const result = await call('/admin/api/system/backup', 'POST', { password }); assert.equal(result.data.data.verified, true); backups++;
    }
    if (cycles % 600 === 0 && cycles > 0) {
      const replay = new Map(jar);
      await call('/admin/logout', 'POST', {}, 303);
      jar.clear(); for (const [k, v] of replay) jar.set(k, v);
      await call('/admin/api/bootstrap', 'GET', undefined, 401); counts.negativeChecks++;
      await login();
    }
    cycles++;
  } catch (error) {
    errors.push({ at: new Date().toISOString(), cycle: cycles, message: error.message.slice(0, 200) });
    if (errors.length >= 5) break;
    await new Promise(resolve => setTimeout(resolve, 2000));
    try { await login(); } catch (e) { errors.push({ at: new Date().toISOString(), message: 'Recovery login failed: ' + e.message.slice(0, 100) }); break; }
    cycles++;
  }
  if (Date.now() - lastReport >= 60000) {
    const report = summary(); await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ durationSeconds: report.durationSeconds, requests, cycles, errors: errors.length, p95ms: report.latencyMs.p95 })); lastReport = Date.now();
  }
  await new Promise(resolve => setTimeout(resolve, Math.max(0, 1000 - (Date.now() - iteration))));
}
await writeFile(reportPath, JSON.stringify(summary(true), null, 2) + '\n');
console.log(JSON.stringify(summary(true), null, 2));
if (errors.length) process.exitCode = 1;
