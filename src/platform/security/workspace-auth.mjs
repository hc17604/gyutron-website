/** Named staff and revocable, opaque admin sessions. No legacy signed-cookie acceptance. */
import { scrypt } from 'node:crypto';
import { sha256Hex, timingSafeEqual } from './hash.mjs';

export const SESSION_COOKIE = 'gy_workspace';
export const SESSION_TTL_SECONDS = 8 * 3600;
const IDLE_SECONDS = 2 * 3600;
const encoder = new TextEncoder();
const SCRYPT = { N: 32768, r: 8, p: 3, maxmem: 48 * 1024 * 1024 };

export function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
}

export function cookieValue(request, name) {
  const parts = (request.headers.get('cookie') || '').split(/;\s*/);
  for (const part of parts) {
    const pos = part.indexOf('=');
    if (pos > 0 && part.slice(0, pos) === name) return part.slice(pos + 1);
  }
  return null;
}

export function workspaceCookie(token, secure = true) {
  return `${SESSION_COOKIE}=${token}; Path=/admin; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearWorkspaceCookie(secure = true) {
  return `${SESSION_COOKIE}=; Path=/admin; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Strict; Max-Age=0`;
}

export function validPassword(password) {
  return typeof password === 'string' && password.length >= 12 && encoder.encode(password).length <= 256;
}

function derive(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, SCRYPT, (error, key) => error ? reject(error) : resolve(key.toString('hex')));
  });
}

export async function hashStaffPassword(password) {
  if (!validPassword(password)) throw new Error('Password must contain at least 12 characters and at most 256 UTF-8 bytes.');
  const salt = randomToken();
  return `scrypt$32768$8$3$${salt}$${await derive(password, salt)}`;
}

export async function verifyStaffPassword(password, encoded) {
  if (typeof password !== 'string' || encoder.encode(password).length > 256) return false;
  const parts = String(encoded || '').split('$');
  if (parts.length !== 6 || parts.slice(0, 4).join('$') !== 'scrypt$32768$8$3'
    || !/^[a-f0-9]{64}$/.test(parts[4]) || !/^[a-f0-9]{128}$/.test(parts[5])) return false;
  return timingSafeEqual(await derive(password, parts[4]), parts[5]);
}

async function ownerFingerprint(env) {
  return sha256Hex(`${env.ADMIN_PASSWORD || ''}:${env.ADMIN_SECRET || ''}`);
}

export async function createWorkspaceSession(db, env, user = null) {
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const csrfToken = randomToken();
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  const table = user ? 'admin_sessions' : 'admin_owner_sessions';
  const sql = user
    ? `INSERT INTO admin_sessions (token_hash,user_id,csrf_token,credential_fingerprint,created_at,expires_at,last_seen_at) VALUES (?,?,?,?,?,?,?)`
    : `INSERT INTO admin_owner_sessions (token_hash,csrf_token,credential_fingerprint,created_at,expires_at,last_seen_at) VALUES (?,?,?,?,?,?)`;
  const args = user
    ? [tokenHash, user.id, csrfToken, await sha256Hex(user.password_hash), now, expires, now]
    : [tokenHash, csrfToken, await ownerFingerprint(env), now, expires, now];
  await db.batch([
    db.prepare(`DELETE FROM ${table} WHERE expires_at <= ?`).bind(now),
    db.prepare(sql).bind(...args),
  ]);
  return { token, csrfToken, expiresAt: expires };
}

export async function getWorkspacePrincipal(request, env, db) {
  if (!env.ADMIN_PASSWORD || !db) return null;
  const raw = cookieValue(request, SESSION_COOKIE);
  if (!raw || !/^[a-f0-9]{64}$/.test(raw)) return null;
  const hash = await sha256Hex(raw);
  const now = new Date().toISOString();
  let row = await db.prepare('SELECT * FROM admin_owner_sessions WHERE token_hash = ?').bind(hash).first();
  let principal;
  let table = 'admin_owner_sessions';
  if (row) {
    if (!(await timingSafeEqual(row.credential_fingerprint, await ownerFingerprint(env)))) return null;
    principal = { id: 'owner', name: 'Workspace owner', email: null, role: 'owner' };
  } else {
    table = 'admin_sessions';
    row = await db.prepare(`SELECT s.*, u.name, u.email, u.role, u.active, u.password_hash FROM admin_sessions s
      JOIN admin_users u ON u.id = s.user_id WHERE s.token_hash = ?`).bind(hash).first();
    if (!row || row.active !== 1) return null;
    if (!(await timingSafeEqual(row.credential_fingerprint, await sha256Hex(row.password_hash)))) return null;
    principal = { id: row.user_id, name: row.name, email: row.email, role: row.role };
  }
  if (row.expires_at <= now || Date.parse(row.last_seen_at) < Date.now() - IDLE_SECONDS * 1000) {
    await db.prepare(`DELETE FROM ${table} WHERE token_hash = ?`).bind(hash).run();
    return null;
  }
  if (Date.parse(row.last_seen_at) < Date.now() - 60_000) {
    await db.prepare(`UPDATE ${table} SET last_seen_at = ? WHERE token_hash = ?`).bind(now, hash).run();
  }
  return { ...principal, csrfToken: row.csrf_token, sessionHash: hash, expiresAt: row.expires_at };
}

export async function revokeWorkspaceSession(db, request) {
  const raw = cookieValue(request, SESSION_COOKIE);
  if (!raw || !/^[a-f0-9]{64}$/.test(raw)) return;
  const hash = await sha256Hex(raw);
  await db.batch([
    db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(hash),
    db.prepare('DELETE FROM admin_owner_sessions WHERE token_hash = ?').bind(hash),
  ]);
}

export function sameOrigin(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && !['same-origin', 'none'].includes(fetchSite)) return false;
  return origin === url.origin;
}

export async function checkCsrf(request, principal, submittedToken) {
  if (!sameOrigin(request)) return false;
  const token = submittedToken ?? request.headers.get('x-csrf-token');
  return typeof token === 'string' && typeof principal?.csrfToken === 'string'
    && timingSafeEqual(token, principal.csrfToken);
}

/** D1's serialized atomic upsert gives a hard per-IP window, independent of KV consistency. */
export async function allowLoginAttempt(db, request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  const key = await sha256Hex(`${env.IP_HASH_SALT || env.ADMIN_SECRET || ''}:login:${ip}`);
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / 300) * 300;
  const result = await db.prepare(`INSERT INTO admin_login_attempts (key_hash, attempts, window_start)
    VALUES (?,1,?) ON CONFLICT(key_hash) DO UPDATE SET
      attempts = CASE WHEN window_start = excluded.window_start THEN attempts + 1 ELSE 1 END,
      window_start = excluded.window_start RETURNING attempts`).bind(key, windowStart).first();
  if (Math.random() < 0.05) await db.prepare('DELETE FROM admin_login_attempts WHERE window_start < ?').bind(windowStart - 600).run();
  return { ok: result.attempts <= 5, retryAfter: 300 - (now - windowStart) };
}
