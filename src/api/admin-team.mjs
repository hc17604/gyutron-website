/** Owner-managed staff directory. No self-service privilege escalation or password disclosure. */
import { hashStaffPassword, validPassword } from '../platform/security/workspace-auth.mjs';

const ROLES = ['manager', 'sales', 'viewer'];
const COLUMNS = 'id,name,email,role,active,version,created_at,updated_at,last_login_at';
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: {
  'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
} });
const error = (status, code, message, fields) => json({ error: { code, message, ...(fields ? { fields } : {}) } }, status);

function audit(db, principal, action, id, metadata = {}, conditional = false) {
  return db.prepare(`INSERT INTO crm_audit (public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at)
    SELECT ?,?,?,?,?,?,?,?,?,?${conditional ? ' WHERE changes() = 1' : ''}`).bind(
    `AUD-${crypto.randomUUID()}`, principal.id, principal.name, principal.role, action, 'team', id,
    `Team member ${action}`, JSON.stringify(metadata), new Date().toISOString(),
  );
}

function parseFields(input, partial) {
  const fields = {}, clean = {};
  const allowed = new Set(partial ? ['version', 'name', 'role', 'active'] : ['name', 'email', 'password', 'role']);
  for (const key of Object.keys(input)) if (!allowed.has(key)) fields[key] = 'This field cannot be changed.';
  if (!partial || Object.hasOwn(input, 'name')) {
    if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 120) fields.name = 'Enter a name of 1–120 characters.';
    else clean.name = input.name.trim();
  }
  if (!partial) {
    if (typeof input.email !== 'string' || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) fields.email = 'Enter a valid work email.';
    else clean.email = input.email.trim().toLowerCase();
    if (!validPassword(input.password)) fields.password = 'Use at least 12 characters and at most 256 UTF-8 bytes.';
  }
  if (!partial || Object.hasOwn(input, 'role')) {
    if (!ROLES.includes(input.role)) fields.role = 'Choose manager, sales or viewer.';
    else clean.role = input.role;
  }
  if (Object.hasOwn(input, 'active')) {
    if (![true, false, 0, 1].includes(input.active)) fields.active = 'Choose enabled or disabled.';
    else clean.active = Number(input.active);
  }
  if (partial && (!Number.isInteger(input.version) || input.version < 1)) fields.version = 'Reload this member before saving.';
  return { fields, clean };
}

async function bodyOf(request) {
  if (!request.headers.get('content-type')?.includes('application/json')) return null;
  if (Number(request.headers.get('content-length') || 0) > 8192) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let length = 0; const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 8192) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return null; }
  try { const body = JSON.parse(text); return body && typeof body === 'object' && !Array.isArray(body) ? body : null; }
  catch { return null; }
}

