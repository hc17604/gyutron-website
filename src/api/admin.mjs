/** GYUTRON Operations authentication and server-side workspace boundary. */
import { renderAdminWorkspace, renderAdminLogin, getAdminAsset } from '../admin/shell.mjs';
import { handleAdminApi, workspaceJson } from './admin-api.mjs';
import { handleAdminTeam } from './admin-team.mjs';
import { handleAdminSystem } from './admin-system.mjs';
import { handleAdminQuotes, handleQuoteDocument } from './admin-quotes.mjs';
import { handleWorkspaceExperience } from './workspace-experience.mjs';
import { handleWorkspaceNotifications } from './workspace-notifications.mjs';
import { handleOperationsApi } from './operations-api.mjs';
import { handleIntelligenceApi } from './intelligence-api.mjs';
import { adminConfigured, verifyPassword } from '../platform/security/admin-auth.mjs';
import {
  randomToken, cookieValue, getWorkspacePrincipal, createWorkspaceSession, revokeWorkspaceSession,
  workspaceCookie, clearWorkspaceCookie, sameOrigin, checkCsrf, allowLoginAttempt, verifyStaffPassword,
} from '../platform/security/workspace-auth.mjs';
import { timingSafeEqual } from '../platform/security/hash.mjs';
import { normalizeWorkspaceLanguage } from '../admin/locale-policy.mjs';

