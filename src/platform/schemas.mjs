/**
 * Schemas — the single source of truth for form fields, status vocabularies, and
 * which columns the repository/admin/Data API may touch. Both the form handlers
 * and `docs/data-api-contract.md` derive from this file; keep them in sync here.
 *
 * Each form field: { column, required?, min?, max?, email?, lower?, enum? }
 *   column = the snake_case DB column the camelCase form field maps to.
 */
import { ID_PREFIX } from "./ids.mjs";

/* ----------------------------- vocabularies ------------------------------- */

export const STATUS_VALUES = Object.freeze({
  leads: ["new", "reviewing", "replied", "closed", "spam"],
  rfqs: ["new", "reviewing", "waiting_for_info", "quoted", "won", "lost", "spam"],
  support_requests: ["new", "reviewing", "replied", "closed", "spam"],
  download_requests: ["new", "approved", "rejected", "fulfilled", "spam"],
  order_intents: ["pending_review", "reviewing", "waiting_for_info", "ready_for_quote", "declined", "closed", "spam"],
});

export const ISSUE_TYPES = ["defect", "how_to", "rma", "integration", "documentation", "other"];
export const ACCESS_TYPES = ["public", "gated", "manual_review"];
export const ORDER_INTENT_REQUEST_TYPES = ["order_request", "proforma_invoice"];

/** Storefront catalog allow-list. Order intents never accept an arbitrary SKU. */
export const ORDER_INTENT_SKUS = Object.freeze([
  "GY-CV220-INLINE",
  "GY-LB220",
  "GY-PR12",
  "GY-S240W",
  "GY-A55-PRO",
  "GY-R70-LONGRANGE",
  "GY-OPT25",
  "GY-FB200",
  "GY-MG50",
  "GY-CAL-GRID",
  "GY-V240-COLOR",
  "GY-V3D150",
  "GY-LDOME120",
  "GY-PS60",
  "GY-S300-DPM",
  "GY-A80-ULTRA",
]);

/** Honeypot field name shared by every form (matches the live contact form). */
export const HONEYPOT_FIELD = "website";

/* ------------------------- shared meta (all forms) ------------------------ */
/** Accepted on every form; read from camelCase OR snake_case in the payload. */
export const META_FIELDS = Object.freeze({
  sourcePage: { column: "source_page", max: 300 },
  locale: { column: "locale", max: 10 },
  utmSource: { column: "utm_source", max: 150 },
  utmMedium: { column: "utm_medium", max: 150 },
  utmCampaign: { column: "utm_campaign", max: 150 },
});

/* ------------------------------ form specs -------------------------------- */

export const FORMS = Object.freeze({
  rfq: {
    table: "rfqs",
    idPrefix: ID_PREFIX.rfqs,
    eventType: "rfq.created",
    entityType: "rfq",
    fields: {
      name: { column: "name", required: true, max: 200 },
      company: { column: "company", max: 200 },
      email: { column: "email", required: true, max: 320, email: true, lower: true },
      phone: { column: "phone", max: 60 },
      country: { column: "country", max: 100 },
      productCategory: { column: "product_category", max: 200 },
      productModel: { column: "product_model", max: 200 },
      industry: { column: "industry", max: 200 },
      quantity: { column: "quantity", max: 100 },
      applicationDescription: { column: "application_description", required: true, min: 12, max: 5000 },
      timeline: { column: "timeline", max: 200 },
    },
  },
  support: {
    table: "support_requests",
    idPrefix: ID_PREFIX.support_requests,
    eventType: "support.created",
    entityType: "support_request",
    fields: {
      name: { column: "name", required: true, max: 200 },
      company: { column: "company", max: 200 },
      email: { column: "email", required: true, max: 320, email: true, lower: true },
      productModel: { column: "product_model", max: 200 },
      serialNumber: { column: "serial_number", max: 200 },
      issueType: { column: "issue_type", max: 50, enum: ISSUE_TYPES },
      message: { column: "message", required: true, min: 8, max: 5000 },
    },
  },
  download: {
    table: "download_requests",
    idPrefix: ID_PREFIX.download_requests,
    eventType: "download.requested",
    entityType: "download_request",
    fields: {
      name: { column: "name", required: true, max: 200 },
      company: { column: "company", max: 200 },
      email: { column: "email", required: true, max: 320, email: true, lower: true },
      country: { column: "country", max: 100 },
      requestedFile: { column: "requested_file", required: true, max: 300 },
      productModel: { column: "product_model", max: 200 },
      // NOTE: access_type is set server-side by file policy, NOT by the client,
      // so a requester can't self-grant `public` access. Phase 1 default below.
    },
  },
});

