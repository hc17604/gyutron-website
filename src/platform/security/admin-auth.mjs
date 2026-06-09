/**
 * Single-admin session auth for `/admin/*`.
 *
 * Stateless signed cookie (no session table): value = `<exp>.<HMAC(exp, secret)>`.
 * The secret is `ADMIN_SECRET` (preferred) or falls back to `ADMIN_PASSWORD`.
 * Admin is fully DISABLED unless `ADMIN_PASSWORD` is set, so a fresh deploy never
 * exposes an open admin panel.
 *
 * Note: the session is stateless, so logout clears only the client cookie — an
 * already-issued cookie stays valid until its 12h expiry. To invalidate all live
 * sessions immediately, rotate ADMIN_SECRET (or ADMIN_PASSWORD if no ADMIN_SECRET).
 */
import { timingSafeEqual, hmacHex } from "./hash.mjs";

const COOKIE = "gy_admin";
const TTL_SECONDS = 12 * 3600;

function secretOf(env) {
  return env.ADMIN_SECRET || env.ADMIN_PASSWORD || "";
}

export function adminConfigured(env) {
  return Boolean(env && env.ADMIN_PASSWORD);
}

/** Constant-time password check. */
export async function verifyPassword(env, password) {
  if (!env.ADMIN_PASSWORD) return false;
  return timingSafeEqual(String(password ?? ""), env.ADMIN_PASSWORD);
}

function cookieAttrs(secure) {
  return `Path=/admin; HttpOnly;${secure ? " Secure;" : ""} SameSite=Lax`;
}

export async function createSessionCookie(env, { secure = true } = {}) {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const sig = await hmacHex(String(exp), secretOf(env));
  return `${COOKIE}=${exp}.${sig}; ${cookieAttrs(secure)}; Max-Age=${TTL_SECONDS}`;
}

export function clearSessionCookie({ secure = true } = {}) {
  return `${COOKIE}=; ${cookieAttrs(secure)}; Max-Age=0`;
}

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
}

/** True if the request carries a valid, unexpired admin session cookie. */
export async function isAuthed(request, env) {
  if (!adminConfigured(env)) return false;
  const raw = readCookie(request, COOKIE);
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return false;
  const exp = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) * 1000 < Date.now()) return false;
  const expected = await hmacHex(exp, secretOf(env));
  return timingSafeEqual(sig, expected);
}
