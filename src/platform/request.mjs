/**
 * Request-context helpers. We capture only privacy-safe signals: a salted IP hash
 * (never the raw IP), the coarse Cloudflare country, and a length-capped UA string.
 */
import { hashIp } from "./security/hash.mjs";

export function clientIp(request) {
  return request.headers.get("cf-connecting-ip") || "";
}

export function ipCountry(request) {
  return request.headers.get("cf-ipcountry") || "";
}

export function userAgent(request) {
  return (request.headers.get("user-agent") || "").slice(0, 500);
}

/** Privacy-safe context columns to attach to a submission row. */
export async function requestContext(request, env = {}) {
  const ip = clientIp(request);
  return {
    ip, // not stored — used only for the rate-limit key + turnstile remoteip
    ip_country: ipCountry(request) || null,
    user_agent: userAgent(request) || null,
    ip_hash: ip ? await hashIp(ip, env.IP_HASH_SALT || "gyutron") : null,
  };
}
