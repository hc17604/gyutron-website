/** Authenticated Operations API. The /admin router authenticates the principal;
 * this module independently enforces roles, same-origin writes and input bounds.
 * Tenant isolation is the existing per-customer Worker + D1 deployment boundary.
 */
import { getDb } from '../platform/db/client.mjs';
import { rateLimit } from '../platform/security/ratelimit.mjs';
import { workspaceTimeZone } from '../platform/crm/time.mjs';
import {
  RESOURCES, STAGES, CURRENCIES, CUSTOMER_STATUSES, TASK_STATUSES, TASK_PRIORITIES, ACTIVITY_TYPES,
  WorkspaceError, permissionsFor, requirePermission,
} from '../platform/crm/schema.mjs';
import {
  listWorkspaceRecords, getWorkspaceRecord, createWorkspaceRecord, updateWorkspaceRecord, archiveWorkspaceRecord,
  readWorkspaceDashboard, listIntakeRecords, getIntakeRecord, updateIntakeRecord, convertIntakeRecord, exportWorkspaceRecords,
} from '../platform/crm/repository.mjs';

const MAX_BODY_BYTES = 65536;
const READ = new Set(['GET', 'HEAD']);
const HEADERS = Object.freeze({
  'cache-control': 'no-store, private', 'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'same-origin',
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
});

export function workspaceJson(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...HEADERS, 'content-type': 'application/json; charset=utf-8', ...extraHeaders } });
}

export function assertWorkspaceOrigin(request) {
  if (READ.has(request.method)) return;
  const expected = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  if (origin !== expected || ['cross-site', 'none'].includes(request.headers.get('sec-fetch-site'))) throw new WorkspaceError(403, 'INVALID_ORIGIN', 'This action must be submitted from the signed-in workspace.');
}

