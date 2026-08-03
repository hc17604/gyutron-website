/**
 * Offline smoke test for the backend platform layer. No wrangler/D1/network — runs
 * the pure logic + a mock D1 so the injection defenses, validation, auth, envelopes,
 * CSV, id format and product normalization are all exercised.
 *
 *   node scripts/smoke-platform.mjs
 */
import assert from "node:assert";

import { publicId, eventId } from "../src/platform/ids.mjs";
import { validateForm, normalizeMeta, isHoneypotTripped } from "../src/platform/validate.mjs";
import { FORMS } from "../src/platform/schemas.mjs";
import { toCsv } from "../src/platform/csv.mjs";
import { sha256Hex, timingSafeEqual, hmacHex } from "../src/platform/security/hash.mjs";
import { extractApiKey, authenticate, scopeAllows } from "../src/platform/security/auth.mjs";
import { insert, list, updateByPublicId, project } from "../src/platform/db/repository.mjs";
import { formOk, apiData, apiError } from "../src/platform/response.mjs";
import { handleProductsApi } from "../src/api/products.mjs";
import { findManifestEntry, issueDownload, handleDownload } from "../src/api/downloads.mjs";
import {
  findForbiddenSubmissionField,
  handleOrderIntent,
  validateOrderIntentPayload,
} from "../src/api/order-intents.mjs";
import worker from "../src/worker.mjs";

let passed = 0;
const failures = [];
async function test(name, fn) {
  try {
    await fn();
    passed++;
  } catch (e) {
    failures.push(`${name}: ${e && e.message}`);
  }
}

function mockDb() {
  const calls = [];
  const db = {
    calls,
    __rows: [],
    __first: null,
    prepare(sql) {
      const st = { sql, binds: [] };
      st.bind = (...args) => {
        st.binds = args;
        return st;
      };
      st.run = async () => {
        calls.push({ sql, binds: st.binds });
        return { success: true, meta: { changes: 1 } };
      };
      st.all = async () => {
        calls.push({ sql, binds: st.binds });
        return { results: db.__rows };
      };
      st.first = async () => {
        calls.push({ sql, binds: st.binds });
        return db.__first;
      };
      return st;
    },
  };
  return db;
}

function validOrderIntent(overrides = {}) {
  return {
    contact: {
      name: "Jane Buyer",
      company: "ACME Automation",
      email: "Jane.Buyer@Example.com",
      phone: "+65 6123 4567",
      department: "Procurement",
    },
    shipping: {
      recipient: "Receiving Team",
      company: "ACME Automation",
      phone: "+65 6123 4567",
      address1: "10 Industrial Avenue",
      address2: "Dock 3",
      city: "Singapore",
      region: "Singapore",
      postalCode: "408600",
      country: "SG",
    },
    billing: {
      sameAsShipping: false,
      recipient: "Accounts Payable",
      company: "ACME Automation",
      phone: "+65 6123 4000",
      address1: "20 Finance Street",
      city: "Singapore",
      postalCode: "048000",
      country: "SG",
    },
    procurement: {
      projectName: "Line 4 inspection",
      purchaseOrder: "PO-DRAFT-42",
      taxId: "SG-TAX-42",
      invoiceInfo: "Address the pro forma invoice to Accounts Payable.",
      notes: "Please confirm lead time and configuration.",
    },
    requestType: "proforma_invoice",
    items: [
      { sku: "GY-CV220-INLINE", quantity: 2, configuration: { interface: "GigE" } },
      { sku: "GY-LB220", quantity: 4, configuration: "White backlight" },
    ],
    locale: "en",
    sourcePage: "/checkout",
    idempotencyKey: "018fcff1-7eb1-7fc9-8e22-aaaaaaaaaaaa",
    website: "",
    ...overrides,
  };
}

