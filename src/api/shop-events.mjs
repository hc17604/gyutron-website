/**
 * Shop BEHAVIOR events beacon — POST /api/shop-event (both hosts).
 *
 * Strictly minimal by design (privacy hard rule): event type whitelist +
 * product handle + locale ONLY. No IP storage, no session id, no fingerprint,
 * no cookies, no PII. This is a behavior-events feed, NOT an order connector.
 */
import { json } from "../platform/response.mjs";
import { getDb } from "../platform/db/client.mjs";
import { emitEvent } from "../platform/db/events.mjs";
import { rateLimit } from "../platform/security/ratelimit.mjs";
import { requestContext } from "../platform/request.mjs";

const ALLOWED_EVENTS = ["product.viewed", "cart.added", "quote.requested"];

export async function handleShopEvent(request, env) {
  if (request.method === "OPTIONS") {
    return json({ ok: true }, 204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    });
  }
  if (request.method !== "POST") return json({ ok: false }, 405, { allow: "POST, OPTIONS" });

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  if (typeof payload !== "object" || payload === null) return json({ ok: false }, 400);

  const eventType = String(payload.event || "");
  if (!ALLOWED_EVENTS.includes(eventType)) return json({ ok: false }, 400);

  // Rate limit per ip-hash (the hash is used for limiting only — never stored).
  const ctx = await requestContext(request, env);
  const rl = await rateLimit(env, `shop-event:${ctx.ip_hash || "anon"}`, { limit: 60, windowSeconds: 60 });
  if (!rl.ok) return json({ ok: false }, 429);

  const db = getDb(env);
  if (!db) return json({ ok: true, recorded: false }); // graceful before D1

  const productHandle = String(payload.product_handle || "").slice(0, 200) || null;
  const locale = String(payload.locale || "").slice(0, 10) || null;
  await emitEvent(db, env, {
    eventType,
    entityType: "shop_event",
    entityId: productHandle,
    source: "gyutron-shop",
    payload: { product_handle: productHandle, locale },
  });
  return json({ ok: true, recorded: true }, 200, { "access-control-allow-origin": "*" });
}