async function readBody(request) {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) throw new WorkspaceError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send this request as application/json.');
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) throw new WorkspaceError(413, 'PAYLOAD_TOO_LARGE', 'The request is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new WorkspaceError(400, 'INVALID_JSON', 'A JSON request body is required.');
  let size = 0; const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new WorkspaceError(413, 'PAYLOAD_TOO_LARGE', 'The request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch { throw new WorkspaceError(400, 'INVALID_JSON', 'Use a valid JSON object.'); }
}

function publicPrincipal(principal) {
  return { id: principal.id, name: principal.name || '', email: principal.email || '', role: principal.role };
}
export function workspaceBootstrap(env, principal) {
  requirePermission(principal);
  return {
    workspace: { name: String(env.ADMIN_WORKSPACE_NAME || env.DATA_SOURCE_NAME || 'GYUTRON').slice(0, 200), tenancy: 'deployment', timezone: workspaceTimeZone(env) },
    principal: publicPrincipal(principal), permissions: permissionsFor(principal),
    resources: Object.keys(RESOURCES), stages: STAGES, currencies: CURRENCIES,
    currencyMinorUnits: Object.fromEntries(CURRENCIES.map(currency => [currency, currency === 'JPY' ? 0 : 2])),
    statuses: { customers: CUSTOMER_STATUSES, tasks: TASK_STATUSES }, priorities: TASK_PRIORITIES, activityTypes: ACTIVITY_TYPES,
    capabilities: { crm: true, intake: true, quotes: true, quotePrint: true, immutableQuotes: true, versionedWrites: true, softArchive: true, appendOnlyAudit: true, deploymentIsolation: true,
      contacts:true,savedViews:true,boundedBulk:true,commerce:true,dataSources:true,operatingReports:true,calendarAutomations:true,businessRules:true,knowledge:true,modelProviders:true,notifications:true,activeHealthProbes:true,recoveryFiles:true },
  };
}

function methodError(allowed) { return workspaceJson({ error: { code: 'METHOD_NOT_ALLOWED', message: 'This method is not supported for this route.' } }, 405, { allow: allowed.join(', ') }); }

function csvCell(value) {
  let text = value == null ? '' : String(value);
  // Untrusted text must not become a spreadsheet formula, including after leading
  // whitespace/control characters. Numeric values stay numeric in the export.
  if (typeof value !== 'number' && /^[\s\u0000-\u001f]*[=+@-]/u.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
export function workspaceCsv(rows, columns) {
  return '\uFEFF' + [columns.map(csvCell).join(','), ...rows.map(row => columns.map(c => csvCell(row[c])).join(','))].join('\r\n') + '\r\n';
}

/** The principal is provided only by the authenticated /admin server router. */
export async function handleAdminApi(request, env, ctx, url = new URL(request.url), principal) {
  try {
    requirePermission(principal);
    assertWorkspaceOrigin(request);
    const path = url.pathname.replace(/^\/admin\/api\/?/, '').split('/').filter(Boolean);
    const options = { ...Object.fromEntries(url.searchParams.entries()), _timeZone: workspaceTimeZone(env) };
    if (path[0] === 'bootstrap' && path.length === 1) {
      if (request.method !== 'GET') return methodError(['GET']);
      return workspaceJson({ data: workspaceBootstrap(env, principal) });
    }
    const db = getDb(env);
    if (!db) throw new WorkspaceError(503, 'DATABASE_UNAVAILABLE', 'Workspace storage is unavailable. Please try again later.');
    const rl = await rateLimit(env, `workspace:${READ.has(request.method) ? 'read' : 'write'}:${principal.id}`, { limit: READ.has(request.method) ? 240 : 80, windowSeconds: 60 });
    if (!rl.ok) return workspaceJson({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait and try again.' } }, 429, { 'retry-after': String(rl.retryAfter || 60) });
    if (path[0] === 'dashboard' && path.length === 1) {
      if (request.method !== 'GET') return methodError(['GET']);
      return workspaceJson({ data: await readWorkspaceDashboard(db, principal, { timeZone: workspaceTimeZone(env) }) });
    }
    if (path[0] === 'export' && path.length === 1) {
      if (request.method !== 'GET') return methodError(['GET']);
      const resource = options.resource || 'customers';
      const { rows, columns } = await exportWorkspaceRecords(db, resource, options, principal);
      return new Response(workspaceCsv(rows, columns), { headers: { ...HEADERS, 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${resource}-${new Date().toISOString().slice(0, 10)}.csv"`, 'x-export-row-count': String(rows.length) } });
    }
    if (path[0] === 'intake') {
      const resource = path[1] || options.resource || 'leads';
      if (path.length <= 2) {
        if (request.method !== 'GET') return methodError(['GET']);
        return workspaceJson(await listIntakeRecords(db, resource, options, principal));
      }
      if (path.length === 3) {
        const id = decodeURIComponent(path[2]);
        if (request.method === 'GET') return workspaceJson({ data: await getIntakeRecord(db, resource, id, principal) });
        if (request.method === 'PATCH') return workspaceJson({ data: await updateIntakeRecord(db, resource, id, await readBody(request), principal) });
        return methodError(['GET', 'PATCH']);
      }
      if (path.length === 4 && path[3] === 'convert') {
        if (request.method !== 'POST') return methodError(['POST']);
        const result = await convertIntakeRecord(db, resource, decodeURIComponent(path[2]), await readBody(request), principal);
        return workspaceJson(result, result.meta.already_converted ? 200 : 201);
      }
    }
    const resource = path[0];
    if (!Object.prototype.hasOwnProperty.call(RESOURCES, resource)) throw new WorkspaceError(404, 'NOT_FOUND', 'This API route could not be found.');
    if (path.length === 1) {
      if (request.method === 'GET') return workspaceJson(await listWorkspaceRecords(db, resource, options, principal));
      if (request.method === 'POST' && resource !== 'audit') return workspaceJson({ data: await createWorkspaceRecord(db, resource, await readBody(request), principal) }, 201);
      return methodError(resource === 'audit' ? ['GET'] : ['GET', 'POST']);
    }
    const id = decodeURIComponent(path[1]);
    if (path.length === 2) {
      if (request.method === 'GET') return workspaceJson({ data: await getWorkspaceRecord(db, resource, id, principal) });
      if (request.method === 'PATCH') return workspaceJson({ data: await updateWorkspaceRecord(db, resource, id, await readBody(request), principal) });
      if (request.method === 'DELETE') return workspaceJson({ data: await archiveWorkspaceRecord(db, resource, id, await readBody(request), principal) });
      return methodError(resource === 'audit' || resource === 'activities' ? ['GET'] : ['GET', 'PATCH', 'DELETE']);
    }
    if (path.length === 3 && path[2] === 'restore' && resource !== 'audit' && resource !== 'activities') {
      if (request.method !== 'POST') return methodError(['POST']);
      return workspaceJson({ data: await archiveWorkspaceRecord(db, resource, id, await readBody(request), principal, { restore: true }) });
    }
    throw new WorkspaceError(404, 'NOT_FOUND', 'This API route could not be found.');
  } catch (error) {
    if (error instanceof WorkspaceError) return workspaceJson({ error: { code: error.code, message: error.message, ...(error.fields ? { fields: error.fields } : {}) } }, error.status);
    if (error instanceof URIError) return workspaceJson({ error: { code: 'INVALID_PATH', message: 'This record address is invalid.' } }, 400);
    // Never return SQL, bindings, stack traces or customer values to the browser.
    console.error('admin workspace operation failed', error?.name || 'Error');
    return workspaceJson({ error: { code: 'SERVICE_UNAVAILABLE', message: 'The workspace could not complete this request. Refresh the record before retrying.' } }, 503);
  }
}