function mockOrderIntentDb() {
  const state = { batches: [], byKeyHash: new Map(), failBatch: null };
  const db = {
    state,
    prepare(sql) {
      const statement = { sql, binds: [] };
      statement.bind = (...args) => {
        statement.binds = args;
        return statement;
      };
      statement.first = async () => {
        if (sql.includes("WHERE idempotency_key_hash = ?")) {
          return state.byKeyHash.get(statement.binds[0]) || null;
        }
        return null;
      };
      statement.all = async () => ({ results: [] });
      return statement;
    },
    async batch(statements) {
      state.batches.push(statements);
      if (state.failBatch) throw new Error(state.failBatch);
      const intent = statements.find((statement) => statement.sql.startsWith("INSERT INTO order_intents ("));
      const columns = intent.sql.match(/^INSERT INTO order_intents \(([^)]+)\)/)[1].split(", ");
      const row = Object.fromEntries(columns.map((column, index) => [column, intent.binds[index]]));
      if (row.idempotency_key_hash) {
        state.byKeyHash.set(row.idempotency_key_hash, {
          public_id: row.public_id,
          status: row.status,
          request_fingerprint: row.request_fingerprint,
        });
      }
      return statements.map(() => ({ success: true }));
    },
  };
  return db;
}

function orderRequest(payload, headers = {}) {
  return new Request("https://shop.gyutron.com/api/order-intents", {
    method: "POST",
    headers: {
      origin: "https://shop.gyutron.com",
      "content-type": "application/json",
      "cf-connecting-ip": "203.0.113.42",
      "cf-ipcountry": "SG",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
}

/* --------------------------------- ids ------------------------------------ */
await test("publicId format", () => {
  assert.match(publicId("RFQ"), /^RFQ-\d{8}-[0-9A-Z]{6}$/);
  assert.match(publicId("OI"), /^OI-\d{8}-[0-9A-Z]{6}$/);
  assert.match(eventId(), /^EVT-\d{8}-[0-9A-Z]{10}$/);
  assert.notStrictEqual(publicId("RFQ"), publicId("RFQ")); // random tail differs
});

/* ------------------------------ validation -------------------------------- */
await test("validateForm rfq valid", () => {
  const v = validateForm(FORMS.rfq, {
    name: "Jane Doe",
    email: "Jane@Example.com",
    applicationDescription: "Inline vision inspection on our SMT reflow line.",
  });
  assert.equal(v.ok, true);
  assert.equal(v.value.name, "Jane Doe");
  assert.equal(v.value.email, "jane@example.com"); // lowercased
});

await test("validateForm rfq invalid", () => {
  const v = validateForm(FORMS.rfq, { email: "nope", applicationDescription: "short" });
  assert.equal(v.ok, false);
  assert.ok(v.errors.name);
  assert.ok(v.errors.email);
  assert.ok(v.errors.applicationDescription);
});

await test("validateForm support enum", () => {
  const v = validateForm(FORMS.support, {
    name: "x",
    email: "a@b.com",
    message: "need help please",
    issueType: "not-a-type",
  });
  assert.equal(v.ok, false);
  assert.ok(v.errors.issueType);
});

await test("normalizeMeta camel+snake", () => {
  const m = normalizeMeta({ utm_source: "google", utmCampaign: "spring", source_page: "/p", locale: "de" });
  assert.equal(m.utm_source, "google");
  assert.equal(m.utm_campaign, "spring");
  assert.equal(m.source_page, "/p");
  assert.equal(m.locale, "de");
});

await test("honeypot", () => {
  assert.equal(isHoneypotTripped({ website: "bot.example" }), true);
  assert.equal(isHoneypotTripped({ website: "" }), false);
});

await test("order intent validation accepts enterprise fields", () => {
  const result = validateOrderIntentPayload(validOrderIntent());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.value.contact.email, "jane.buyer@example.com");
  assert.equal(result.value.contact.department, "Procurement");
  assert.equal(result.value.shipping.recipient, "Receiving Team");
  assert.equal(result.value.billing.company, "ACME Automation");
  assert.equal(result.value.procurement.projectName, "Line 4 inspection");
  assert.equal(result.value.procurement.invoiceInfo, "Address the pro forma invoice to Accounts Payable.");
  assert.equal(result.value.items[0].sku, "GY-CV220-INLINE");
  assert.deepEqual(result.value.items[0].configuration, { interface: "GigE" });
});

await test("order intent validation enforces required fields, SKU, and quantity", () => {
  const payload = validOrderIntent();
  payload.contact.company = "";
  payload.contact.email = "not-an-email";
  payload.shipping.city = "";
  payload.items[0].sku = "GY-NOT-IN-CATALOG";
  payload.items[0].quantity = 1000;
  const result = validateOrderIntentPayload(payload);
  assert.equal(result.ok, false);
  assert.ok(result.errors["contact.company"]);
  assert.ok(result.errors["contact.email"]);
  assert.ok(result.errors["shipping.city"]);
  assert.ok(result.errors["items[0].sku"]);
  assert.ok(result.errors["items[0].quantity"]);
});

await test("order intent rejects nested payment and client price fields", () => {
  const payment = validOrderIntent();
  payment.procurement.bankAccount = "do-not-store";
  assert.deepEqual(findForbiddenSubmissionField(payment), {
    kind: "payment",
    path: "procurement.bankAccount",
  });
  assert.equal(validateOrderIntentPayload(payment).ok, false);

  const card = validOrderIntent();
  card.items[0].configuration = { card_cvc: "123" };
  assert.equal(findForbiddenSubmissionField(card).kind, "payment");
  assert.equal(validateOrderIntentPayload(card).ok, false);

  const paymentInNotes = validOrderIntent();
  paymentInNotes.procurement.notes = "Bank account: 12345678";
  assert.equal(findForbiddenSubmissionField(paymentInNotes).kind, "payment");
  assert.equal(validateOrderIntentPayload(paymentInNotes).ok, false);

  const pricing = validOrderIntent();
  pricing.items[0].configuration = { lineTotal: 123 };
  assert.deepEqual(findForbiddenSubmissionField(pricing), {
    kind: "pricing",
    path: "items[0].configuration.lineTotal",
  });
  assert.equal(validateOrderIntentPayload(pricing).ok, false);
});

await test("order intent rejects unlabeled PAN and IBAN values", () => {
  const barePan = validOrderIntent();
  barePan.procurement.notes = "4111111111111111";
  assert.deepEqual(findForbiddenSubmissionField(barePan), {
    kind: "payment",
    path: "procurement.notes",
  });
  assert.equal(validateOrderIntentPayload(barePan).ok, false);

  const spacedPan = validOrderIntent();
  spacedPan.procurement.invoiceInfo = "4111 1111 1111 1111";
  assert.deepEqual(findForbiddenSubmissionField(spacedPan), {
    kind: "payment",
    path: "procurement.invoiceInfo",
  });
  assert.equal(validateOrderIntentPayload(spacedPan).ok, false);

  const bareIban = validOrderIntent();
  bareIban.procurement.purchaseOrder = "GB82WEST12345698765432";
  assert.deepEqual(findForbiddenSubmissionField(bareIban), {
    kind: "payment",
    path: "procurement.purchaseOrder",
  });
  assert.equal(validateOrderIntentPayload(bareIban).ok, false);

  const numericPan = validOrderIntent();
  numericPan.contact.phone = 4111111111111111;
  assert.deepEqual(findForbiddenSubmissionField(numericPan), {
    kind: "payment",
    path: "contact.phone",
  });
  assert.equal(validateOrderIntentPayload(numericPan).ok, false);
});

await test("order intent scans configuration and sourcePage strings for payment data", () => {
  const configuration = validOrderIntent();
  configuration.items[0].configuration = {
    interface: "GigE",
    reference: "4111 1111 1111 1111",
  };
  assert.deepEqual(findForbiddenSubmissionField(configuration), {
    kind: "payment",
    path: "items[0].configuration.reference",
  });
  assert.equal(validateOrderIntentPayload(configuration).ok, false);

  const numericConfiguration = validOrderIntent();
  numericConfiguration.items[0].configuration = {
    interface: "GigE",
    serial: 4111111111111111,
  };
  assert.deepEqual(findForbiddenSubmissionField(numericConfiguration), {
    kind: "payment",
    path: "items[0].configuration.serial",
  });
  assert.equal(validateOrderIntentPayload(numericConfiguration).ok, false);

  const unsafeNumericConfiguration = validOrderIntent();
  unsafeNumericConfiguration.items[0].configuration = {
    numericReference: 9007199254740992,
  };
  assert.equal(findForbiddenSubmissionField(unsafeNumericConfiguration).kind, "payment");
  assert.equal(validateOrderIntentPayload(unsafeNumericConfiguration).ok, false);

  const sourcePage = validOrderIntent({
    sourcePage: "/checkout/reference/GB82WEST12345698765432",
  });
  assert.deepEqual(findForbiddenSubmissionField(sourcePage), {
    kind: "payment",
    path: "sourcePage",
  });
  assert.equal(validateOrderIntentPayload(sourcePage).ok, false);
});

await test("order intent accepts benign phone, PO, and checksum-invalid numeric strings", () => {
  const benign = validOrderIntent();
  benign.contact.phone = "+65 6123 4567";
  benign.procurement.purchaseOrder = "PO-2026-4111-1111-1111-1112";
  benign.items[0].configuration = {
    interface: "GigE",
    numericReference: "4111 1111 1111 1112",
    serial: "SN-2026-000123456789",
    shortNumericReference: 202608030001,
  };
  benign.sourcePage = "/checkout/reference/202608030001";
  assert.equal(findForbiddenSubmissionField(benign), null);
  const result = validateOrderIntentPayload(benign);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
});

/* ----------------------------- repository --------------------------------- */
await test("insert whitelists columns + parameterizes", async () => {
  const db = mockDb();
  await insert(db, "leads", { name: "A", company: "B", evil_col: "x", skip: undefined });
  const c = db.calls[0];
  assert.match(c.sql, /^INSERT INTO leads \(name, company\) VALUES \(\?, \?\)$/);
  assert.deepEqual(c.binds, ["A", "B"]);
});

await test("insert rejects unknown table", async () => {
  await assert.rejects(() => insert(mockDb(), "users; DROP TABLE", { a: 1 }));
});

await test("list builds filtered query + cursor", async () => {
  const db = mockDb();
  db.__rows = [{ id: 9, public_id: "LEAD-1" }];
  const r = await list(db, "leads", { select: ["public_id"], cursor: 3, since: "2026-01-01", status: "new", limit: 10 });
  const c = db.calls[0];
  assert.match(c.sql, /WHERE id > \? AND created_at >= \? AND status = \?/);
  assert.match(c.sql, /ORDER BY id ASC LIMIT \?$/);
  assert.deepEqual(c.binds, [3, "2026-01-01", "new", 10]);
  assert.equal(r.nextCursor, null); // 1 row < limit 10
});

await test("update whitelists patch columns", async () => {
  const db = mockDb();
  await updateByPublicId(db, "leads", "LEAD-1", { status: "replied", internal_note: "ok", evil: "x" });
  const c = db.calls[0];
  assert.match(c.sql, /^UPDATE leads SET status = \?, internal_note = \? WHERE public_id = \?$/);
  assert.deepEqual(c.binds, ["replied", "ok", "LEAD-1"]);
});

await test("order intent admin update allow-list", async () => {
  const db = mockDb();
  await updateByPublicId(db, "order_intents", "OI-1", {
    status: "reviewing",
    internal_note: "Confirm configuration before quoting.",
    request_type: "not-admin-editable",
  });
  const c = db.calls[0];
  assert.match(c.sql, /^UPDATE order_intents SET status = \?, internal_note = \? WHERE public_id = \?$/);
  assert.deepEqual(c.binds, ["reviewing", "Confirm configuration before quoting.", "OI-1"]);
});

await test("project drops fields", () => {
  assert.deepEqual(project({ a: 1, b: 2, c: 3 }, ["a", "c"]), { a: 1, c: 3 });
});

/* -------------------------------- hashing --------------------------------- */
await test("hashing + constant-time compare", async () => {
  assert.equal((await sha256Hex("abc")).length, 64);
  assert.equal((await hmacHex("m", "k")).length, 64);
  assert.equal(await timingSafeEqual("secret", "secret"), true);
  assert.equal(await timingSafeEqual("secret", "Secret"), false);
  assert.equal(await timingSafeEqual("a", null), false);
});

/* ---------------------------------- auth ---------------------------------- */
await test("api key extraction + auth", async () => {
  const req = (h) => new Request("https://x/api/v1/leads", { headers: h });
  assert.equal(extractApiKey(req({ authorization: "Bearer abc" })), "abc");
  assert.equal(extractApiKey(req({ "x-api-key": "xyz" })), "xyz");
  assert.equal(extractApiKey(req({})), null);
  assert.equal((await authenticate(req({ authorization: "Bearer good" }), { DATA_API_KEY: "good" }, null)).ok, true);
  assert.equal((await authenticate(req({ authorization: "Bearer bad" }), { DATA_API_KEY: "good" }, null)).ok, false);
  assert.equal((await authenticate(req({}), {}, null)).ok, false); // no key configured → locked
});

await test("scopes", () => {
  assert.equal(scopeAllows("read:all", "read:leads"), true);
  assert.equal(scopeAllows("read:leads", "read:leads"), true);
  assert.equal(scopeAllows("read:rfqs", "read:leads"), false);
});

/* ------------------------------- responses -------------------------------- */
await test("response envelopes", async () => {
  const ok = await formOk("hi", { id: "RFQ-1" }).json();
  assert.equal(ok.ok, true);
  assert.equal(ok.id, "RFQ-1");

  const data = apiData({}, [{ a: 1 }], { limit: 10, next_cursor: 5 });
  const db = await data.json();
  assert.deepEqual(db.data, [{ a: 1 }]);
  assert.equal(db.pagination.next_cursor, 5);
  assert.ok(db.meta.api_version);

  const errRes = apiError({}, "unauthorized", "no", 401);
  assert.equal(errRes.status, 401);
  assert.equal((await errRes.json()).error.code, "unauthorized");
});

/* ---------------------------------- csv ----------------------------------- */
await test("csv escaping", () => {
  const csv = toCsv([{ a: "x,y", b: 'he said "hi"' }], ["a", "b"]);
  assert.ok(csv.includes('"x,y"'));
  assert.ok(csv.includes('"he said ""hi"""'));
});

/* ----------------------- product catalog normalization -------------------- */
await test("products api normalizes catalog", async () => {
  const res = await handleProductsApi({}, {}, new URL("https://x/api/v1/products?locale=en"), "/products");
  const body = await res.json();
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length > 0);
  const p = body.data[0];
  assert.ok(p.id && p.model && p.category);
  assert.ok("datasheet_url" in p && "shop_url" in p); // reserved fields present
  const ids = body.data.map((x) => x.id);
  assert.equal(ids.length, new Set(ids).size, "no duplicate product ids (redirect aliases skipped)");
});

/* ------------------------- resource center (P5) --------------------------- */
await test("downloads manifest lookup", async () => {
  const entry = await findManifestEntry("ds-gy-a90-touch");
  assert.ok(entry, "seed entry exists");
  assert.equal(entry.category, "datasheets");
  assert.equal(await findManifestEntry("nope-" + Date.now()), null);
  assert.equal(await findManifestEntry(""), null);
});

await test("issueDownload degrades without R2 / by access level", async () => {
  const entry = { id: "x", access_level: "public", r2_key: "datasheets/x.pdf" };
  // no R2 binding → request received, no link
  assert.deepEqual(await issueDownload({}, entry), { status: "received" });
  // R2 + public → direct link
  const pub = await issueDownload({ R2: {} }, entry);
  assert.equal(pub.status, "ready");
  assert.equal(pub.url, "/api/download/x");
  // R2 + gated + secret → tokenized link; without a secret → received
  const gatedEntry = { ...entry, access_level: "gated" };
  const gated = await issueDownload({ R2: {}, IP_HASH_SALT: "s" }, gatedEntry);
  assert.equal(gated.status, "ready");
  assert.match(gated.url, /^\/api\/download\/x\?token=\d+\./);
  assert.deepEqual(await issueDownload({ R2: {} }, gatedEntry), { status: "received" });
  // manual_review never yields a link
  assert.deepEqual(await issueDownload({ R2: {}, IP_HASH_SALT: "s" }, { ...entry, access_level: "manual_review" }), { status: "received" });
});

await test("handleDownload gates by access level + token", async () => {
  const get = (u) => new Request(u);
  const u = (s) => new URL(s);
  // manual_review → 403 even with R2
  const env = { R2: { get: async () => null }, IP_HASH_SALT: "s" };
  const mr = await handleDownload(get("https://x/api/download/ds-gy-a90-touch"), env, {}, u("https://x/api/download/ds-gy-a90-touch"));
  assert.equal(mr.status, 403);
  // unknown id → 404
  const nf = await handleDownload(get("https://x/api/download/zzz"), env, {}, u("https://x/api/download/zzz"));
  assert.equal(nf.status, 404);
});

/* -------------------- storefront order-intent endpoint ------------------- */
await test("order intent endpoint enforces origin, JSON, and body size", async () => {
  const crossOrigin = orderRequest(validOrderIntent(), { origin: "https://evil.example" });
  const forbidden = await handleOrderIntent(crossOrigin, {}, {});
  assert.equal(forbidden.status, 403);
  assert.notEqual(forbidden.headers.get("access-control-allow-origin"), "*");

  const wrongType = new Request("https://shop.gyutron.com/api/order-intents", {
    method: "POST",
    headers: { origin: "https://shop.gyutron.com", "content-type": "text/plain" },
    body: "{}",
  });
  assert.equal((await handleOrderIntent(wrongType, {}, {})).status, 415);

  const tooLarge = orderRequest({ padding: "x".repeat(70_000) });
  assert.equal((await handleOrderIntent(tooLarge, {}, {})).status, 413);

  const localPreflight = new Request("https://shop.gyutron.com/api/order-intents", {
    method: "OPTIONS",
    headers: { origin: "http://localhost:4321" },
  });
  const local = await handleOrderIntent(localPreflight, { ORDER_INTENT_ALLOW_LOCAL_ORIGIN: "true" }, {});
  assert.equal(local.status, 204);
  assert.equal(local.headers.get("access-control-allow-origin"), "http://localhost:4321");
});

await test("order intent endpoint is honest without D1 and honeypot does not persist", async () => {
  const unavailable = await handleOrderIntent(orderRequest(validOrderIntent()), {}, {});
  assert.equal(unavailable.status, 503);
  assert.equal((await unavailable.json()).ok, false);

  const botPayload = validOrderIntent({ website: "bot.example" });
  const bot = await handleOrderIntent(orderRequest(botPayload), {}, {});
  const body = await bot.json();
  assert.equal(bot.status, 202);
  assert.match(body.id, /^OI-\d{8}-[0-9A-Z]{6}$/);
  assert.equal(body.message, "Request received; no charge has been made.");
});

await test("order intent rate limit uses the IP hash, never the raw IP", async () => {
  let limiterKey = "";
  const env = {
    RATE_LIMIT: {
      async get(key) {
        limiterKey = key;
        return "6";
      },
      async put() {},
    },
    IP_HASH_SALT: "test-salt",
  };
  const response = await handleOrderIntent(orderRequest(validOrderIntent()), env, {});
  assert.equal(response.status, 429);
  assert.match(limiterKey, /^rl:order-intent:[0-9a-f]{64}:\d+$/);
  assert.equal(limiterKey.includes("203.0.113.42"), false);
});

await test("order intent persists intent, items, and event in one D1 batch", async () => {
  const db = mockOrderIntentDb();
  const response = await handleOrderIntent(orderRequest(validOrderIntent()), { DB: db, IP_HASH_SALT: "test-salt" }, {});
  const body = await response.json();
  assert.equal(response.status, 202);
  assert.deepEqual(Object.keys(body), ["ok", "id", "status", "message"]);
  assert.equal(body.status, "pending_review");
  assert.equal(body.message, "Request received; no charge has been made.");
  assert.equal(response.headers.get("access-control-allow-origin"), "https://shop.gyutron.com");
  assert.notEqual(response.headers.get("access-control-allow-origin"), "*");

  assert.equal(db.state.batches.length, 1);
  const statements = db.state.batches[0];
  assert.equal(statements.length, 4); // parent + 2 items + event
  const intent = statements.find((statement) => statement.sql.startsWith("INSERT INTO order_intents ("));
  const columns = intent.sql.match(/^INSERT INTO order_intents \(([^)]+)\)/)[1].split(", ");
  const row = Object.fromEntries(columns.map((column, index) => [column, intent.binds[index]]));
  assert.match(row.public_id, /^OI-\d{8}-[0-9A-Z]{6}$/);
  assert.equal(row.status, "pending_review");
  assert.equal(row.item_count, 2);
  assert.equal(row.ip_country, "SG");
  assert.match(row.ip_hash, /^[0-9a-f]{64}$/);
  assert.equal("ip" in row, false); // raw IP is never persisted
  assert.equal(Object.keys(row).some((key) => /price|total|card|bank/i.test(key)), false);
  const event = statements.find((statement) => statement.sql.startsWith("INSERT INTO events"));
  assert.ok(event);
  assert.ok(event.binds.includes("order_intent.created"));
});

