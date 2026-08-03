/**
 * Offline storefront regression gate.
 *
 * Run after `python tools/build_shop.py`. It only reads the canonical shop
 * sources and their committed locale/public mirrors; it never touches Astro.
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const bytes = (relative) => fs.readFileSync(path.join(root, relative));
const sha256 = (relative) => crypto.createHash("sha256").update(bytes(relative)).digest("hex");

const failures = [];
let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failures.push(`${name}: ${error?.message || error}`);
  }
}

const templates = fs
  .readdirSync(path.join(root, "templates", "shop"))
  .filter((name) => name.endsWith(".html"))
  .sort();

const localeRoots = {
  en: "shop",
  de: "de/shop",
  ja: "ja/shop",
};

const expectedSkus = [
  "GY-A55-PRO",
  "GY-A80-ULTRA",
  "GY-CAL-GRID",
  "GY-CV220-INLINE",
  "GY-FB200",
  "GY-LB220",
  "GY-LDOME120",
  "GY-MG50",
  "GY-OPT25",
  "GY-PR12",
  "GY-PS60",
  "GY-R70-LONGRANGE",
  "GY-S240W",
  "GY-S300-DPM",
  "GY-V240-COLOR",
  "GY-V3D150",
].sort();

check("shop template inventory", () => {
  assert.equal(templates.length, 16);
  for (const required of ["index.html", "products.html", "product.html", "cart.html", "checkout.html", "account.html"]) {
    assert.ok(templates.includes(required), `missing ${required}`);
  }
});

for (const [locale, localeRoot] of Object.entries(localeRoots)) {
  for (const page of templates) {
    const sourcePath = `${localeRoot}/${page}`;
    const publicPath = `public/${localeRoot}/${page}`;
    check(`${locale} ${page} source/public mirror`, () => {
      assert.equal(sha256(sourcePath), sha256(publicPath));
    });
    check(`${locale} ${page} rendered UTF-8`, () => {
      const html = read(sourcePath);
      assert.match(html, new RegExp(`<html\\s+lang=["']${locale}["']`, "i"));
      assert.ok(!html.includes("{{"), "unresolved template token");
      assert.ok(!html.includes("\uFFFD"), "Unicode replacement character found");
      assert.ok(!/\?{4,}/.test(html), "four or more question marks found");
    });
  }
}

for (const asset of ["shop.css", "shop.js", "shop-i18n.js"]) {
  const canonical = sha256(`shop/${asset}`);
  for (const localeRoot of Object.values(localeRoots)) {
    check(`${asset} ${localeRoot} source mirror`, () => {
      assert.equal(sha256(`${localeRoot}/${asset}`), canonical);
    });
    check(`${asset} ${localeRoot} public mirror`, () => {
      assert.equal(sha256(`public/${localeRoot}/${asset}`), canonical);
    });
  }
}

check("checkout and account are honest mount shells", () => {
  for (const localeRoot of Object.values(localeRoots)) {
    const checkout = read(`${localeRoot}/checkout.html`);
    const account = read(`${localeRoot}/account.html`);
    assert.match(checkout, /data-checkout-root/);
    assert.doesNotMatch(checkout, /type=["'](?:password|credit-card)["']/i);
    assert.doesNotMatch(checkout, /name=["'](?:card|cardNumber|cvc|cvv)["']/i);
    assert.match(account, /data-account-root/);
    assert.doesNotMatch(account, /type=["']password["']/i);
  }
});

check("runtime keeps the storefront contract", () => {
  const runtime = read("shop/shop.js");
  assert.match(runtime, /gyutronShopCart/);
  assert.match(runtime, /\/api\/order-intents/);
  assert.match(runtime, /APPLICATION_FILTER_SKUS/);
  assert.match(runtime, /application/);
  assert.match(runtime, /location\.search/);
  assert.match(runtime, /location\.hash/);
});

check("application entry points use locale-independent filters", () => {
  const home = read("templates/shop/index.html");
  const products = read("templates/shop/products.html");
  for (const application of ["inspection", "robotics", "traceability", "warehouse"]) {
    assert.match(home, new RegExp(`application=${application}`), `missing ${application} entry point`);
  }
  assert.match(products, /application=inspection/);
  assert.doesNotMatch(`${home}\n${products}`, /[?&]q=(?:inspection|robot|traceability|warehouse)(?:["&]|$)/);
});

check("shop lead forms have safe POST fallbacks and associated labels", () => {
  const formContracts = {
    "request-quote.html": "/api/rfq",
    "contact-engineer.html": "/api/support",
    "contact-us.html": "/api/contact",
  };
  for (const [page, action] of Object.entries(formContracts)) {
    const html = read(`templates/shop/${page}`);
    assert.match(html, new RegExp(`<form[^>]+method=["']post["'][^>]+action=["']${action}["']`, "i"));
    const controlIds = [...html.matchAll(/<(?:input|select|textarea)\b[^>]*\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
    assert.ok(controlIds.length >= 5, `${page} missing stable control ids`);
    for (const id of controlIds) {
      assert.match(html, new RegExp(`<label[^>]+for=["']${id}["']`, "i"), `${page} missing label for ${id}`);
    }
  }
  const analytics = read("public/shop-analytics.js");
  for (const endpoint of ["/api/rfq", "/api/support", "/api/contact"]) assert.ok(analytics.includes(endpoint));
  assert.match(analytics, /IS_CONTACT/);
});

function leafPaths(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key));
}

check("runtime i18n has complete EN/DE/JA keys", () => {
  const context = { window: {} };
  vm.runInNewContext(read("shop/shop-i18n.js"), context, { filename: "shop-i18n.js" });
  const catalog = context.window.GYUTRON_SHOP_I18N;
  assert.ok(catalog && catalog.en && catalog.de && catalog.ja, "missing locale block");
  const catalogSkus = Array.from(catalog.catalog || [], (product) => product.sku).sort();
  assert.deepEqual(catalogSkus, expectedSkus, "catalog SKU contract changed");
  const enKeys = new Set(leafPaths(catalog.en));
  for (const locale of ["de", "ja"]) {
    const localeKeys = new Set(leafPaths(catalog[locale]));
    const missing = [...enKeys].filter((key) => !localeKeys.has(key));
    assert.deepEqual(missing, [], `${locale} missing ${missing.slice(0, 12).join(", ")}`);
  }
});

check("brand palette and industrial geometry tokens", () => {
  const css = read("shop/shop.css").toLowerCase();
  for (const color of ["#4b2e83", "#8a63d2", "#efe8ff"]) assert.ok(css.includes(color), `missing ${color}`);
  for (const forbidden of ["#1f7a58", "cyan", "teal", "neon"]) assert.ok(!css.includes(forbidden), `forbidden ${forbidden}`);
});

console.log(`\n  shop smoke: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  for (const failure of failures) console.error(`  FAIL ${failure}`);
  process.exit(1);
}
console.log("  PASS storefront source, locale, mirror, safety, and i18n contracts\n");
