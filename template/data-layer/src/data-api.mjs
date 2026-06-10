/**
 * Template Data API — the resource endpoints WITHOUT the product catalog.
 * (The catalog handler is site-specific and would bundle this repo's product
 * data into every customer deployment — excluded by design. A customer that
 * wants /products implements its own catalog module behind the same envelope.)
 */
import { API_VERSION, dataSource, capabilities } from "../../../src/platform/config.mjs";
import { API_FIELDS, API_RESOURCES, STATUS_VALUES } from "../../../src/platform/schemas.mjs";
import { authenticate, scopeAllows } from "../../../src/platform/security/auth.mjs";
import { getDb } from "../../../src/platform/db/client.mjs";
import { list, count, project } from "../../../src/platform/db/repository.mjs";
import { apiData, apiError, corsPreflight, DATA_CORS, json } from "../../../src/platform/response.mjs";

const PREFIX = `/api/${API_VERSION}`;

export async function handleDataApi(request, env, ctx, url) {
  if (request.method === "OPTIONS") return corsPreflight();
  const path = url.pathname.slice(PREFIX.length) || "/";

  if (path === "/health" || path === "/health/") {
    return json({ status: "ok", api_version: API_VERSION, source: dataSource(env).id, time: new Date().toISOString() }, 200, DATA_CORS);
  }
  if (request.method !== "GET") return apiError(env, "method_not_allowed", "The Data API is read-only.", 405);

  const db = getDb(env);
  const auth = await authenticate(request, env, db);
  if (!auth.ok) return apiError(env, "unauthorized", "Missing or invalid API key.", 401);

  if (path === "/metadata" || path === "/metadata/") {
    if (!scopeAllows(auth.scope, "read:metadata")) return apiError(env, "forbidden", "Not scoped.", 403);
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
      capabilities: capabilities(env),
    };
    if (db) {
      out.counts = {};
      for (const key of resourceKeys) {
        try { out.counts[key] = await count(db, API_RESOURCES[key]); } catch { out.counts[key] = null; }
      }
    }
    return apiData(env, out, null);
  }

  const resourceKey = path.replace(/^\//, "").split("/")[0];
  const table = API_RESOURCES[resourceKey];
  if (!table) return apiError(env, "not_found", `Unknown resource: ${resourceKey || "(root)"}`, 404);
  if (!scopeAllows(auth.scope, `read:${resourceKey}`)) return apiError(env, "forbidden", "Not scoped.", 403);
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
    const data = rows.map((r) => project(r, API_FIELDS[table])).map((r) => {
      if (table !== "events" || !("payload_json" in r)) return r;
      const { payload_json, ...rest } = r;
      let payload = null;
      try { payload = payload_json ? JSON.parse(payload_json) : null; } catch { payload = null; }
      return { ...rest, payload };
    });
    return apiData(env, data, { limit, next_cursor: nextCursor });
  } catch (e) {
    console.error("data api list failed:", e && e.message);
    return apiError(env, "internal_error", "Could not read the requested data.", 500);
  }
}