await test("order intent idempotency returns the original pending intent", async () => {
  const db = mockOrderIntentDb();
  const env = { DB: db, IP_HASH_SALT: "test-salt" };
  const first = await handleOrderIntent(orderRequest(validOrderIntent()), env, {});
  const firstBody = await first.json();
  const replay = await handleOrderIntent(orderRequest(validOrderIntent()), env, {});
  const replayBody = await replay.json();
  assert.equal(replay.status, 202);
  assert.equal(replayBody.id, firstBody.id);
  assert.equal(db.state.batches.length, 1, "replay must not insert another batch");

  const changed = validOrderIntent();
  changed.procurement.notes = "A different request with the same key.";
  const conflict = await handleOrderIntent(orderRequest(changed), env, {});
  assert.equal(conflict.status, 409);
});

await test("order intent persistence failure returns 503 without claiming success", async () => {
  const db = mockOrderIntentDb();
  db.state.failBatch = "D1_ERROR: no such table: order_intents";
  const payload = validOrderIntent();
  delete payload.idempotencyKey;
  const previousError = console.error;
  console.error = () => {};
  try {
    const response = await handleOrderIntent(orderRequest(payload), { DB: db }, {});
    assert.equal(response.status, 503);
    assert.equal((await response.json()).ok, false);
  } finally {
    console.error = previousError;
  }
});

