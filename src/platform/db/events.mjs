/**
 * Unified event stream writer. Every submission emits one event so the Agent
 * Workspace can build digests/alerts/automations from a SINGLE feed instead of
 * polling each table. Best-effort: a failed event must never fail the submission.
 */
import { insert } from "./repository.mjs";
import { eventId } from "../ids.mjs";
import { dataSource } from "../config.mjs";

/**
 * @param {object} db   D1 binding (or null → no-op)
 * @param {object} env
 * @param {object} evt  { eventType, entityType?, entityId?, payload? }
 * @returns {Promise<string|null>} the event_id, or null if not recorded
 */
export async function emitEvent(db, env, evt) {
  if (!db) return null;
  const row = {
    event_id: eventId(),
    event_type: evt.eventType,
    entity_type: evt.entityType ?? null,
    entity_id: evt.entityId ?? null,
    source: dataSource(env).id,
    payload_json: evt.payload ? JSON.stringify(evt.payload) : null,
    created_at: new Date().toISOString(),
  };
  try {
    await insert(db, "events", row);
    return row.event_id;
  } catch (e) {
    console.error("emitEvent failed:", e && e.message);
    return null;
  }
}
