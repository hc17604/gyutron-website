/**
 * recordSubmission — insert a submission row + emit its event atomically from the
 * caller's perspective. Generates the `public_id` and retries on the (extremely
 * rare) UNIQUE collision with a fresh id.
 */
import { insert } from "./repository.mjs";
import { emitEvent } from "./events.mjs";
import { publicId as genPublicId } from "../ids.mjs";

/**
 * @param {object} db   D1 binding (must be non-null)
 * @param {object} env
 * @param {object} spec { table, idPrefix, row, eventType, entityType, eventPayload? }
 * @returns {Promise<{ publicId: string, eventId: string|null }>}
 */
export async function recordSubmission(db, env, spec) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    const pid = genPublicId(spec.idPrefix);
    try {
      await insert(db, spec.table, { ...spec.row, public_id: pid });
      const eventId = await emitEvent(db, env, {
        eventType: spec.eventType,
        entityType: spec.entityType,
        entityId: pid,
        payload: spec.eventPayload ?? { public_id: pid },
      });
      return { publicId: pid, eventId };
    } catch (e) {
      lastErr = e; // most likely a public_id UNIQUE clash → retry with a new id
    }
  }
  throw lastErr || new Error("submission insert failed");
}
