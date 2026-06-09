/**
 * Hashing + constant-time comparison helpers built on the Web Crypto API
 * (available globally in Cloudflare Workers — no node:crypto needed).
 */

const enc = new TextEncoder();

/** Hex SHA-256 of a string. */
export async function sha256Hex(input) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(String(input)));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Salted hash of a client IP — we never store the raw address. */
export async function hashIp(ip, salt = "") {
  if (!ip) return null;
  return sha256Hex(`${salt}:${ip}`);
}

/**
 * Constant-time string equality. Both sides are SHA-256'd first so the XOR loop
 * always runs over fixed-length (32-byte) buffers regardless of input length,
 * leaking neither length nor content via timing.
 */
export async function timingSafeEqual(a, b) {
  if (a == null || b == null) return false;
  const [da, db] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(String(a))),
    crypto.subtle.digest("SHA-256", enc.encode(String(b))),
  ]);
  const ua = new Uint8Array(da);
  const ub = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

/** HMAC-SHA256 (hex) — used to sign the admin session cookie. */
export async function hmacHex(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(String(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(String(message)));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
