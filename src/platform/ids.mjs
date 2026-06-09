/**
 * Public identifiers and random tokens.
 *
 * Format: PREFIX-YYYYMMDD-XXXXXX  (e.g. RFQ-20260610-7K3QF2)
 *   - date is UTC, so the id is human-sortable and tells you when it came in
 *   - XXXXXX = 6 chars from a 32-symbol Crockford-ish alphabet (no I/L/O/U) →
 *     ~1.07e9 combinations/day/prefix; the UNIQUE constraint + one retry covers
 *     the negligible collision chance without needing a sequence counter.
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // 32 symbols, ambiguity-free

export const ID_PREFIX = Object.freeze({
  leads: "LEAD",
  rfqs: "RFQ",
  support_requests: "SUP",
  download_requests: "DL",
  events: "EVT",
  api_keys: "KEY",
});

function randomChars(n) {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < n; i++) out += ALPHABET[bytes[i] & 31];
  return out;
}

function utcDateStamp(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** A public id like `RFQ-20260610-7K3QF2`. */
export function publicId(prefix) {
  return `${prefix}-${utcDateStamp()}-${randomChars(6)}`;
}

/** A globally-unique event id (date-stamped, longer random tail). */
export function eventId() {
  return `EVT-${utcDateStamp()}-${randomChars(10)}`;
}

/** An opaque, URL-safe random token (admin/API key material, signatures). */
export function randomToken(bytes = 32) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
}
