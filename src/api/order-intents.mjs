/**
 * Storefront order-intent API: POST /api/order-intents on shop.gyutron.com.
 *
 * This endpoint records a procurement request for human review. It is not an
 * order, checkout, or payment endpoint: client prices/totals and all payment or
 * bank data are rejected and no charge can be made from this request.
 */
import {
  ORDER_INTENT_REQUEST_TYPES,
  ORDER_INTENT_SKUS,
} from "../platform/schemas.mjs";
import { ID_PREFIX, publicId, eventId } from "../platform/ids.mjs";
import { requestContext } from "../platform/request.mjs";
import { getDb } from "../platform/db/client.mjs";
import { rateLimit } from "../platform/security/ratelimit.mjs";
import { sha256Hex } from "../platform/security/hash.mjs";
import { dataSource } from "../platform/config.mjs";
import { EMAIL_PATTERN } from "../platform/validate.mjs";
import { json } from "../platform/response.mjs";

export const ORDER_INTENT_MESSAGE = "Request received; no charge has been made.";
export const ORDER_INTENT_MAX_BODY_BYTES = 64 * 1024;
export const ORDER_INTENT_MAX_ITEMS = 25;

const ALLOWED_ORIGIN = "https://shop.gyutron.com";
const SKU_SET = new Set(ORDER_INTENT_SKUS);

const TOP_LEVEL_KEYS = new Set([
  "contact", "shipping", "billing", "procurement", "requestType", "items",
  "locale", "sourcePage", "idempotencyKey", "website",
]);
const CONTACT_KEYS = new Set(["name", "company", "email", "phone", "department"]);
const ADDRESS_KEYS = new Set([
  "recipient", "company", "phone", "address1", "address2", "city", "region",
  "postalCode", "country",
]);
const BILLING_KEYS = new Set([...ADDRESS_KEYS, "sameAsShipping"]);
const PROCUREMENT_KEYS = new Set([
  "projectName", "purchaseOrder", "taxId", "invoiceInfo", "notes",
]);
const ITEM_KEYS = new Set(["sku", "quantity", "configuration"]);

