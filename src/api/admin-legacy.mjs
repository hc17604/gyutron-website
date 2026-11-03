/** Retained operational views for storefront order requests and event history.
 * Authenticated only through the new workspace principal. No legacy cookie path.
 */
import { STATUS_VALUES } from '../platform/schemas.mjs';
import { checkCsrf } from '../platform/security/workspace-auth.mjs';
import { workspaceCsv } from './admin-api.mjs';

const ORDER_COLUMNS = Object.freeze([
  'public_id', 'request_type', 'contact_name', 'contact_department', 'company', 'email', 'phone',
  'shipping_recipient', 'shipping_company', 'shipping_phone', 'shipping_address_line1', 'shipping_address_line2',
  'shipping_city', 'shipping_region', 'shipping_postal_code', 'shipping_country', 'billing_same_as_shipping',
  'billing_recipient', 'billing_company', 'billing_phone', 'billing_address_line1', 'billing_address_line2',
  'billing_city', 'billing_region', 'billing_postal_code', 'billing_country', 'procurement_project_name',
  'procurement_purchase_order', 'procurement_tax_id', 'procurement_invoice_info', 'procurement_notes',
  'item_count', 'source_page', 'locale', 'status', 'internal_note', 'created_at', 'updated_at',
]);
const EVENT_COLUMNS = Object.freeze(['event_id', 'event_type', 'entity_type', 'entity_id', 'source', 'payload_json', 'created_at']);
const TABLES = Object.freeze({ 'order-intents': { table: 'order_intents', columns: ORDER_COLUMNS, id: 'public_id', label: 'Order requests' }, events: { table: 'events', columns: EVENT_COLUMNS, id: 'event_id', label: 'Event history' } });
const MAX_FORM_BYTES = 65536;
const HEADERS = { 'cache-control': 'no-store, private', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'same-origin', 'content-security-policy': "default-src 'none'; style-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" };
class LegacyError extends Error { constructor(status, message) { super(message); this.status = status; } }
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const label = key => key.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const short = value => { const text = String(value ?? ''); return text.length > 100 ? `${text.slice(0, 97)}…` : text; };
function html(body, status = 200) { return new Response(body, { status, headers: { ...HEADERS, 'content-type': 'text/html; charset=utf-8' } }); }
function page(title, body) { return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)} · GYUTRON Operations</title><link rel="stylesheet" href="/brand-tokens.css"><link rel="stylesheet" href="/admin/legacy.css"></head><body><a class="skip" href="#content">Skip to content</a><header><a class="brand" href="/admin#overview">GYUTRON <span>OPERATIONS</span></a><nav aria-label="Operational sections"><a href="/admin#inbox">Workspace</a><a href="/admin/order-intents">Order requests</a><a href="/admin/events">Event history</a></nav></header><main id="content"><a class="back" href="/admin#overview">← Workspace overview</a><h1>${esc(title)}</h1>${body}</main></body></html>`; }
function status(value) { return `<span class="status">${esc(String(value || '').replaceAll('_', ' '))}</span>`; }
function queryFilters(resource, url) {
  const where = [], binds = [];
  const filter = url.searchParams.get('status') || '';
  if (filter && resource === 'order-intents') {
    if (!STATUS_VALUES.order_intents.includes(filter)) throw new LegacyError(422, 'Choose a supported order status.');
    where.push('status = ?'); binds.push(filter);
  }
  const since = url.searchParams.get('since');
  if (since) {
    if (since.length > 40 || !Number.isFinite(Date.parse(since))) throw new LegacyError(422, 'Use a valid date for the since filter.');
    where.push('created_at >= ?'); binds.push(new Date(since).toISOString());
  }
  return { where, binds, filter, since };
}
function positiveInteger(value, fallback, maximum) {
  if (!value) return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > maximum) throw new LegacyError(422, 'Use a valid positive page number.');
  return number;
}
function makeUrl(resource, params) { const qs = new URLSearchParams(); for (const [key, value] of Object.entries(params)) if (value) qs.set(key, String(value)); return `/admin/${resource}${qs.size ? `?${qs}` : ''}`; }
async function listView(db, resource, url) {
  const spec = TABLES[resource], filters = queryFilters(resource, url), pageNumber = positiveInteger(url.searchParams.get('page'), 1, 100000), limit = 50;
  const cursor = url.searchParams.get('cursor');
  if (cursor) { filters.where.push('id > ?'); filters.binds.push(positiveInteger(cursor, 1, Number.MAX_SAFE_INTEGER)); }
  const where = filters.where.length ? ` WHERE ${filters.where.join(' AND ')}` : '';
  const total = Number((await db.prepare(`SELECT COUNT(*) AS total FROM ${spec.table}${where}`).bind(...filters.binds).first())?.total || 0);
  const columns = resource === 'order-intents' ? ['public_id', 'created_at', 'company', 'contact_name', 'email', 'request_type', 'item_count', 'status'] : ['event_id', 'created_at', 'event_type', 'entity_type', 'entity_id'];
  const result = await db.prepare(`SELECT ${columns.join(', ')} FROM ${spec.table}${where} ORDER BY id ${cursor ? 'ASC' : 'DESC'} LIMIT ? OFFSET ?`).bind(...filters.binds, limit, (pageNumber - 1) * limit).all();
  const rows = result.results || [];
  const csv = makeUrl(`${resource}.csv`, { status: filters.filter, since: filters.since });
  const filterForm = resource === 'order-intents' ? `<form method="get" class="filters"><label>Status<select name="status"><option value="">All statuses</option>${STATUS_VALUES.order_intents.map(value => `<option value="${esc(value)}"${value === filters.filter ? ' selected' : ''}>${esc(value.replaceAll('_', ' '))}</option>`).join('')}</select></label>${filters.since ? `<input type="hidden" name="since" value="${esc(filters.since)}">` : ''}<button type="submit">Apply filter</button></form>` : '';
  const table = rows.length ? `<div class="table-scroll" role="region" aria-label="${esc(spec.label)}" tabindex="0"><table><thead><tr>${columns.map(column => `<th scope="col">${esc(label(column))}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${columns.map(column => `<td>${column === spec.id ? `<a href="/admin/${resource}/${encodeURIComponent(row[column])}">${esc(short(row[column]))}</a>` : column === 'status' ? status(row[column]) : esc(short(row[column]))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<div class="empty">No records match these filters.</div>';
  const pages = Math.ceil(total / limit), navParams = { status: filters.filter, since: filters.since, cursor };
  return html(page(spec.label, `<p class="intro">${resource === 'order-intents' ? 'Review purchasing requests and requested configurations. These are requests for review; no payment or stock reservation is implied.' : 'Read the operational event stream. Event records cannot be edited in this workspace.'}</p><div class="toolbar">${filterForm}<a class="button secondary" href="${esc(csv)}">Export CSV</a></div><p class="meta">${total} record${total === 1 ? '' : 's'}${total ? ` · Page ${pageNumber} of ${pages}` : ''}</p>${table}<nav class="pagination" aria-label="Pagination">${pageNumber > 1 ? `<a class="button secondary" href="${esc(makeUrl(resource, { ...navParams, page: pageNumber - 1 }))}">Previous</a>` : ''}${pageNumber < pages ? `<a class="button" href="${esc(makeUrl(resource, { ...navParams, page: pageNumber + 1 }))}">Next</a>` : ''}</nav>`));
}
async function findRecord(db, resource, id) {
  const spec = TABLES[resource];
  const row = await db.prepare(`SELECT ${spec.columns.join(', ')} FROM ${spec.table} WHERE ${spec.id} = ? LIMIT 1`).bind(id).first();
  if (!row) throw new LegacyError(404, 'This record could not be found.');
  return row;
}
function configuration(value) {
  if (!value) return '<span class="muted">No configuration</span>';
  try { return `<pre>${esc(JSON.stringify(JSON.parse(value), null, 2))}</pre>`; }
  catch { return `<pre>${esc(value)}</pre>`; }
}
async function detailView(db, resource, id, principal, url) {
  const row = await findRecord(db, resource, id), spec = TABLES[resource];
  const fields = spec.columns.filter(column => !['internal_note', 'payload_json'].includes(column)).map(column => `<div class="field"><dt>${esc(label(column))}</dt><dd>${column === 'status' ? status(row[column]) : esc(row[column] ?? '—')}</dd></div>`).join('');
  let items = '', actions = '';
  if (resource === 'order-intents') {
    const result = await db.prepare('SELECT line_number, sku, quantity, configuration_json FROM order_intent_items WHERE order_intent_id = (SELECT id FROM order_intents WHERE public_id = ?) ORDER BY line_number ASC').bind(id).all();
    items = `<section><h2>Requested items</h2><div class="table-scroll" role="region" aria-label="Requested items" tabindex="0"><table><thead><tr><th scope="col">Line</th><th scope="col">SKU</th><th scope="col">Quantity</th><th scope="col">Configuration</th></tr></thead><tbody>${(result.results || []).map(item => `<tr><td>${esc(item.line_number)}</td><td>${esc(item.sku)}</td><td>${esc(item.quantity)}</td><td>${configuration(item.configuration_json)}</td></tr>`).join('') || '<tr><td colspan="4">No item rows are available.</td></tr>'}</tbody></table></div></section>`;
    actions = `<section><h2>Review request</h2><form method="post" action="/admin/order-intents/${encodeURIComponent(id)}" class="review"><input type="hidden" name="csrf_token" value="${esc(principal.csrfToken)}"><input type="hidden" name="updated_at" value="${esc(row.updated_at)}"><label>Status<select name="status">${STATUS_VALUES.order_intents.map(value => `<option value="${esc(value)}"${row.status === value ? ' selected' : ''}>${esc(value.replaceAll('_', ' '))}</option>`).join('')}</select></label><label>Internal note<textarea name="internal_note" rows="5" maxlength="5000">${esc(row.internal_note)}</textarea></label><p class="muted">Changes are version checked and recorded in the audit trail.</p><div class="actions"><button type="submit" name="action" value="save">Save review</button><button type="submit" name="action" value="spam" class="secondary">Mark spam</button></div></form></section>`;
  } else items = `<section><h2>Event payload</h2>${configuration(row.payload_json)}</section>`;
  return html(page(`${spec.label} · ${id}`, `<a href="/admin/${resource}">← ${esc(spec.label)}</a>${url.searchParams.get('saved') === '1' ? '<p role="status" class="success">Review saved.</p>' : ''}<dl class="details">${fields}</dl>${items}${actions}`));
}
async function formBody(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/x-www-form-urlencoded')) throw new LegacyError(415, 'Submit this review using the workspace form.');
  if (Number(request.headers.get('content-length') || 0) > MAX_FORM_BYTES) throw new LegacyError(413, 'This review exceeds the 64 KB request limit. Shorten the internal note.');
  const reader = request.body?.getReader(); if (!reader) throw new LegacyError(400, 'A review form is required.');
  const chunks = []; let size = 0;
  try { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > MAX_FORM_BYTES) { await reader.cancel(); throw new LegacyError(413, 'This review exceeds the 64 KB request limit. Shorten the internal note.'); } chunks.push(part.value); } }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return new URLSearchParams(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new LegacyError(400, 'The review form could not be read.'); }
}
async function saveReview(request, db, id, principal) {
  const form = await formBody(request);
  if (!(await checkCsrf(request, principal, form.get('csrf_token')))) throw new LegacyError(403, 'This review must be submitted from your signed-in workspace. Reload the page and try again.');
  try {
  const allowed = ['csrf_token', 'updated_at', 'status', 'internal_note', 'action'];
  if ([...form.keys()].some(key => !allowed.includes(key) || form.getAll(key).length !== 1)) throw new LegacyError(422, 'This review contains unsupported or duplicate fields. Reload the form.');
  const action = form.get('action');
  if (!['save', 'spam'].includes(action)) throw new LegacyError(422, 'Choose a supported review action.');
  const nextStatus = action === 'spam' ? 'spam' : form.get('status'), note = form.get('internal_note') || '', expected = form.get('updated_at');
  if (!STATUS_VALUES.order_intents.includes(nextStatus) || note.length > 5000 || !expected || expected.length > 40) throw new LegacyError(422, 'Check the status and internal note, then reload the record if necessary.');
  const existing = await findRecord(db, 'order-intents', id), stamp = new Date().toISOString();
  const updatedAt = stamp > existing.updated_at ? stamp : new Date(Date.parse(existing.updated_at) + 1).toISOString();
  const changed = nextStatus !== existing.status;
  const results = await db.batch([
    db.prepare('UPDATE order_intents SET status = ?, internal_note = ?, updated_at = ? WHERE public_id = ? AND updated_at = ?').bind(nextStatus, note.trim(), updatedAt, id, expected),
    db.prepare('INSERT INTO crm_audit (public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at) SELECT ?,?,?,?,?,?,?,?,?,? WHERE changes() = 1').bind(`AUD-${crypto.randomUUID()}`, principal.id, principal.name || principal.id, principal.role, 'updated', 'order_intent', id, 'Reviewed order request', JSON.stringify({ previous_status: existing.status, status: nextStatus, fields: ['status', 'internal_note'] }), updatedAt),
    db.prepare('INSERT INTO events (event_id,event_type,entity_type,entity_id,source,payload_json,created_at) SELECT ?,?,?,?,?,?,? WHERE changes() = 1').bind(`EVT-${crypto.randomUUID()}`, `order_intent.${changed ? 'status_changed' : 'updated'}`, 'order_intent', id, 'gyutron-admin', JSON.stringify({ ...(changed ? { old_status: existing.status, new_status: nextStatus } : { changed_fields: ['internal_note'] }), actor_id: principal.id, source: 'admin' }), updatedAt),
  ]);
  if (results.some(result => result.success === false)) throw new LegacyError(503, 'This review could not be saved. Refresh the record before retrying.');
  if (Number(results[0]?.meta?.changes) !== 1) throw new LegacyError(409, 'This request changed in another session. Reload its detail page before saving again.');
  return new Response(null, { status: 303, headers: { ...HEADERS, location: `/admin/order-intents/${encodeURIComponent(id)}?saved=1` } });
  } catch (error) {
    if (error && typeof error === 'object' && form.has('internal_note')) error.submittedNote = form.get('internal_note');
    throw error;
  }
}
async function exportCsv(db, resource, url, principal) {
  const spec = TABLES[resource], filters = queryFilters(resource, url), where = filters.where.length ? ` WHERE ${filters.where.join(' AND ')}` : '';
  const result = await db.prepare(`SELECT ${spec.columns.join(', ')} FROM ${spec.table}${where} ORDER BY id DESC LIMIT 10001`).bind(...filters.binds).all();
  const rows = result.results || [];
  if (rows.length > 10000) throw new LegacyError(422, 'This export exceeds 10000 rows. Apply a status or since filter and export again.');
  const audited = await db.batch([db.prepare('INSERT INTO crm_audit (public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(`AUD-${crypto.randomUUID()}`, principal.id, principal.name || principal.id, principal.role, 'exported', resource, 'collection', `Exported ${spec.label.toLowerCase()}`, JSON.stringify({ rows: rows.length, status_filter: filters.filter || null }), new Date().toISOString())]);
  if (audited.some(item => item.success === false)) throw new LegacyError(503, 'This export could not be audited. Please try again.');
  return new Response(workspaceCsv(rows, spec.columns), { headers: { ...HEADERS, 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${resource}-${new Date().toISOString().slice(0, 10)}.csv"`, 'x-export-row-count': String(rows.length) } });
}

export async function handleLegacyAdmin(request, env, ctx, url = new URL(request.url), principal) {
  try {
    if (!principal || !['owner', 'manager'].includes(principal.role)) throw new LegacyError(principal ? 403 : 401, 'Only the workspace owner or a manager can access this operational section.');
    if (url.pathname === '/admin/legacy.css') {
      if (request.method !== 'GET') throw new LegacyError(405, 'Use GET to read this stylesheet.');
      return new Response(STYLE, { headers: { ...HEADERS, 'content-type': 'text/css; charset=utf-8' } });
    }
    if (!env.DB) throw new LegacyError(503, 'Operational storage is unavailable. Please try again later.');
    const parts = url.pathname.replace(/^\/admin\//, '').split('/').filter(Boolean);
    let resource = parts[0], isCsv = false;
    if (resource?.endsWith('.csv')) { resource = resource.slice(0, -4); isCsv = true; }
    if (!Object.prototype.hasOwnProperty.call(TABLES, resource) || parts.length > 2 || (isCsv && parts.length > 1)) throw new LegacyError(404, 'This operational section could not be found.');
    if (!['GET', 'POST'].includes(request.method)) throw new LegacyError(405, 'Use a supported operational action.');
    if (request.method === 'POST') {
      if (isCsv || resource !== 'order-intents' || !parts[1]) throw new LegacyError(405, 'This operational section is read-only.');
      return await saveReview(request, env.DB, decodeURIComponent(parts[1]), principal);
    }
    if (isCsv) return await exportCsv(env.DB, resource, url, principal);
    if (parts[1]) return await detailView(env.DB, resource, decodeURIComponent(parts[1]), principal, url);
    return await listView(env.DB, resource, url);
  } catch (error) {
    if (!(error instanceof LegacyError) && !(error instanceof URIError)) console.error('legacy operational view failed', error?.name || 'Error');
    const code = error instanceof LegacyError ? error.status : error instanceof URIError ? 400 : 503;
    const recovery = typeof error.submittedNote === 'string' ? `<section><h2>Your submitted note</h2><p>Your changes have not been saved. Copy the note below before opening the latest record in a new tab.</p><label>Preserved internal note<textarea class="recovery-note" rows="8" readonly>${esc(error.submittedNote)}</textarea></label></section><p><a href="${esc(url.pathname)}" target="_blank" rel="noopener">Open the latest record in a new tab ↗</a></p>` : `<p><a href="${esc(url.pathname)}">Reload this page</a></p>`;
    return html(page('Request could not be completed', `<div class="error" role="alert">${esc(error instanceof LegacyError ? error.message : error instanceof URIError ? 'This record address is invalid.' : 'Operational storage could not complete this request. Refresh the record before retrying.')}</div>${recovery}`), code);
  }
}

const STYLE = `
:root{--ink:#17191c;--muted:#697078;--line:#dce0e3;--bg:#f3f4f5}*{box-sizing:border-box;border-radius:0}body{margin:0;font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:var(--ink);background:var(--bg)}a{color:var(--button-purple-deep);text-decoration:none}a:hover{text-decoration:underline}header{min-height:76px;background:#17191c;color:#fff;padding:20px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px}header a{color:#fff}.brand{font-size:22px;letter-spacing:.08em;font-weight:800}.brand span{font-size:10px;color:#b8bcc1;letter-spacing:.18em;margin-left:12px}header nav{display:flex;flex-wrap:wrap;gap:22px;font-size:12px}main{max-width:1440px;margin:0 auto;padding:32px 32px 80px}h1{font-size:28px;line-height:1.25;margin:16px 0;overflow-wrap:anywhere}h2{font-size:18px;margin:30px 0 14px}.intro{max-width:760px;color:var(--muted)}.back{font-size:12px}.toolbar{display:flex;align-items:flex-end;gap:16px;justify-content:space-between;margin:28px 0 18px}.filters{display:flex;align-items:flex-end;gap:12px}.button,button{display:inline-block;border:1px solid var(--button-purple-deep);background:var(--button-purple-deep);color:#fff;padding:10px 18px;font:600 12px/1.5 inherit;cursor:pointer;min-height:42px;text-decoration:none}.button:hover,button:hover{text-decoration:none;filter:brightness(.95)}.secondary{background:#fff;color:var(--button-purple-deep);border-color:#c7cbd0}label{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:600}select,textarea{background:#fff;border:1px solid #bfc5ca;padding:10px 12px;font:14px/1.5 inherit;color:var(--ink);min-height:42px}textarea{resize:vertical}.meta,.muted{color:var(--muted);font-size:12px}.table-scroll{overflow:auto;border:1px solid var(--line);background:#fff}table{width:100%;border-collapse:collapse;font-size:12px;min-width:650px}th,td{text-align:left;padding:13px 15px;border-bottom:1px solid var(--line);vertical-align:top}th{background:#e9ecee;color:#525a63;font-size:10px;letter-spacing:.05em;text-transform:uppercase}td{max-width:400px;overflow-wrap:anywhere}tr:last-child td{border-bottom:0}.status{display:inline-block;border:1px solid #c9bddf;background:var(--button-purple-light);color:var(--button-purple-deep);padding:3px 7px;font-size:10px;white-space:nowrap}.empty{border:1px solid var(--line);padding:48px 24px;text-align:center;background:#fff;color:var(--muted)}.pagination,.actions{display:flex;gap:12px;margin-top:20px}.details{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);margin-top:26px}.field{min-width:0;background:#fff;padding:16px}.field dt{font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}.field dd{margin:6px 0 0;overflow-wrap:anywhere;white-space:pre-wrap}.review{max-width:680px;background:#fff;border:1px solid var(--line);padding:24px;display:grid;gap:18px}.error,.success{padding:18px 20px;border-left:3px solid var(--button-purple-deep);background:#fff;overflow-wrap:anywhere}.success{background:var(--button-purple-light)}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;margin:0;max-width:100%}section>pre{border:1px solid var(--line);background:#fff;padding:20px}:focus-visible{outline:2px solid var(--button-purple-deep);outline-offset:3px}.skip{position:fixed;top:-100px;left:16px;padding:12px;background:#fff;z-index:10}.skip:focus{top:12px}@media(max-width:900px){.details{grid-template-columns:repeat(2,minmax(0,1fr))}header{align-items:flex-start;flex-direction:column;padding:20px}main{padding:24px 20px 60px}}@media(max-width:480px){h1{font-size:22px}.details{grid-template-columns:minmax(0,1fr)}.toolbar,.filters{align-items:stretch;flex-direction:column}.actions{flex-wrap:wrap}main{padding:22px 16px 60px}.review{padding:18px}.brand span{display:block;margin:4px 0 0}.button,button{min-height:44px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
.button,button{font-family:inherit;font-size:12px;line-height:1.5;font-weight:600}select,textarea{font-family:inherit;font-size:14px;line-height:1.5}
.recovery-note{width:100%;max-width:800px}
`;