export async function handleAdminTeam(request, env, principal, url) {
  if (principal.role !== 'owner') return error(403, 'FORBIDDEN', 'Only the workspace owner can manage team access.');
  const db = env.DB;
  const parts = url.pathname.slice('/admin/api/team'.length).split('/').filter(Boolean);
  if (parts.length > 2) return error(404, 'NOT_FOUND', 'This endpoint does not exist.');
  const [id, action] = parts;
  if (request.method === 'GET' && !id) {
    const result = await db.prepare(`SELECT ${COLUMNS} FROM admin_users ORDER BY created_at DESC LIMIT 501`).all();
    const rows = result.results || [];
    return json({ data: rows.slice(0, 500), meta: { total: rows.length, limit: 500, truncated: rows.length > 500 } });
  }
  if (!['POST', 'PATCH'].includes(request.method)) return error(405, 'METHOD_NOT_ALLOWED', 'Use a supported team action.');
  const input = await bodyOf(request);
  if (!input) return error(400, 'INVALID_BODY', 'Submit a JSON object smaller than 8 KB.');
  if (!id && request.method === 'POST') {
    const { fields, clean } = parseFields(input, false);
    if (Object.keys(fields).length) return error(422, 'VALIDATION_ERROR', 'Check the highlighted fields.', fields);
    const exists = await db.prepare('SELECT id FROM admin_users WHERE email = ?').bind(clean.email).first();
    if (exists) return error(409, 'EMAIL_EXISTS', 'This email already has a team account.', { email: 'Use a different email or update the existing account.' });
    const teamCount = await db.prepare('SELECT COUNT(*) AS total FROM admin_users').first();
    if (teamCount.total >= 500) return error(422, 'TEAM_LIMIT', 'This workspace supports up to 500 staff accounts.');
    const memberId = `USR-${crypto.randomUUID()}`, now = new Date().toISOString();
    const passwordHash = await hashStaffPassword(input.password);
    try {
      await db.batch([
        db.prepare('INSERT INTO admin_users (id,name,email,role,password_hash,active,version,created_at,updated_at) SELECT ?,?,?,?,?,1,1,?,? WHERE (SELECT COUNT(*) FROM admin_users) < 500')
          .bind(memberId, clean.name, clean.email, clean.role, passwordHash, now, now),
        audit(db, principal, 'created', memberId, { role: clean.role }, true),
      ]);
    } catch (e) {
      if (/UNIQUE constraint failed: admin_users.email/.test(e.message || '')) return error(409, 'EMAIL_EXISTS', 'This email already has a team account.');
      throw e;
    }
    const created = await db.prepare(`SELECT ${COLUMNS} FROM admin_users WHERE id = ?`).bind(memberId).first();
    if (!created) return error(422, 'TEAM_LIMIT', 'This workspace supports up to 500 staff accounts.');
    return json({ data: created }, 201);
  }
  if (!id) return error(405, 'METHOD_NOT_ALLOWED', 'Choose a team member.');
  const before = await db.prepare(`SELECT ${COLUMNS} FROM admin_users WHERE id = ?`).bind(id).first();
  if (!before) return error(404, 'NOT_FOUND', 'This team member could not be found.');
  let clean, fields;
  if (action === 'password' && request.method === 'POST') {
    fields = {};
    if (Object.keys(input).some(k => !['version', 'password'].includes(k))) fields.body = 'Only password and version are accepted.';
    if (!validPassword(input.password)) fields.password = 'Use at least 12 characters and at most 256 UTF-8 bytes.';
    if (!Number.isInteger(input.version) || input.version < 1) fields.version = 'Reload this member before saving.';
    if (Object.keys(fields).length) return error(422, 'VALIDATION_ERROR', 'Check the highlighted fields.', fields);
    clean = { password_hash: await hashStaffPassword(input.password) };
  } else if (!action && request.method === 'PATCH') {
    ({ fields, clean } = parseFields(input, true));
    if (!Object.keys(clean).length) fields.body = 'Choose at least one change.';
    if (Object.keys(fields).length) return error(422, 'VALIDATION_ERROR', 'Check the highlighted fields.', fields);
  } else return error(404, 'NOT_FOUND', 'This endpoint does not exist.');
  const now = new Date().toISOString(), columns = Object.keys(clean);
  const results = await db.batch([
    db.prepare(`UPDATE admin_users SET ${columns.map(k => `${k} = ?`).join(', ')},version = version + 1,updated_at = ? WHERE id = ? AND version = ?`)
      .bind(...columns.map(k => clean[k]), now, id, input.version),
    audit(db, principal, action === 'password' ? 'password_reset' : 'updated', id,
      { fields: columns.filter(k => k !== 'password_hash'), previous_version: input.version }, true),
    db.prepare('DELETE FROM admin_sessions WHERE user_id = ? AND changes() = 1').bind(id),
  ]);
  if (Number(results[0]?.meta?.changes) !== 1) return error(409, 'VERSION_CONFLICT', 'This member changed in another session. Reload before saving.');
  return json({ data: await db.prepare(`SELECT ${COLUMNS} FROM admin_users WHERE id = ?`).bind(id).first() });
}
