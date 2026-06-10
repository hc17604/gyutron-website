/**
 * Cloudflare Turnstile — SITE key only (public by design; the SECRET key lives in
 * the Worker as the TURNSTILE_SECRET_KEY secret, never here).
 *
 * Behavior: empty key (default) → forms render WITHOUT the widget and the worker
 * skips verification (graceful). To enable anti-spam for real (P3):
 *   1. create a Turnstile widget in the Cloudflare dashboard,
 *   2. set PUBLIC_TURNSTILE_SITE_KEY in astro/.env, rebuild, sync public/, push,
 *   3. ONLY THEN set the worker secret: npx wrangler secret put TURNSTILE_SECRET_KEY
 * (Order matters — setting the secret before the widget ships breaks live forms.)
 */
const env = import.meta.env as unknown as Record<string, string | undefined>;

export const TURNSTILE_SITE_KEY: string = env['PUBLIC_TURNSTILE_SITE_KEY'] ?? '';

export const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
