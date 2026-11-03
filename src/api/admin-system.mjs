/** Operational metadata only. Raw backups, hashes and secrets are never served by the workspace. */
import { workspaceJson } from './admin-api.mjs';
import { workspaceTimeZone } from '../platform/crm/time.mjs';
import { SESSION_TTL_SECONDS } from '../platform/security/workspace-auth.mjs';
import { verifyPassword } from '../platform/security/admin-auth.mjs';
import { rateLimit } from '../platform/security/ratelimit.mjs';
import { runBackup } from './backup.mjs';

async function readPassword(request) {
  if (!(request.headers.get('content-type') || '').startsWith('application/json')) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let length = 0; const chunks = [];
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > 2048) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    return input && Object.keys(input).length === 1 && typeof input.password === 'string' && new TextEncoder().encode(input.password).length <= 256 ? input.password : null;
  } catch { return null; }
}

export async function handleAdminSystem(request, env, principal, version) {
  if (!['owner', 'manager'].includes(principal.role)) return workspaceJson({ error: { code: 'FORBIDDEN', message: 'Your role cannot inspect workspace operations.' } }, 403);
  if (new URL(request.url).pathname.endsWith('/backup')) {
    if (principal.role !== 'owner') return workspaceJson({ error: { code: 'FORBIDDEN', message: 'Only the workspace owner can run a manual backup.' } }, 403);
    if (request.method !== 'POST') return workspaceJson({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use the backup confirmation form.' } }, 405);
    const throttle = await rateLimit(env, 'workspace-manual-backup', { limit: 1, windowSeconds: 60 });
    if (!throttle.ok) return workspaceJson({ error: { code: 'RATE_LIMITED', message: 'A backup was requested recently. Wait a minute before retrying.' } }, 429, { 'retry-after': String(throttle.retryAfter || 60) });
    const password = await readPassword(request);
    if (password === null) return workspaceJson({ error: { code: 'INVALID_BODY', message: 'Enter your current owner password.' } }, 422);
    if (!(await verifyPassword(env, password))) return workspaceJson({ error: { code: 'REAUTHENTICATION_FAILED', message: 'The owner password is incorrect.' } }, 403);
    const result = await runBackup(env);
    if (!result.ok) {
      const capacity = ['BACKUP_ROW_LIMIT', 'BACKUP_BYTE_LIMIT'].includes(result.reason);
      return workspaceJson({ error: { code: capacity ? 'BACKUP_CAPACITY' : 'BACKUP_FAILED', message: capacity
        ? 'This workspace has outgrown the application snapshot limit. Use a full database export through your deployment operator.'
        : 'The backup could not be verified. Check storage and retry later.' } }, 503);
    }
    await env.DB.prepare(`INSERT INTO crm_audit (public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(`AUD-${crypto.randomUUID()}`, principal.id, principal.name, principal.role,
      'backup.requested', 'backup', result.backupId, 'Created and verified a manual backup', JSON.stringify({ verified: true, date: result.date }), new Date().toISOString()).run();
    return workspaceJson({ data: { ok: true, verified: true, date: result.date, counts: result.counts } });
  }
  if (request.method !== 'GET') return workspaceJson({ error: { code: 'METHOD_NOT_ALLOWED', message: 'This endpoint is read-only.' } }, 405);
  const [migration, backupEvent] = await Promise.all([
    env.DB.prepare('SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 1').first(),
    env.DB.prepare("SELECT event_type,created_at,payload_json FROM events WHERE event_type IN ('backup.created','backup.failed') ORDER BY id DESC LIMIT 1").first(),
  ]);
  let payload = {};
  try { payload = JSON.parse(backupEvent?.payload_json || '{}'); } catch { /* Corrupt metadata is reported as unverified. */ }
  const backupAt = backupEvent?.created_at || null;
  const verified = backupEvent?.event_type === 'backup.created' && payload.verified === true;
  const stale = !backupAt || !Number.isFinite(Date.parse(backupAt)) || Date.now() - Date.parse(backupAt) > 26 * 3600 * 1000;
  return workspaceJson({ data: {
    version,
    workspace: { name: String(env.ADMIN_WORKSPACE_NAME || env.DATA_SOURCE_NAME || 'GYUTRON').slice(0, 200), tenancy: 'deployment', timezone: workspaceTimeZone(env) },
    storage: { database: Boolean(env.DB), privateFiles: Boolean(env.R2), requestThrottle: Boolean(env.RATE_LIMIT) },
    migration: { latest: migration?.name || null },
    security: { sessionHours: SESSION_TTL_SECONDS / 3600, idleHours: 2, staffPasswordMinLength: 12,
      ownerCredentialStrong: typeof env.ADMIN_PASSWORD === 'string' && env.ADMIN_PASSWORD.length >= 12,
      ownerMode: 'deployment-secret', namedTeamAccounts: true, rolesEnforcedOnServer: true },
    backup: { status: backupEvent ? (verified ? 'verified' : 'unverified') : 'none', at: backupAt,
      verified, stale, schemaVersion: verified ? payload.schema_version : null,
      failureCode: backupEvent?.event_type === 'backup.failed' && /^BACKUP_[A-Z_]+$/.test(payload.reason || '') ? payload.reason : null,
      totalRows: verified && payload.counts ? Object.values(payload.counts).reduce((sum, n) => sum + (Number.isSafeInteger(n) ? n : 0), 0) : null,
      retentionOk: verified ? payload.retention_ok === true : null },
    session: { expiresAt: principal.expiresAt },
  } });
}
