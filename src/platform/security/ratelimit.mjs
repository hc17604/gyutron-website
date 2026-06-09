/**
 * Lightweight fixed-window rate limiter backed by a KV namespace (`RATE_LIMIT`).
 *
 * Graceful: with no KV bound it is a no-op (returns ok) so nothing breaks before
 * a namespace is provisioned. KV's eventual consistency makes this an abuse
 * throttle, not a hard quota — a stricter limit would use the Workers Rate
 * Limiting API or a Durable Object (see docs/phase-roadmap.md).
 */
export async function rateLimit(env, key, { limit = 10, windowSeconds = 60 } = {}) {
  if (!env || !env.RATE_LIMIT) return { ok: true, skipped: true };
  try {
    const now = Math.floor(Date.now() / 1000);
    const windowId = Math.floor(now / windowSeconds);
    const k = `rl:${key}:${windowId}`;
    const current = Number(await env.RATE_LIMIT.get(k)) || 0;
    if (current >= limit) {
      return { ok: false, retryAfter: windowSeconds - (now % windowSeconds) };
    }
    await env.RATE_LIMIT.put(k, String(current + 1), { expirationTtl: windowSeconds + 5 });
    return { ok: true };
  } catch (e) {
    console.error("rate limit check failed:", e && e.message);
    return { ok: true, error: true }; // fail-open: never block a legit user on limiter error
  }
}
