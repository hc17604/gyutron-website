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

/* --------------------------------- ids ------------------------------------ */
await test("publicId format", () => {
  assert.match(publicId("RFQ"), /^RFQ-\d{8}-[0-9A-Z]{6}$/);
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

/* --------------------------------- report --------------------------------- */
console.log(`\n  smoke: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  for (const f of failures) console.error("  ✗ " + f);
  process.exit(1);
} else {
  console.log("  ✓ all platform smoke tests passed\n");
}