const PAYMENT_KEYS = new Set([
  "card", "cardnumber", "cardno", "creditcard", "debitcard", "paymentcard",
  "cardholder", "cardholdername", "cardexpiry", "cardexpiration", "expiry",
  "expirydate", "expiration", "expirationdate", "cvc", "cvv", "cvn", "pan",
  "securitycode", "paymenttoken", "paymentmethod", "paymentintent",
  "bankaccount", "bankaccountnumber", "accountnumber", "routingnumber",
  "sortcode", "iban", "swift", "swiftcode", "bic", "ach", "bankdetails",
]);
const PRICE_KEYS = new Set([
  "price", "unitprice", "listprice", "saleprice", "subtotal", "total",
  "carttotal", "grandtotal", "amount", "taxamount", "taxtotal",
  "shippingamount", "shippingcost", "discount", "discountamount", "currency",
]);
const PAYMENT_VALUE_PATTERNS = [
  /\b(?:card(?:\s+number)?|credit\s+card|debit\s+card|cvc|cvv|bank\s+account|account\s+number|routing\s+number|sort\s+code)\b[^\n]{0,24}\d{3,}/i,
  /\b(?:iban|swift(?:\s+code)?|bic)\b\s*[:#-]?\s*[a-z0-9][a-z0-9 -]{7,34}/i,
];
const PAN_CANDIDATE_PATTERN = /[0-9](?:[ \t\u00a0\u2007\u202f-]*[0-9]){12,18}/g;
const PAYMENT_NUMBER_SEPARATOR_PATTERN = /[ \t\u00a0\u2007\u202f-]/;
const IBAN_START_PATTERN = /[A-Z]{2}[0-9]{2}/g;
const IBAN_SEPARATOR_PATTERN = /[ \t\u00a0\u2007\u202f-]/;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizedKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function forbiddenKind(key) {
  const k = normalizedKey(key);
  if (
    PAYMENT_KEYS.has(k)
    || /^(?:card|creditcard|debitcard).*(?:number|no|expiry|expiration|holder|code|cvc|cvv|cvn|pan|token)$/.test(k)
    || /^bank.*(?:account|routing|iban|swift|bic|details|name|number)$/.test(k)
    || /^payment.*(?:account|routing|token|method|details)$/.test(k)
    || /^(?:iban|swift|bic|routingnumber|sortcode).+$/.test(k)
  ) {
    return "payment";
  }
  if (
    PRICE_KEYS.has(k)
    || /(?:price|total|amount|currency|cost|cents)/.test(k)
    || /^(?:tax|shipping|discount).*(?:rate|fee)$/.test(k)
  ) return "pricing";
  return null;
}

function passesLuhn(digits) {
  let sum = 0;
  let doubleDigit = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits.charCodeAt(i) - 48;
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function containsPlausiblePan(value) {
  const text = value.normalize("NFKC");
  PAN_CANDIDATE_PATTERN.lastIndex = 0;
  let match;
  while ((match = PAN_CANDIDATE_PATTERN.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    // Do not treat a 13-19 digit slice of a longer separated number as a PAN.
    let before = start - 1;
    while (before >= 0 && PAYMENT_NUMBER_SEPARATOR_PATTERN.test(text[before])) before--;
    let after = end;
    while (after < text.length && PAYMENT_NUMBER_SEPARATOR_PATTERN.test(text[after])) after++;
    if ((before >= 0 && /[0-9]/.test(text[before])) || (after < text.length && /[0-9]/.test(text[after]))) {
      continue;
    }

    const digits = match[0].replace(/\D/g, "");
    if (digits[0] !== "0" && !/^(\d)\1+$/.test(digits) && passesLuhn(digits)) return true;
  }
  return false;
}

function passesIbanChecksum(iban) {
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let remainder = 0;
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    if (code >= 48 && code <= 57) {
      remainder = (remainder * 10 + code - 48) % 97;
    } else {
      remainder = (remainder * 100 + code - 55) % 97;
    }
  }
  return remainder === 1;
}

function isStructurallyValidIban(value) {
  return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(value) && passesIbanChecksum(value);
}

function containsValidIban(value) {
  const text = value.normalize("NFKC").toUpperCase();
  IBAN_START_PATTERN.lastIndex = 0;
  let match;
  while ((match = IBAN_START_PATTERN.exec(text)) !== null) {
    if (match.index > 0 && /[A-Z0-9]/.test(text[match.index - 1])) continue;

    let candidate = match[0];
    let cursor = match.index + match[0].length;
    while (candidate.length <= 34) {
      // A separator, punctuation, or the end of the field may terminate an IBAN.
      if (candidate.length >= 15 && (cursor >= text.length || !/[A-Z0-9]/.test(text[cursor]))) {
        if (isStructurallyValidIban(candidate)) return true;
      }
      if (cursor >= text.length) break;

      const char = text[cursor];
      if (/[A-Z0-9]/.test(char)) {
        candidate += char;
        cursor++;
        continue;
      }
      if (IBAN_SEPARATOR_PATTERN.test(char)) {
        cursor++;
        continue;
      }
      break;
    }
  }
  return false;
}

function containsNumericPan(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) return false;
  const magnitude = Math.abs(value);
  if (magnitude < 1_000_000_000_000 || magnitude >= 100_000_000_000_000_000_000) return false;

  // Unsafe JSON integers have already lost one or more original digits, so a
  // checksum can no longer prove that the submitted value was benign. Reject
  // payment-length unsafe integers instead of allowing a rounded PAN through.
  if (!Number.isSafeInteger(value)) return true;
  return containsPlausiblePan(String(magnitude));
}

/** Find a forbidden payment/bank or client-side price field anywhere in JSON. */
export function findForbiddenSubmissionField(value, path = "") {
  const stack = [{ value, path }];
  while (stack.length) {
    const current = stack.pop();
    if (
      typeof current.value === "string"
      && (
        PAYMENT_VALUE_PATTERNS.some((pattern) => pattern.test(current.value))
        || containsPlausiblePan(current.value)
        || containsValidIban(current.value)
      )
      || containsNumericPan(current.value)
    ) {
      return { kind: "payment", path: current.path || "body" };
    }
    if (Array.isArray(current.value)) {
      for (let i = current.value.length - 1; i >= 0; i--) {
        stack.push({ value: current.value[i], path: `${current.path}[${i}]` });
      }
      continue;
    }
    if (!isRecord(current.value)) continue;
    const entries = Object.entries(current.value);
    for (let i = entries.length - 1; i >= 0; i--) {
      const [key, child] = entries[i];
      const kind = forbiddenKind(key);
      const fieldPath = current.path ? `${current.path}.${key}` : key;
      if (kind) return { kind, path: fieldPath };
      stack.push({ value: child, path: fieldPath });
    }
  }
  return null;
}

function addUnknownKeyErrors(value, allowed, path, errors) {
  if (!isRecord(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors[`${path}.${key}`] = "Unknown field.";
  }
}

function cleanText(raw) {
  if (raw === undefined || raw === null) return "";
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  return String(raw).trim().replace(/\s+/g, " ");
}

async function readCappedText(request, maxBytes) {
  if (!request.body) return { text: "", tooLarge: false };
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      return { text: "", tooLarge: true };
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return { text, tooLarge: false };
}

function textField(object, key, path, errors, { required = false, max = 200, email = false } = {}) {
  const fieldPath = `${path}.${key}`;
  const value = cleanText(object ? object[key] : undefined);
  if (value === null) {
    errors[fieldPath] = "Must be text.";
    return null;
  }
  if (!value) {
    if (required) errors[fieldPath] = "This field is required.";
    return null;
  }
  if (value.length > max) {
    errors[fieldPath] = `This field is too long (max ${max} characters).`;
    return null;
  }
  if (email && !EMAIL_PATTERN.test(value)) {
    errors[fieldPath] = "Please enter a valid email address.";
    return null;
  }
  return email ? value.toLowerCase() : value;
}

function normalizeAddress(object, path, errors, required) {
  const source = isRecord(object) ? object : {};
  if (object !== undefined && !isRecord(object)) errors[path] = "Must be an object.";
  addUnknownKeyErrors(source, path === "billing" ? BILLING_KEYS : ADDRESS_KEYS, path, errors);
  return {
    recipient: textField(source, "recipient", path, errors, { max: 200 }),
    company: textField(source, "company", path, errors, { max: 200 }),
    phone: textField(source, "phone", path, errors, { max: 60 }),
    address1: textField(source, "address1", path, errors, { required, max: 300 }),
    address2: textField(source, "address2", path, errors, { max: 300 }),
    city: textField(source, "city", path, errors, { required, max: 150 }),
    region: textField(source, "region", path, errors, { max: 150 }),
    postalCode: textField(source, "postalCode", path, errors, { required, max: 40 }),
    country: textField(source, "country", path, errors, { required, max: 100 }),
  };
}

function sanitizeConfiguration(value, path, errors) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string") {
    if (value.length > 4000) errors[path] = "Configuration is too long (max 4000 characters).";
    return value.slice(0, 4000);
  }
  if (!isRecord(value) && !Array.isArray(value)) {
    errors[path] = "Configuration must be text, an object, or an array.";
    return null;
  }

  let nodes = 0;
  function inspect(node, depth) {
    nodes++;
    if (nodes > 100 || depth > 4) return false;
    if (node === null || typeof node === "string" || typeof node === "boolean") return true;
    if (typeof node === "number") return Number.isFinite(node);
    if (Array.isArray(node)) return node.length <= 25 && node.every((entry) => inspect(entry, depth + 1));
    if (isRecord(node)) {
      const entries = Object.entries(node);
      return entries.length <= 50 && entries.every(([key, entry]) => key.length <= 100 && inspect(entry, depth + 1));
    }
    return false;
  }

  if (!inspect(value, 0)) {
    errors[path] = "Configuration is too complex.";
    return null;
  }
  const encoded = JSON.stringify(value);
  if (encoded.length > 4000) {
    errors[path] = "Configuration is too long (max 4000 characters).";
    return null;
  }
  return value;
}

