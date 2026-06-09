/**
 * Read-only Data API authentication.
 *
 * Phase 1 accepts a single shared key from `env.DATA_API_KEY`. It ALSO supports
 * the forward-compatible path: any other presented key is SHA-256-hashed and
 * looked up in the `api_keys` table (multiple keys, per-key scopes, revocation)
 * — so moving from one key to many is a data change, not a code change.
 *
 * Auth is via header only (`Authorization: Bearer <key>` or `X-API-Key: <key>`).
 */
import { timingSafeEqual, sha256Hex } from "./hash.mjs";

export function extractApiKey(request) {
  const auth = request.headers.get("authorization");
  if (auth && /^bearer\s+/i.test(auth)) return auth.replace(/^bearer\s+/i, "").trim();
  const x = request.headers.get("x-api-key");
  return x ? x.trim() : null;
}

/**
 * @returns {Promise<{ok:true, scope:string, keyId?:string} | {ok:false}>}
 */
export async function authenticate(request, env, db) {
  const provided = extractApiKey(request);
  if (!provided) return { ok: false };

  // 1) Single env-var key (timing-safe).
  if (env.DATA_API_KEY && (await timingSafeEqual(provided, env.DATA_API_KEY))) {
    return { ok: true, scope: "read:all" };
  }

  // 2) Hashed lookup in api_keys (multi-key / scoped / revocable).
  if (db) {
    try {
      const hash = await sha256Hex(provided);
      const row = await db
        .prepare("SELECT public_id, scope, status FROM api_keys WHERE key_hash = ? LIMIT 1")
        .bind(hash)
        .first();
      if (row && row.status === "active") {
        try {
          await db
            .prepare("UPDATE api_keys SET last_used_at = ? WHERE public_id = ?")
            .bind(new Date().toISOString(), row.public_id)
            .run();
        } catch {
          /* last_used_at is best-effort */
        }
        return { ok: true, scope: row.scope || "read:all", keyId: row.public_id };
      }
    } catch (e) {
      console.error("api key lookup failed:", e && e.message);
    }
  }
  return { ok: false };
}

/** Does `scope` grant `needed`? `read:all` is the wildcard. */
export function scopeAllows(scope, needed) {
  if (!needed) return true;
  const set = String(scope || "").split(/\s+/).filter(Boolean);
  return set.includes("read:all") || set.includes(needed);
}
