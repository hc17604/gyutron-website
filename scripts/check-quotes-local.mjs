/** Real local workerd quotation workflow; refuses all non-loopback targets. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.ADMIN_LOCAL_URL || 'http://127.0.0.1:8787';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname)) throw new Error('Local QA only.');
const password = process.env.ADMIN_LOCAL_PASSWORD || 'local-workspace-2026';
const run = crypto.randomUUID().slice(0, 8), jar = new Map(), results = [];
let csrf = '', customer, opportunity, quote, issued, revision;
async function call(path, method = 'GET', body, expected = 200) {
  const headers = { 'cf-connecting-ip': `198.51.100.${Math.floor(Math.random() * 200) + 1}` };
  if (jar.size) headers.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
  if (method !== 'GET') { headers.origin = origin; if (csrf) headers['x-csrf-token'] = csrf; }
  if (body && typeof body !== 'string') { headers['content-type'] = 'application/json'; body = JSON.stringify(body); }
  else if (typeof body === 'string') headers['content-type'] = 'application/x-www-form-urlencoded';
  const response = await fetch(origin + path, { method, headers, body, redirect: 'manual' });
  for (const cookie of response.headers.getSetCookie()) { const first = cookie.split(';')[0], i = first.indexOf('='); jar.set(first.slice(0, i), first.slice(i + 1)); }
  const text = await response.text(); let data; try { data = JSON.parse(text); } catch { data = null; }
  assert.equal(response.status, expected, `${path}: ${text.slice(0, 300)}`); return { response, data, text };
}
const check = async (name, fn) => { const start = performance.now(); try { await fn(); results.push({ name, ok: true, ms: Math.round(performance.now() - start) }); } catch (error) { results.push({ name, ok: false, message: error.message }); throw error; } };
try {
  await check('Password-only local login and quotation assets load', async () => {
    const page = await call('/admin'); assert.ok(!/name="email"/.test(page.text));
    const token = page.text.match(/name="csrf_token" value="([a-f0-9]+)"/)?.[1]; assert.ok(token);
    await call('/admin/auth/login', 'POST', new URLSearchParams({ password, csrf_token: token }).toString(), 303);
    const app = await call('/admin'); const boot = JSON.parse(app.text.match(/id="workspace-bootstrap">([^<]+)<\/script>/)[1]); csrf = boot.csrfToken;
    for (const path of ['/admin/assets/quotes.js', '/admin/assets/quotes.css']) await call(path);
  });
  await check('Create local customer and linked sales opportunity', async () => {
    customer = (await call('/admin/api/customers', 'POST', { name: `Quotation QA ${run}`, contact_name: 'Local contact', email: 'quote-qa@example.test' }, 201)).data.data;
    opportunity = (await call('/admin/api/opportunities', 'POST', { title: `Quotation QA opportunity ${run}`, customer_id: customer.public_id, currency: 'USD', amount_minor: 5675 }, 201)).data.data;
  });
  const item = { sku: `LOCAL-QA-${run}`, description: '本地验收 / Local inspection system <script>', unit: 'set', quantity: 3, unit_price_minor: 1999 };
  await check('Calculate exact minor units and reject fractional quantities', async () => {
    const r = await call('/admin/api/quotes/calculate', 'POST', { currency: 'USD', items: [item], discount_minor: 997, tax_minor: 375, shipping_minor: 300 }); assert.equal(r.data.data.total_minor, 5675);
    await call('/admin/api/quotes/calculate', 'POST', { currency: 'USD', items: [{ ...item, quantity: 1.5 }] }, 422);
  });
  await check('Create a quotation with manually entered commercial amounts', async () => {
    quote = (await call('/admin/api/quotes', 'POST', { title: `Local QA quotation ${run}`, customer_id: customer.public_id, opportunity_id: opportunity.public_id, currency: 'USD', items: [item], discount_minor: 997, tax_minor: 375, shipping_minor: 300,
      seller_name: 'GYUTRON Local QA', recipient_company: `Quotation QA ${run}`, recipient_name: 'Local contact', recipient_email: 'quote-qa@example.test', terms: 'Local acceptance fixture only. No external offer is sent.', notes: '客户可见的本地测试备注。' }, 201)).data.data;
    assert.equal(quote.total_minor, 5675); assert.equal(quote.items.length, 1); assert.equal(quote.status, 'draft');
  });
  await check('Draft print is protected, escaped and marked as draft', async () => {
    const r = await call(`/admin/quotes/${quote.public_id}/print?lang=zh`); assert.match(r.text, /草稿|DRAFT/i); assert.ok(r.text.includes('&lt;script&gt;')); assert.ok(!r.text.includes('<script>'));
    await call('/admin/quotes/assets/print.css'); await call('/admin/quotes/assets/print.js');
  });
  await check('Versioned draft edits preserve server totals', async () => {
    const old = quote.version;
    quote = (await call(`/admin/api/quotes/${quote.public_id}`, 'PATCH', { version: old, terms: 'Final local fixture terms.' })).data.data;
    assert.equal(quote.total_minor, 5675);
    await call(`/admin/api/quotes/${quote.public_id}`, 'PATCH', { version: old, terms: 'Stale write' }, 409);
  });
  await check('Future-version issue is denied and issue is idempotent', async () => {
    await call(`/admin/api/quotes/${quote.public_id}/issue`, 'POST', { version: quote.version + 20 }, 409);
    issued = (await call(`/admin/api/quotes/${quote.public_id}/issue`, 'POST', { version: quote.version })).data.data;
    assert.equal(issued.status, 'issued'); assert.ok(issued.snapshot_sha256);
    const repeated = await call(`/admin/api/quotes/${quote.public_id}/issue`, 'POST', { version: quote.version }); assert.equal(repeated.data.meta.already_issued, true);
  });
  let frozenHtml;
  await check('Issued content is immutable and customer edits do not change the document', async () => {
    await call(`/admin/api/quotes/${quote.public_id}`, 'PATCH', { version: issued.version, terms: 'Must not change' }, 409);
    frozenHtml = (await call(`/admin/quotes/${quote.public_id}/print?lang=zh`)).text;
    customer = (await call(`/admin/api/customers/${customer.public_id}`, 'PATCH', { version: customer.version, name: `Changed customer ${run}` })).data.data;
    assert.equal((await call(`/admin/quotes/${quote.public_id}/print?lang=zh`)).text, frozenHtml);
  });
  await check('Active quotations produce an actionable CRM archive conflict', async () => {
    const r = await call(`/admin/api/opportunities/${opportunity.public_id}`, 'DELETE', { version: opportunity.version }, 409);
    assert.equal(r.data.error.code, 'ACTIVE_DEPENDENCIES');
  });
  await check('Revision retains old document and repeated revision returns the same draft', async () => {
    const r = await call(`/admin/api/quotes/${quote.public_id}/revise`, 'POST', { version: issued.version }, 201); revision = r.data.data;
    assert.equal(revision.status, 'draft'); assert.equal(revision.revision, 2); assert.equal(revision.total_minor, 5675);
    const repeated = await call(`/admin/api/quotes/${quote.public_id}/revise`, 'POST', { version: issued.version }); assert.equal(repeated.data.data.public_id, revision.public_id);
    assert.equal((await call(`/admin/quotes/${quote.public_id}/print?lang=zh`)).text, frozenHtml);
    issued = (await call(`/admin/api/quotes/${quote.public_id}`)).data.data;
  });
  await check('Record an external outcome without implying an email or payment', async () => {
    issued = (await call(`/admin/api/quotes/${quote.public_id}/status`, 'POST', { version: issued.version, status: 'accepted', note: 'Local test of an externally recorded decision.' })).data.data;
    assert.equal(issued.status, 'accepted'); assert.equal(issued.total_minor, 5675);
  });
  await check('Quotation archive and restore preserve complete rows and items', async () => {
    revision = (await call(`/admin/api/quotes/${revision.public_id}`, 'DELETE', { version: revision.version })).data.data;
    revision = (await call(`/admin/api/quotes/${revision.public_id}/restore`, 'POST', { version: revision.version })).data.data;
    assert.equal(revision.items.length, 1); assert.equal(revision.total_minor, 5675);
  });
  await check('JPY calculation and print use zero currency decimal places', async () => {
    const jpy = (await call('/admin/api/quotes', 'POST', { title: `Local JPY ${run}`, customer_id: customer.public_id, currency: 'JPY', items: [{ ...item, quantity: 1, unit_price_minor: 125000 }] }, 201)).data.data;
    const html = (await call(`/admin/quotes/${jpy.public_id}/print`)).text;
    assert.match(html, /125,000/); assert.ok(!html.includes('125,000.00'));
    await call(`/admin/api/quotes/${jpy.public_id}`, 'DELETE', { version: jpy.version });
  });
  await check('Actual R2 backup includes quotation headers, items and frozen snapshots', async () => {
    const r = await call('/admin/api/system/backup', 'POST', { password }); assert.equal(r.data.data.verified, true);
    assert.ok(r.data.data.counts.ops_quotes >= 3); assert.ok(r.data.data.counts.ops_quote_items >= 3);
  });
  await check('Leave only archived local synthetic quotation fixtures', async () => {
    await call(`/admin/api/quotes/${revision.public_id}`, 'DELETE', { version: revision.version });
    await call(`/admin/api/quotes/${issued.public_id}`, 'DELETE', { version: issued.version });
    await call(`/admin/api/opportunities/${opportunity.public_id}`, 'DELETE', { version: opportunity.version });
    await call(`/admin/api/customers/${customer.public_id}`, 'DELETE', { version: customer.version });
  });
} finally {
  const report = { at: new Date().toISOString(), origin, run, runtime: 'actual workerd + local D1 and R2', passed: results.filter(r => r.ok).length, total: results.length, results };
  await mkdir('artifacts/admin-saas-20261103', { recursive: true });
  await writeFile('artifacts/admin-saas-20261103/local-quotes-checks.json', JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report, null, 2));
}