/**
 * Pure validation/normalization for offline tests and the Worker handler.
 * Returned `value` contains only fields that may be persisted.
 */
export function validateOrderIntentPayload(payload) {
  const errors = {};
  if (!isRecord(payload)) return { ok: false, value: null, errors: { body: "Must be a JSON object." } };

  const forbidden = findForbiddenSubmissionField(payload);
  if (forbidden) {
    const message = forbidden.kind === "payment"
      ? "Payment card and bank-account data are not accepted."
      : "Client-submitted prices and totals are not accepted.";
    return { ok: false, value: null, errors: { [forbidden.path]: message }, forbidden };
  }

  for (const key of Object.keys(payload)) {
    if (!TOP_LEVEL_KEYS.has(key)) errors[key] = "Unknown field.";
  }

  const contact = isRecord(payload.contact) ? payload.contact : {};
  if (!isRecord(payload.contact)) errors.contact = "Must be an object.";
  addUnknownKeyErrors(contact, CONTACT_KEYS, "contact", errors);
  const normalizedContact = {
    name: textField(contact, "name", "contact", errors, { required: true, max: 200 }),
    company: textField(contact, "company", "contact", errors, { required: true, max: 200 }),
    email: textField(contact, "email", "contact", errors, { required: true, max: 320, email: true }),
    phone: textField(contact, "phone", "contact", errors, { max: 60 }),
    department: textField(contact, "department", "contact", errors, { max: 120 }),
  };

  if (!isRecord(payload.shipping)) errors.shipping = "Must be an object.";
  const shipping = normalizeAddress(payload.shipping, "shipping", errors, true);

  let billingSameAsShipping = payload.billing === undefined;
  if (payload.billing !== undefined && !isRecord(payload.billing)) {
    errors.billing = "Must be an object.";
  } else if (isRecord(payload.billing) && payload.billing.sameAsShipping !== undefined) {
    if (typeof payload.billing.sameAsShipping !== "boolean") {
      errors["billing.sameAsShipping"] = "Must be true or false.";
    } else {
      billingSameAsShipping = payload.billing.sameAsShipping;
    }
  }
  const billing = billingSameAsShipping
    ? normalizeAddress(payload.billing, "billing", errors, false)
    : normalizeAddress(payload.billing, "billing", errors, true);

  const procurement = isRecord(payload.procurement) ? payload.procurement : {};
  if (payload.procurement !== undefined && !isRecord(payload.procurement)) errors.procurement = "Must be an object.";
  addUnknownKeyErrors(procurement, PROCUREMENT_KEYS, "procurement", errors);
  const normalizedProcurement = {
    projectName: textField(procurement, "projectName", "procurement", errors, { max: 200 }),
    purchaseOrder: textField(procurement, "purchaseOrder", "procurement", errors, { max: 120 }),
    taxId: textField(procurement, "taxId", "procurement", errors, { max: 120 }),
    invoiceInfo: textField(procurement, "invoiceInfo", "procurement", errors, { max: 2000 }),
    notes: textField(procurement, "notes", "procurement", errors, { max: 5000 }),
  };

  const requestType = cleanText(payload.requestType);
  if (!requestType) errors.requestType = "This field is required.";
  else if (!ORDER_INTENT_REQUEST_TYPES.includes(requestType)) errors.requestType = "Invalid request type.";

  const items = [];
  if (!Array.isArray(payload.items)) {
    errors.items = "Must be an array.";
  } else if (payload.items.length < 1 || payload.items.length > ORDER_INTENT_MAX_ITEMS) {
    errors.items = `Add between 1 and ${ORDER_INTENT_MAX_ITEMS} items.`;
  } else {
    payload.items.forEach((item, index) => {
      const path = `items[${index}]`;
      if (!isRecord(item)) {
        errors[path] = "Must be an object.";
        return;
      }
      addUnknownKeyErrors(item, ITEM_KEYS, path, errors);
      const rawSku = cleanText(item.sku);
      const sku = rawSku ? rawSku.toUpperCase() : "";
      if (!sku) errors[`${path}.sku`] = "This field is required.";
      else if (!SKU_SET.has(sku)) errors[`${path}.sku`] = "Unknown storefront SKU.";

      const quantity = typeof item.quantity === "string" && /^\d+$/.test(item.quantity.trim())
        ? Number(item.quantity.trim())
        : item.quantity;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        errors[`${path}.quantity`] = "Quantity must be a whole number from 1 to 999.";
      }
      const configuration = sanitizeConfiguration(item.configuration, `${path}.configuration`, errors);
      items.push({ sku, quantity, configuration });
    });
  }

  const locale = textField(payload, "locale", "meta", errors, { max: 10 });
  if (locale && !["en", "de", "ja"].includes(locale.toLowerCase())) errors["meta.locale"] = "Unsupported locale.";
  const sourcePage = textField(payload, "sourcePage", "meta", errors, { max: 300 });
  const idempotencyKey = textField(payload, "idempotencyKey", "meta", errors, { max: 128 });

  const value = {
    contact: normalizedContact,
    shipping,
    billing: billingSameAsShipping ? null : billing,
    billingSameAsShipping,
    procurement: normalizedProcurement,
    requestType,
    items,
    locale: locale ? locale.toLowerCase() : null,
    sourcePage,
    idempotencyKey,
  };
  return { ok: Object.keys(errors).length === 0, value, errors };
}

