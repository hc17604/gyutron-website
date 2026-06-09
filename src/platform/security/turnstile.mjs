/**
 * Cloudflare Turnstile verification.
 *
 * Graceful by design: if `TURNSTILE_SECRET_KEY` is not configured, verification
 * is SKIPPED (returns ok) so forms keep working before Turnstile is wired up.
 * Once the secret is set, a missing/invalid token is rejected.
 */
const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET_KEY) return { ok: true, skipped: true };
  if (!token) return { ok: false, skipped: false };
  try {
    const body = new URLSearchParams();
    body.set("secret", env.TURNSTILE_SECRET_KEY);
    body.set("response", token);
    if (ip) body.set("remoteip", ip);
    const res = await fetch(SITEVERIFY, { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    return { ok: Boolean(data && data.success), skipped: false };
  } catch (e) {
    console.error("turnstile verify failed:", e && e.message);
    return { ok: false, skipped: false, error: true };
  }
}