const BUILD = '2026.11.04.22';
const LOGIN_COOKIE = 'gy_workspace_login';
const READ = new Set(['GET', 'HEAD']);
const SECURITY_HEADERS = {
  'cache-control': 'no-store, private', 'x-robots-tag': 'noindex, nofollow',
  'x-content-type-options': 'nosniff', 'referrer-policy': 'same-origin',
  'x-frame-options': 'DENY', 'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'x-gyutron-admin': BUILD,
};
function secured(response, head = false) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) headers.set(key, value);
  return new Response(head ? null : response.body, { status: response.status, headers });
}
function html(body, status = 200, cookies = []) {
  const headers = new Headers({ 'content-type': 'text/html; charset=utf-8' });
  for (const cookie of cookies) headers.append('set-cookie', cookie);
  return new Response(body, { status, headers });
}
function redirect(location, cookies = []) {
  const headers = new Headers({ location });
  for (const cookie of cookies) headers.append('set-cookie', cookie);
  return new Response(null, { status: 303, headers });
}
function fail(status, code, message) { return workspaceJson({ error: { code, message } }, status); }
function langOf(url) { return normalizeWorkspaceLanguage(url.searchParams.get('lang')); }
function loginPage(env, url, secure, error = '', status = 200) {
  const token = randomToken();
  return html(renderAdminLogin({ error, lang: langOf(url), csrfToken: token, configured: adminConfigured(env), teamLogin: env.ADMIN_LOGIN_MODE === 'team' }), status,
    [`${LOGIN_COOKIE}=${token}; Path=/admin; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Strict; Max-Age=900`]);
}
async function boundedText(request, limit = 8192) {
  if (Number(request.headers.get('content-length') || 0) > limit) return null;
  const reader = request.body?.getReader();
  if (!reader) return '';
  let length = 0; const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const buffer = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buffer); } catch { return null; }
}
function loginAudit(db, principal, success) {
  return db.prepare(`INSERT INTO crm_audit (public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(`AUD-${crypto.randomUUID()}`, principal?.id || 'anonymous', principal?.name || 'Unauthenticated',
    principal?.role || 'anonymous', success ? 'login.succeeded' : 'login.failed', 'authentication', principal?.id || 'login',
    success ? 'Workspace sign-in succeeded' : 'Workspace sign-in failed', '{}', new Date().toISOString());
}
async function login(request, env, url, secure) {
  if (!sameOrigin(request)) return fail(403, 'INVALID_ORIGIN', 'Sign in from this workspace.');
  if (!adminConfigured(env) || !env.DB) return loginPage(env, url, secure, 'Workspace access is not configured.', 503);
  if (!(request.headers.get('content-type') || '').startsWith('application/x-www-form-urlencoded')) return fail(415, 'INVALID_FORM', 'Use the workspace sign-in form.');
  const text = await boundedText(request);
  if (text === null) return fail(413, 'PAYLOAD_TOO_LARGE', 'This sign-in request is too large.');
  const form = new URLSearchParams(text), csrf = cookieValue(request, LOGIN_COOKIE);
  if (!csrf || !/^[a-f0-9]{64}$/.test(csrf) || !(await timingSafeEqual(csrf, form.get('csrf_token') || ''))) {
    return loginPage(env, url, secure, 'The sign-in form expired. Please try again.', 403);
  }
  const throttle = await allowLoginAttempt(env.DB, request, env);
  if (!throttle.ok) {
    const response = loginPage(env, url, secure, 'Too many sign-in attempts. Try again in a few minutes.', 429);
    response.headers.set('retry-after', String(throttle.retryAfter)); return response;
  }
  const email = (form.get('email') || '').trim().toLowerCase(), password = form.get('password') || '';
  if (new TextEncoder().encode(password).length > 256 || email.length > 254) return loginPage(env, url, secure, 'Incorrect password.', 401);
  let user = null, ok = false;
  if (!email) ok = await verifyPassword(env, password);
  else {
    user = await env.DB.prepare('SELECT * FROM admin_users WHERE email = ?').bind(email).first();
    const encoded = user?.password_hash || `scrypt$32768$8$3$${'0'.repeat(64)}$${'0'.repeat(128)}`;
    ok = await verifyStaffPassword(password, encoded) && user?.active === 1;
  }
  if (!ok) {
    await loginAudit(env.DB, null, false).run();
    return loginPage(env, url, secure, 'Incorrect password.', 401);
  }
  const principal = user ? { id: user.id, name: user.name, role: user.role } : { id: 'owner', name: 'Workspace owner', role: 'owner' };
  const session = await createWorkspaceSession(env.DB, env, user);
  const operations = [loginAudit(env.DB, principal, true)];
  if (user) operations.push(env.DB.prepare('UPDATE admin_users SET last_login_at = ? WHERE id = ?').bind(new Date().toISOString(), user.id));
  await env.DB.batch(operations);
  const lang = normalizeWorkspaceLanguage(form.get('lang'));
  return redirect(`/admin${lang !== 'en' ? `?lang=${lang}` : ''}`, [workspaceCookie(session.token, secure),
    `${LOGIN_COOKIE}=; Path=/admin; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Strict; Max-Age=0`]);
}
async function route(request, env, ctx, url) {
  const secure = url.protocol === 'https:', path = url.pathname.replace(/\/+$/, '') || '/';
  if (path.startsWith('/admin/assets/')) {
    if (!READ.has(request.method)) return fail(405, 'METHOD_NOT_ALLOWED', 'This asset is read-only.');
    return getAdminAsset(path) || fail(404, 'NOT_FOUND', 'This asset does not exist.');
  }
  if (path === '/admin/auth/login' || path === '/admin/login') {
    if (request.method === 'POST') return login(request, env, url, secure);
    if (READ.has(request.method)) return redirect(`/admin${langOf(url) === 'en' ? '' : `?lang=${langOf(url)}`}`);
    return fail(405, 'METHOD_NOT_ALLOWED', 'Use the sign-in form.');
  }
  const principal = await getWorkspacePrincipal(request, env, env.DB);
  if (!principal) {
    if (path.startsWith('/admin/api/')) return fail(401, 'UNAUTHENTICATED', 'Your session ended. Sign in to continue.');
    if (!READ.has(request.method)) return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.');
    return loginPage(env, url, secure);
  }
  if (!READ.has(request.method)) {
    if (!sameOrigin(request)) return fail(403, 'INVALID_ORIGIN', 'Submit this action from the workspace.');
    let csrf = request.headers.get('x-csrf-token');
    if (!csrf && (request.headers.get('content-type') || '').startsWith('application/x-www-form-urlencoded')) {
      const text = await boundedText(request, /^\/admin\/order-intents\//.test(path) ? 65536 : 8192);
      if (text === null) return fail(413, 'PAYLOAD_TOO_LARGE', 'This request is too large.');
      csrf = new URLSearchParams(text).get('csrf_token');
      request = new Request(request, { body: text });
    }
    if (!(await checkCsrf(request, principal, csrf))) return fail(403, 'INVALID_CSRF', 'This form expired. Reload the workspace and try again.');
  }
  if (path === '/admin/logout') {
    if (request.method !== 'POST') return fail(405, 'METHOD_NOT_ALLOWED', 'Use Sign out in the workspace.');
    await revokeWorkspaceSession(env.DB, request);
    return redirect('/admin', [clearWorkspaceCookie(secure)]);
  }
  if (path === '/admin/api/team' || path.startsWith('/admin/api/team/')) return handleAdminTeam(request, env, principal, url);
  if (path === '/admin/api/system' || path.startsWith('/admin/api/system/')) return handleAdminSystem(request, env, principal, BUILD);
  if (path === '/admin/api/quotes' || path.startsWith('/admin/api/quotes/')) return handleAdminQuotes(request, env, ctx, url, principal);
  if (path === '/admin/api/workspace/notifications' || path.startsWith('/admin/api/workspace/notifications/')) return handleWorkspaceNotifications(request, env, principal, url);
  if (path === '/admin/api/workspace' || path.startsWith('/admin/api/workspace/')) return handleWorkspaceExperience(request, env, principal, url);
  if (path === '/admin/api/operations' || path.startsWith('/admin/api/operations/')) return handleOperationsApi(request, env, principal, url);
  if (path === '/admin/api/intelligence' || path.startsWith('/admin/api/intelligence/')) return handleIntelligenceApi(request, env, principal, url, { version: BUILD });
  if (path.startsWith('/admin/quotes/')) return handleQuoteDocument(request, env, ctx, url, principal);
  if (path === '/admin/api/assignees') {
    if (request.method !== 'GET') return fail(405, 'METHOD_NOT_ALLOWED', 'This directory is read-only.');
    const result = await env.DB.prepare('SELECT id,name FROM admin_users WHERE active = 1 ORDER BY name LIMIT 500').all();
    return workspaceJson({ data: [{ id: 'owner', name: 'Workspace owner' }, ...(result.results || [])] });
  }
  if (path.startsWith('/admin/api/')) return handleAdminApi(request, env, ctx, url, principal);
  if (/^\/admin\/(order-intents|events)(\.csv|\/|$)/.test(path) || path === '/admin/legacy.css') {
    const { handleLegacyAdmin } = await import('./admin-legacy.mjs');
    return handleLegacyAdmin(request, env, ctx, url, principal);
  }
  const old = { leads: 'leads', rfqs: 'rfqs', support: 'support', downloads: 'downloads' };
  const resource = path.split('/')[2];
  if (Object.hasOwn(old, resource)) {
    if (!READ.has(request.method)) return fail(405, 'METHOD_NOT_ALLOWED', 'Use the workspace record editor.');
    return redirect(`/admin#inbox?resource=${old[resource]}`);
  }
  if (path === '/admin' && READ.has(request.method)) {
    const publicPrincipal = { id: principal.id, name: principal.name, email: principal.email, role: principal.role, expiresAt: principal.expiresAt };
    return html(renderAdminWorkspace({ principal: publicPrincipal, csrfToken: principal.csrfToken, lang: langOf(url),
      workspaceName: String(env.ADMIN_WORKSPACE_NAME || env.DATA_SOURCE_NAME || 'GYUTRON').slice(0, 200) }));
  }
  return fail(404, 'NOT_FOUND', 'This workspace route does not exist.');
}
export async function handleAdmin(request, env, ctx, url = new URL(request.url)) {
  try { return secured(await route(request, env, ctx, url), request.method === 'HEAD'); }
  catch (error) {
    console.error('workspace request failed', error?.name || 'Error');
    return secured(fail(503, 'SERVICE_UNAVAILABLE', 'The workspace is temporarily unavailable. Please try again shortly.'), request.method === 'HEAD');
  }
}
