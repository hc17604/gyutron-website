/**
 * Cloudflare Turnstile — SITE key only (public by design; the SECRET key lives in
 * the Worker as the TURNSTILE_SECRET_KEY secret, never here).
 *
 * This repo is site-specific and the production site key is public by design, so a
 * tracked fallback keeps fresh agent/CI builds from silently dropping the widget.
 * PUBLIC_TURNSTILE_SITE_KEY may override it for an approved environment migration.
 * The Worker secret remains external and must never be committed.
 */
const env = import.meta.env as unknown as Record<string, string | undefined>;

export const LIVE_TURNSTILE_SITE_KEY = '0x4AAAAAADh5yZZyBs-zTw3Y';

export const TURNSTILE_SITE_KEY: string =
  env['PUBLIC_TURNSTILE_SITE_KEY']?.trim() || LIVE_TURNSTILE_SITE_KEY;

export const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