await test("worker routes shop APIs before static clean-path mapping", async () => {
  const assetCalls = [];
  const env = {
    ASSETS: {
      async fetch(request) {
        assetCalls.push(new URL(request.url));
        return new Response("asset", { headers: { "content-type": "text/plain" } });
      },
    },
  };
  const preflight = new Request("https://shop.gyutron.com/api/order-intents", {
    method: "OPTIONS",
    headers: { origin: "https://shop.gyutron.com" },
  });
  const routed = await worker.fetch(preflight, env, {});
  assert.equal(routed.status, 204);
  assert.equal(assetCalls.length, 0, "API route must not fall through to ASSETS");

  for (const pathname of ["/api/contact", "/api/rfq", "/api/support"]) {
    const response = await worker.fetch(new Request(`https://shop.gyutron.com${pathname}`, {
      method: "POST",
      headers: { origin: "https://shop.gyutron.com", "content-type": "application/json" },
      body: "{}",
    }), env, {});
    assert.equal(response.status, 400, `${pathname} validation response`);
    assert.equal(assetCalls.length, 0, `${pathname} must not fall through to ASSETS`);
  }

  const localRouted = await worker.fetch(new Request("http://localhost:8787/api/order-intents", {
    method: "OPTIONS",
    headers: { origin: "http://localhost:4321" },
  }), { ...env, ORDER_INTENT_ALLOW_LOCAL_ORIGIN: "true" }, {});
  assert.equal(localRouted.status, 204);
  assert.equal(assetCalls.length, 0, "explicit local API route must not fall through to ASSETS");

  const cleanPath = await worker.fetch(new Request("https://shop.gyutron.com/products"), env, {});
  assert.equal(cleanPath.status, 200);
  assert.equal(assetCalls.length, 1);
  assert.equal(assetCalls[0].pathname, "/shop/products");
});

/* --------------------------------- report --------------------------------- */
console.log(`\n  smoke: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  for (const f of failures) console.error("  ✗ " + f);
  process.exit(1);
} else {
  console.log("  ✓ all platform smoke tests passed\n");
}
