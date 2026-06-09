/**
 * Unified HTTP responses. Two envelope families:
 *   - Form endpoints (`/api/*`):  { ok, message, id? }            (back-compat with the live contact form)
 *   - Data API     (`/api/v1/*`): { data, pagination, meta } | { error: { code, message }, meta }
 *
 * Never leak internal errors to the client — log server-side, return a generic message.
 */
import { API_VERSION, dataSource } from "./config.mjs";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

/** Low-level JSON response. */
export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

/* ----------------------------- form endpoints ----------------------------- */

export function formOk(message, extra = {}) {
  return json({ ok: true, message, ...extra });
}

export function formError(message, status = 400, extra = {}) {
  return json({ ok: false, message, ...extra }, status);
}

/* ------------------------------- data API --------------------------------- */

function meta(env) {
  return {
    source: dataSource(env).id,
    api_version: API_VERSION,
    generated_at: new Date().toISOString(),
  };
}

/** Read-only collection/record response with the standard envelope. */
export function apiData(env, data, pagination = null) {
  return json(
    {
      data,
      pagination: pagination ?? { limit: null, next_cursor: null },
      meta: meta(env),
    },
    200,
    DATA_CORS,
  );
}

/** Structured machine-readable error for the Data API. */
export function apiError(env, code, message, status = 400) {
  return json({ error: { code, message }, meta: meta(env) }, status, DATA_CORS);
}

/**
 * Permissive CORS for the read-only Data API. Safe because auth is via the
 * Authorization/X-API-Key header (not cookies), so a browser on another origin
 * still cannot read data without holding a key.
 */
export const DATA_CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization, x-api-key, content-type",
  "access-control-max-age": "86400",
};

export function corsPreflight(headers = DATA_CORS) {
  return new Response(null, { status: 204, headers });
}