function originPolicy(request, env) {
  const supplied = request.headers.get("origin");
  if (!supplied) return { ok: true, headers: { vary: "Origin" } };

  let origin;
  try {
    origin = new URL(supplied).origin;
  } catch {
    return { ok: false, headers: { vary: "Origin" } };
  }
  let allowed = origin === ALLOWED_ORIGIN;
  if (!allowed && env && env.ORDER_INTENT_ALLOW_LOCAL_ORIGIN === "true") {
    const parsed = new URL(origin);
    allowed = (parsed.protocol === "http:" || parsed.protocol === "https:")
      && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  }
  return {
    ok: allowed,
    headers: allowed
      ? { "access-control-allow-origin": origin, vary: "Origin" }
      : { vary: "Origin" },
  };
}

function reply(request, env, body, status, extraHeaders = {}) {
  const policy = originPolicy(request, env);
  return json(body, status, { ...policy.headers, ...extraHeaders });
}

function accepted(request, env, id) {
  return reply(request, env, {
    ok: true,
    id,
    status: "pending_review",
    message: ORDER_INTENT_MESSAGE,
  }, 202);
}

function serviceUnavailable(request, env) {
  return reply(request, env, {
    ok: false,
    message: "Order requests are temporarily unavailable; no charge has been made.",
  }, 503);
}