/* --------------------- repository column allow-lists ---------------------- */
/** Every column the app may INSERT, per table. Guards the dynamic INSERT builder. */
export const TABLE_COLUMNS = Object.freeze({
  leads: [
    "public_id", "type", "name", "company", "email", "phone", "country",
    "product_interest", "message", "source_page", "locale",
    "utm_source", "utm_medium", "utm_campaign", "user_agent", "ip_hash",
    "ip_country", "status", "internal_note", "created_at", "updated_at",
  ],
  rfqs: [
    "public_id", "name", "company", "email", "phone", "country",
    "product_category", "product_model", "industry", "quantity",
    "application_description", "timeline", "source_page", "locale",
    "utm_source", "utm_medium", "utm_campaign", "user_agent", "ip_hash",
    "ip_country", "status", "internal_note", "created_at", "updated_at",
  ],
  support_requests: [
    "public_id", "name", "company", "email", "product_model", "serial_number",
    "issue_type", "message", "source_page", "locale",
    "utm_source", "utm_medium", "utm_campaign", "user_agent", "ip_hash",
    "ip_country", "status", "internal_note", "created_at", "updated_at",
  ],
  download_requests: [
    "public_id", "name", "company", "email", "country", "requested_file",
    "product_model", "access_type", "source_page", "locale",
    "utm_source", "utm_medium", "utm_campaign", "user_agent", "ip_hash",
    "ip_country", "status", "internal_note", "created_at", "updated_at",
  ],
  order_intents: [
    "public_id", "idempotency_key_hash", "request_fingerprint", "request_type",
    "contact_name", "contact_department", "company", "email", "phone",
    "shipping_recipient", "shipping_company", "shipping_phone",
    "shipping_address_line1", "shipping_address_line2", "shipping_city",
    "shipping_region", "shipping_postal_code", "shipping_country",
    "billing_same_as_shipping", "billing_recipient", "billing_company", "billing_phone",
    "billing_address_line1", "billing_address_line2", "billing_city",
    "billing_region", "billing_postal_code", "billing_country",
    "procurement_project_name", "procurement_purchase_order", "procurement_tax_id",
    "procurement_invoice_info", "procurement_notes", "item_count", "source_page", "locale",
    "user_agent", "ip_hash", "ip_country", "status", "internal_note", "created_at", "updated_at",
  ],
  order_intent_items: [
    "order_intent_id", "line_number", "sku", "quantity", "configuration_json", "created_at",
  ],
  events: ["event_id", "event_type", "entity_type", "entity_id", "source", "payload_json", "created_at"],
  api_keys: ["public_id", "key_hash", "name", "scope", "status", "created_at", "last_used_at"],
});

/** Columns the admin UI may UPDATE, per table. Guards the dynamic UPDATE builder. */
export const UPDATABLE_COLUMNS = Object.freeze({
  leads: ["status", "internal_note", "updated_at"],
  rfqs: ["status", "internal_note", "updated_at"],
  support_requests: ["status", "internal_note", "updated_at"],
  download_requests: ["status", "internal_note", "access_type", "updated_at"],
  order_intents: ["status", "internal_note", "updated_at"],
});

/* --------------------- Data API safe projections -------------------------- */
/**
 * Columns the read-only Data API returns. Deliberately EXCLUDES `id` (internal
 * cursor — exposed via pagination only), `ip_hash`, `user_agent`, and
 * `internal_note` (admin-only). PII like name/email IS returned because the
 * authorized consumer (Agent Workspace) needs it for follow-up reporting.
 */
export const API_FIELDS = Object.freeze({
  leads: [
    "public_id", "type", "name", "company", "email", "phone", "country",
    "product_interest", "message", "source_page", "locale",
    "utm_source", "utm_medium", "utm_campaign", "ip_country", "status",
    "created_at", "updated_at",
  ],
  rfqs: [
    "public_id", "name", "company", "email", "phone", "country",
    "product_category", "product_model", "industry", "quantity",
    "application_description", "timeline", "source_page", "locale",
    "utm_source", "utm_medium", "utm_campaign", "ip_country", "status",
    "created_at", "updated_at",
  ],
  support_requests: [
    "public_id", "name", "company", "email", "product_model", "serial_number",
    "issue_type", "message", "source_page", "locale",
    "utm_source", "utm_medium", "utm_campaign", "ip_country", "status",
    "created_at", "updated_at",
  ],
  download_requests: [
    "public_id", "name", "company", "email", "country", "requested_file",
    "product_model", "access_type", "source_page", "locale",
    "utm_source", "utm_medium", "utm_campaign", "ip_country", "status",
    "created_at", "updated_at",
  ],
  events: ["event_id", "event_type", "entity_type", "entity_id", "source", "payload_json", "created_at"],
});

/** Maps a Data API resource path segment → table name. */
export const API_RESOURCES = Object.freeze({
  leads: "leads",
  rfqs: "rfqs",
  "support-requests": "support_requests",
  "download-requests": "download_requests",
  events: "events",
});
