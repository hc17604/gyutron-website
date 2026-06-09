/**
 * Platform config — the single place that knows "which data source am I".
 *
 * Everything here is env-overridable so the SAME backend can be redeployed for a
 * different customer by changing environment variables, never code. This is the
 * core of the "replicable for future customers" requirement.
 */

/** Data API version. Bump (and add a parallel router) on a breaking contract change. */
export const API_VERSION = "v1";

/** Canonical table names — the ONLY values the repository layer will accept. */
export const TABLES = Object.freeze({
  leads: "leads",
  rfqs: "rfqs",
  support_requests: "support_requests",
  download_requests: "download_requests",
  events: "events",
  api_keys: "api_keys",
});

/**
 * Identity of this data source, returned in every API `meta` block so a consumer
 * (the Agent Workspace) can attribute rows to a source when it aggregates many.
 */
export function dataSource(env = {}) {
  return {
    id: env.DATA_SOURCE_ID || "gyutron-website",
    name: env.DATA_SOURCE_NAME || "GYUTRON",
    kind: env.DATA_SOURCE_KIND || "industrial-brand-website",
  };
}

/** Capability flags derived from which bindings/secrets are present at runtime. */
export function capabilities(env = {}) {
  return {
    db: Boolean(env.DB),
    r2: Boolean(env.R2),
    rate_limit: Boolean(env.RATE_LIMIT),
    turnstile: Boolean(env.TURNSTILE_SECRET_KEY),
    email: Boolean(env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL),
    data_api: Boolean(env.DATA_API_KEY || env.DB),
    admin: Boolean(env.ADMIN_PASSWORD),
  };
}

export function hasDb(env = {}) {
  return Boolean(env.DB);
}