async function existingIntent(db, keyHash) {
  if (!keyHash) return null;
  return db.prepare(
    "SELECT public_id, status, request_fingerprint FROM order_intents WHERE idempotency_key_hash = ? LIMIT 1",
  ).bind(keyHash).first();
}

function intentInsertStatement(db, publicIdValue, value, ctx, keyHash, fingerprint, now) {
  const row = {
    public_id: publicIdValue,
    idempotency_key_hash: keyHash,
    request_fingerprint: fingerprint,
    request_type: value.requestType,
    contact_name: value.contact.name,
    contact_department: value.contact.department,
    company: value.contact.company,
    email: value.contact.email,
    phone: value.contact.phone,
    shipping_recipient: value.shipping.recipient,
    shipping_company: value.shipping.company,
    shipping_phone: value.shipping.phone,
    shipping_address_line1: value.shipping.address1,
    shipping_address_line2: value.shipping.address2,
    shipping_city: value.shipping.city,
    shipping_region: value.shipping.region,
    shipping_postal_code: value.shipping.postalCode,
    shipping_country: value.shipping.country,
    billing_same_as_shipping: value.billingSameAsShipping ? 1 : 0,
    billing_recipient: value.billing ? value.billing.recipient : null,
    billing_company: value.billing ? value.billing.company : null,
    billing_phone: value.billing ? value.billing.phone : null,
    billing_address_line1: value.billing ? value.billing.address1 : null,
    billing_address_line2: value.billing ? value.billing.address2 : null,
    billing_city: value.billing ? value.billing.city : null,
    billing_region: value.billing ? value.billing.region : null,
    billing_postal_code: value.billing ? value.billing.postalCode : null,
    billing_country: value.billing ? value.billing.country : null,
    procurement_project_name: value.procurement.projectName,
    procurement_purchase_order: value.procurement.purchaseOrder,
    procurement_tax_id: value.procurement.taxId,
    procurement_invoice_info: value.procurement.invoiceInfo,
    procurement_notes: value.procurement.notes,
    item_count: value.items.length,
    source_page: value.sourcePage,
    locale: value.locale,
    user_agent: ctx.user_agent,
    ip_hash: ctx.ip_hash,
    ip_country: ctx.ip_country,
    status: "pending_review",
    created_at: now,
    updated_at: now,
  };
  const columns = Object.keys(row);
  const sql = `INSERT INTO order_intents (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
  return db.prepare(sql).bind(...columns.map((column) => row[column]));
}

function itemInsertStatement(db, publicIdValue, item, lineNumber, now) {
  return db.prepare(
    `INSERT INTO order_intent_items
      (order_intent_id, line_number, sku, quantity, configuration_json, created_at)
     SELECT id, ?, ?, ?, ?, ? FROM order_intents WHERE public_id = ?`,
  ).bind(
    lineNumber,
    item.sku,
    item.quantity,
    item.configuration === null ? null : JSON.stringify(item.configuration),
    now,
    publicIdValue,
  );
}

function eventInsertStatement(db, env, publicIdValue, value, now) {
  const payload = {
    public_id: publicIdValue,
    request_type: value.requestType,
    company: value.contact.company,
    item_count: value.items.length,
    locale: value.locale,
    source_page: value.sourcePage,
  };
  return db.prepare(
    `INSERT INTO events
      (event_id, event_type, entity_type, entity_id, source, payload_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    eventId(),
    "order_intent.created",
    "order_intent",
    publicIdValue,
    dataSource(env).id,
    JSON.stringify(payload),
    now,
  );
}

