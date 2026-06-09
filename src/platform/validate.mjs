/**
 * Schema-driven validation + normalization. Pure functions (no I/O) so they are
 * trivially unit-testable and reused by every form handler.
 */
import { META_FIELDS, HONEYPOT_FIELD } from "./schemas.mjs";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trim, collapse internal whitespace, coerce to string. */
export function cleanString(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/** Read a value from the payload by camelCase key OR its snake_case column name. */
function readField(payload, key, column) {
  const v = payload[key];
  if (v !== undefined && v !== null && v !== "") return v;
  return payload[column];
}

/**
 * Validate a payload against a form spec.
 * @returns {{ ok: boolean, value: Record<string,string>, errors: Record<string,string> }}
 *   `value` is keyed by DB column (ready for the repository).
 */
export function validateForm(formSpec, payload = {}) {
  const value = {};
  const errors = {};

  for (const [key, rule] of Object.entries(formSpec.fields)) {
    let v = cleanString(readField(payload, key, rule.column));

    if (!v) {
      if (rule.required) errors[key] = "This field is required.";
      continue;
    }
    if (rule.email && !EMAIL_PATTERN.test(v)) {
      errors[key] = "Please enter a valid email address.";
      continue;
    }
    if (rule.min && v.length < rule.min) {
      errors[key] = `Please add a little more detail (at least ${rule.min} characters).`;
      continue;
    }
    if (rule.max && v.length > rule.max) {
      errors[key] = `This field is too long (max ${rule.max} characters).`;
      continue;
    }
    if (rule.enum && !rule.enum.includes(v)) {
      errors[key] = "Invalid value.";
      continue;
    }
    if (rule.lower) v = v.toLowerCase();
    value[rule.column] = v;
  }

  return { ok: Object.keys(errors).length === 0, value, errors };
}

/** Extract the shared meta columns (source_page, locale, utm_*) from a payload. */
export function normalizeMeta(payload = {}) {
  const value = {};
  for (const [key, rule] of Object.entries(META_FIELDS)) {
    const v = cleanString(readField(payload, key, rule.column));
    if (v) value[rule.column] = v.slice(0, rule.max);
  }
  return value;
}

/** True if the honeypot field was filled — silently treat as a bot. */
export function isHoneypotTripped(payload = {}) {
  return Boolean(cleanString(payload[HONEYPOT_FIELD]));
}
