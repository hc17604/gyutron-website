/**
 * Read-only Data API — the productized surface the Agent Workspace (and future
 * customers' agents) consume. Customer-agnostic envelope, header auth, cursor
 * paging for incremental sync, sensitive fields stripped at the repository layer.
 *
 *   GET /api/v1/health                 (public)
 *   GET /api/v1/metadata               (auth) resource catalog + row counts
 *   GET /api/v1/leads                  (auth)
 *   GET /api/v1/rfqs                   (auth)
 *   GET /api/v1/support-requests       (auth)
 *   GET /api/v1/download-requests      (auth)
 *   GET /api/v1/events                 (auth)
 *   GET /api/v1/products|categories    (auth) → products.mjs
 *
 * Query: ?since=<ISO> &status=<s> &cursor=<id> &limit=<1..200>
 */
import { API_VERSION, dataSource, capabilities } from "../platform/config.mjs";
import { API_FIELDS, API_RESOURCES, STATUS_VALUES } from "../platform/schemas.mjs";
import { authenticate, scopeAllows } from "../platform/security/auth.mjs";
import { getDb } from "../platform/db/client.mjs";
import { list, count, project } from "../platform/db/repository.mjs";
import { apiData, apiError, corsPreflight, DATA_CORS, json } from "../platform/response.mjs";

const PREFIX = `/api/${API_VERSION}`;

export async function handleDataApi(request, env, ctx, url) {
  if (request.method === "OPTIONS") return corsPreflight();

  const path = url.pathname.slice(PREFIX.length) || "/"; // e.g. "/leads", "/products/android-pda"

  // Public health check (no auth) — used by uptime probes and the Agent's connect
  // test. Deliberately minimal: no `capabilities` here (that would let anonymous
  // callers fingerprint which backend features/admin are enabled). Full capability
  // info lives behind auth on /metadata.
  if (path === "/health" || path === "/health/") {
    return json(
      {
        status: "ok",
        api_version: API_VERSION,
        source: dataSource(env).id,
        time: new Date().toISOString(),
      },
      200,
      DATA_CORS,
    );
  }

  if (request.method !== "GET") {
    return apiError(env, "method_not_allowed", "The Data API is read-only.", 405);
  }

  // Authenticate everything past /health.
  const db = getDb(env);
  const auth = await authenticate(request, env, db);
  if (!auth.ok) return apiError(env, "unauthorized", "Missing or invalid API key.", 401);

  // Per-key rate limit (KV; graceful no-op without the binding). The limiter key
  // is a hash of the credential — the key itself is never stored.
  {
    const { extractApiKey } = await import("../platform/security/auth.mjs");
    const { sha256Hex } = await import("../platform/security/hash.mjs");
    const { rateLimit } = await import("../platform/security/ratelimit.mjs");
    const keyHash = (await sha256Hex(extractApiKey(request) || "")).slice(0, 16);
    const rl = await rateLimit(env, `data-api:${keyHash}`, { limit: 120, windowSeconds: 60 });
    if (!rl.ok) return apiError(env, "rate_limited", "Too many requests for this key.", 429);
  }

  if (path === "/metadata" || path === "/metadata/") {
    if (!scopeAllows(auth.scope, "read:metadata")) return forbidden(env);
    return handleMetadata(env, db);
  }

  // Product catalog (lazy import so the ~200KB catalog stays off the hot path).
  if (path === "/products" || path.startsWith("/products/") || path === "/categories") {
    if (!scopeAllows(auth.scope, "read:products")) return forbidden(env);
    const { handleProductsApi } = await import("./products.mjs");
    return handleProductsApi(request, env, url, path);
  }

  // Collection resources.
  const resourceKey = path.replace(/^\//, "").split("/")[0];
  const table = API_RESOURCES[resourceKey];
  if (!table) return apiError(env, "not_found", `Unknown resource: ${resourceKey || "(root)"}`, 404);
  if (!scopeAllows(auth.scope, `read:${resourceKey}`)) return forbidden(env);
  if (!db) return apiError(env, "data_store_unavailable", "Data store is not configured.", 503);

  const q = url.searchParams;
  const status = q.get("status") || undefined;
  if (status && STATUS_VALUES[table] && !STATUS_VALUES[table].includes(status)) {
    return apiError(env, "invalid_status", `Invalid status filter for ${resourceKey}.`, 400);
  }

  try {
    const { rows, nextCursor, limit } = await list(db, table, {
      select: API_FIELDS[table],
      since: q.get("since") || undefined,
      status,
      cursor: q.get("cursor") || undefined,
      limit: q.get("limit") || undefined,
    });
    const data = rows
      .map((r) => project(r, API_FIELDS[table]))
      .map((r) => (table === "events" ? parseEventPayload(r) : r));
    return apiData(env, data, { limit, next_cursor: nextCursor });
  } catch (e) {
    console.error("data api list failed:", e && e.message);
    return apiError(env, "internal_error", "Could not read the requested data.", 500);
  }
}

function forbidden(env) {
  return apiError(env, "forbidden", "Your API key is not scoped for this resource.", 403);
}

/** Turn the stored events.payload_json string into a parsed `payload` object. */
function parseEventPayload(row) {
  if (!row || !("payload_json" in row)) return row;
  const { payload_json, ...rest } = row;
  let payload = null;
  try {
    payload = payload_json ? JSON.parse(payload_json) : null;
  } catch {
    payload = null;
  }
  return { ...rest, payload };
}

async function handleMetadata(env, db) {
  const resourceKeys = Object.keys(API_RESOURCES);
  const out = {
    source: dataSource(env),
    api_version: API_VERSION,
    resources: resourceKeys.map((key) => ({
      name: key,
      path: `${PREFIX}/${key}`,
      fields: API_FIELDS[API_RESOURCES[key]],
      filters: ["since", "cursor", "limit", ...(STATUS_VALUES[API_RESOURCES[key]] ? ["status"] : [])],
    })),
    products: { path: `${PREFIX}/products`, params: ["locale"], locales: ["en", "de", "ja"] },
    capabilities: capabilities(env),
  };
  if (db) {
    const counts = {};
    for (const key of resourceKeys) {
      try {
        counts[key] = await count(db, API_RESOURCES[key]);
      } catch {
        counts[key] = null;
      }
    }
    out.counts = counts;
  }
  return apiData(env, out, null);
}