function isUniqueError(error) {
  return /unique|constraint failed/i.test(String(error && error.message));
}

/** POST/OPTIONS handler, routed by src/worker.mjs only on shop.gyutron.com. */
export async function handleOrderIntent(request, env, _ctx) {
  const policy = originPolicy(request, env);
  if (!policy.ok) return reply(request, env, { ok: false, message: "Origin not allowed." }, 403);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...policy.headers,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "86400",
      },
    });
  }
  if (request.method !== "POST") {
    return reply(request, env, { ok: false, message: "Method not allowed." }, 405, { allow: "POST, OPTIONS" });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return reply(request, env, { ok: false, message: "Content-Type must be application/json." }, 415);
  }
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > ORDER_INTENT_MAX_BODY_BYTES) {
    return reply(request, env, { ok: false, message: "Request body is too large." }, 413);
  }

  let payload;
  try {
    const body = await readCappedText(request, ORDER_INTENT_MAX_BODY_BYTES);
    if (body.tooLarge) {
      return reply(request, env, { ok: false, message: "Request body is too large." }, 413);
    }
    payload = JSON.parse(body.text);
  } catch {
    return reply(request, env, { ok: false, message: "Please submit valid JSON." }, 400);
  }

  const forbidden = findForbiddenSubmissionField(payload);
  if (forbidden) {
    const message = forbidden.kind === "payment"
      ? "Payment card and bank-account data are not accepted."
      : "Client-submitted prices and totals are not accepted.";
    return reply(request, env, { ok: false, message, errors: { [forbidden.path]: message } }, 400);
  }

  // Honeypot submissions receive the same acknowledgement but are never stored.
  if (isRecord(payload) && cleanText(payload.website)) {
    return accepted(request, env, publicId(ID_PREFIX.order_intents));
  }

  const validation = validateOrderIntentPayload(payload);
  if (!validation.ok) {
    return reply(request, env, {
      ok: false,
      message: "Please check the submitted order-request details.",
      errors: validation.errors,
    }, 400);
  }
  const value = validation.value;

  const ctx = await requestContext(request, env);
  const rl = await rateLimit(env, `order-intent:${ctx.ip_hash || "anon"}`, { limit: 6, windowSeconds: 60 });
  if (!rl.ok) {
    return reply(request, env, { ok: false, message: "Too many submissions. Please try again shortly." }, 429, {
      "retry-after": String(rl.retryAfter || 60),
    });
  }

  const db = getDb(env);
  if (!db || typeof db.batch !== "function") return serviceUnavailable(request, env);

  const fingerprintInput = { ...value, idempotencyKey: undefined };
  delete fingerprintInput.idempotencyKey;
  const [keyHash, fingerprint] = await Promise.all([
    value.idempotencyKey ? sha256Hex(value.idempotencyKey) : Promise.resolve(null),
    sha256Hex(JSON.stringify(fingerprintInput)),
  ]);

  try {
    const existing = await existingIntent(db, keyHash);
    if (existing) {
      if (existing.request_fingerprint && existing.request_fingerprint !== fingerprint) {
        return reply(request, env, {
          ok: false,
          message: "This idempotency key was already used for a different request.",
        }, 409);
      }
      return accepted(request, env, existing.public_id);
    }
  } catch (error) {
    console.error("order-intent idempotency lookup failed:", error && error.message);
    return serviceUnavailable(request, env);
  }

  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const pid = publicId(ID_PREFIX.order_intents);
    const now = new Date().toISOString();
    try {
      const statements = [
        intentInsertStatement(db, pid, value, ctx, keyHash, fingerprint, now),
        ...value.items.map((item, index) => itemInsertStatement(db, pid, item, index + 1, now)),
        eventInsertStatement(db, env, pid, value, now),
      ];
      // Cloudflare D1 batch executes these statements sequentially as one
      // transaction, so an item/event failure cannot leave a partial intent.
      await db.batch(statements);
      return accepted(request, env, pid);
    } catch (error) {
      lastError = error;
      if (keyHash) {
        try {
          const existing = await existingIntent(db, keyHash);
          if (existing) {
            if (existing.request_fingerprint && existing.request_fingerprint !== fingerprint) {
              return reply(request, env, {
                ok: false,
                message: "This idempotency key was already used for a different request.",
              }, 409);
            }
            return accepted(request, env, existing.public_id);
          }
        } catch {
          // Preserve the original persistence error for the 503 log below.
        }
      }
      if (!isUniqueError(error)) break;
    }
  }

  console.error("order-intent persistence failed:", lastError && lastError.message);
  return serviceUnavailable(request, env);
}
