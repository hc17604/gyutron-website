/**
 * Offline storefront regression gate.
 *
 * Run after `python tools/build_shop.py`. The gate proves that the original
 * storefront structure and behavior stay pinned, intentional shared styling is
 * mirrored exactly, checkout assets are page-scoped, and the order-request
 * boundary does not trust client prices or payment data.
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const baselineRef = "d5315f9";
const backendRef = "ac6e383";
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const bytes = (relative) => fs.readFileSync(path.join(root, relative));
const sha256 = (relative) => crypto.createHash("sha256").update(bytes(relative)).digest("hex");
const git = (args, encoding = "utf8") => execFileSync("git", args, { cwd: root, encoding });
const gitText = (ref, relative) => git(["show", `${ref}:${relative}`]);
const gitBlob = (ref, relative) => git(["rev-parse", `${ref}:${relative}`]).trim();
const worktreeBlob = (relative) => git(["hash-object", `--path=${relative}`, relative]).trim();

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

function baselineEqual(relative, ref = baselineRef) {
  assert.equal(worktreeBlob(relative), gitBlob(ref, relative), `${relative} drifted from ${ref}`);
}

function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function leafPaths(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key));
}

const templates = fs
  .readdirSync(path.join(root, "templates", "shop"))
  .filter((name) => name.endsWith(".html"))
  .sort();
const nonCheckoutTemplates = templates.filter((name) => name !== "checkout.html");
const localeRoots = { en: "shop", de: "de/shop", ja: "ja/shop" };
const allOutputRoots = ["shop", "de/shop", "ja/shop", "public/shop", "public/de/shop", "public/ja/shop"];
const expectedSkus = [
  "GY-A55-PRO", "GY-A80-ULTRA", "GY-CAL-GRID", "GY-CV220-INLINE",
  "GY-FB200", "GY-LB220", "GY-LDOME120", "GY-MG50", "GY-OPT25",
  "GY-PR12", "GY-PS60", "GY-R70-LONGRANGE", "GY-S240W", "GY-S300-DPM",
  "GY-V240-COLOR", "GY-V3D150",
].sort();

check("shop template inventory", () => {
  assert.equal(templates.length, 16);
  assert.equal(nonCheckoutTemplates.length, 15);
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

check("non-checkout templates match the original baseline", () => {
  for (const page of nonCheckoutTemplates) baselineEqual(`templates/shop/${page}`);
});

check("non-checkout generated HTML matches the original baseline", () => {
  for (const outputRoot of allOutputRoots) {
    for (const page of nonCheckoutTemplates) baselineEqual(`${outputRoot}/${page}`);
  }
});

check("shared partials match the original baseline", () => {
  const partials = git(["ls-tree", "-r", "--name-only", baselineRef, "templates/_partials"])
    .trim().split(/\r?\n/).filter(Boolean);
  assert.equal(partials.length, 5, "unexpected shared partial inventory");
  for (const relative of partials) baselineEqual(relative);
});

check("global storefront styling is mirrored while behavior and locale dictionaries stay pinned", () => {
  const canonicalCss = sha256("shop/shop.css");
  for (const outputRoot of allOutputRoots) {
    assert.equal(sha256(`${outputRoot}/shop.css`), canonicalCss, `${outputRoot}/shop.css mirror drift`);
    baselineEqual(`${outputRoot}/shop.js`);
  }
  for (const locale of ["en", "de", "ja"]) baselineEqual(`locales/i18n/${locale}.json`);
  baselineEqual("public/shop-analytics.js");
});

check("backend-safe order-intent files remain pinned", () => {
  for (const relative of [
    "src/api/admin.mjs", "src/api/order-intents.mjs", "src/platform/config.mjs",
    "src/platform/ids.mjs", "src/platform/schemas.mjs", "src/worker.mjs",
    "scripts/smoke-platform.mjs",
  ]) baselineEqual(relative, backendRef);
});

for (const asset of ["checkout.css", "checkout.js"]) {
  const canonical = sha256(`shop/${asset}`);
  for (const outputRoot of allOutputRoots) {
    check(`${asset} ${outputRoot} mirror`, () => {
      assert.equal(sha256(`${outputRoot}/${asset}`), canonical);
    });
  }
}

check("checkout assets load only on checkout pages", () => {
  for (const [locale, localeRoot] of Object.entries(localeRoots)) {
    const prefix = locale === "en" ? "/shop" : `/${locale}/shop`;
    for (const page of templates) {
      const html = read(`${localeRoot}/${page}`);
      const cssCount = occurrences(html, `${prefix}/checkout.css`);
      const jsCount = occurrences(html, `${prefix}/checkout.js`);
      if (page === "checkout.html") {
        assert.equal(cssCount, 1, `${locale} checkout.css count`);
        assert.equal(jsCount, 1, `${locale} checkout.js count`);
        assert.match(html, /data-checkout-root/);
      } else {
        assert.equal(cssCount, 0, `${locale} ${page} loads checkout.css`);
        assert.equal(jsCount, 0, `${locale} ${page} loads checkout.js`);
      }
    }
  }
});

check("checkout HTML and runtime collect no payment credentials", () => {
  const combined = `${read("templates/shop/checkout.html")}\n${read("shop/checkout.js")}`;
  assert.doesNotMatch(combined, /type=["']password["']/i);
  assert.doesNotMatch(combined, /name=["'][^"']*(?:card|cvc|cvv|iban|bankaccount)[^"']*["']/i);
  assert.doesNotMatch(combined, /placeholder=["'][^"']*(?:card number|security code|cvc|cvv)[^"']*["']/i);
  assert.match(combined, /\/api\/order-intents/);
  assert.match(combined, /sanitizedConfiguration/);
  assert.doesNotMatch(combined, /data-demo-form/);
  assert.doesNotMatch(combined, /data-checkout-summary(?:\s|=|>)/);
});

check("checkout CSS is page-scoped, square apart from step circles, and avoids copied palette effects", () => {
  const css = read("shop/checkout.css").replace(/\/\*[\s\S]*?\*\//g, "");
  let selectors = 0;
  for (const match of css.matchAll(/([^{}]+)\{/g)) {
    const prelude = match[1].trim();
    if (!prelude || prelude.startsWith("@")) continue;
    for (const selector of prelude.split(",").map((item) => item.trim()).filter(Boolean)) {
      selectors += 1;
      assert.ok(selector.startsWith(".checkout-page"), `unscoped selector: ${selector}`);
    }
  }
  assert.ok(selectors >= 100, `too few checkout selectors: ${selectors}`);
  let circularStepRadiusCount = 0;
  for (const match of css.matchAll(/border-radius\s*:\s*([^;]+)/gi)) {
    const value = match[1].trim();
    if (value === "50%") {
      circularStepRadiusCount += 1;
      continue;
    }
    assert.match(value, /^0(?:\s+0)*$/, `rounded checkout surface: ${match[1]}`);
  }
  assert.equal(circularStepRadiusCount, 1, "expected exactly one circular checkout step marker rule");
  assert.match(css, /\.checkout-page\s+\.checkout-step__number\s*\{[^}]*border-radius\s*:\s*50%/s);
  assert.doesNotMatch(css, /(?:linear|radial)-gradient|\bcyan\b|\bteal\b|\bneon\b/i);
  for (const color of ["#4b2e83", "#efe8ff"]) assert.ok(css.toLowerCase().includes(color), `missing ${color}`);
  assert.match(css, /prefers-reduced-motion/);
});

check("legacy store dictionary is unchanged and checkout translations have exact parity", () => {
  const currentContext = { window: {} };
  const baselineContext = { window: {} };
  vm.runInNewContext(read("shop/shop-i18n.js"), currentContext, { filename: "shop-i18n.js" });
  vm.runInNewContext(gitText(baselineRef, "shop/shop-i18n.js"), baselineContext, { filename: "baseline-shop-i18n.js" });
  assert.deepEqual(plain(currentContext.window.GYUTRON_SHOP_I18N), plain(baselineContext.window.GYUTRON_SHOP_I18N));
  const catalogSkus = [...read("shop/shop.js").matchAll(/\bsku:\s*["']([^"']+)["']/g)]
    .map((match) => match[1]).sort();
  assert.deepEqual(catalogSkus, expectedSkus, "catalog SKU contract changed");

  const checkout = currentContext.window.GYUTRON_CHECKOUT_I18N;
  assert.ok(checkout?.en && checkout?.de && checkout?.ja, "missing checkout locale block");
  const enKeys = leafPaths(checkout.en).sort();
  assert.equal(enKeys.length, 100, "unexpected checkout translation inventory");
  for (const locale of ["de", "ja"]) assert.deepEqual(leafPaths(checkout[locale]).sort(), enKeys, `${locale} checkout key drift`);
  assert.match(checkout.en["payment.unavailableTitle"], /not connected/i);
  assert.doesNotMatch(`${checkout.de["payment.unavailableTitle"]}${checkout.ja["payment.unavailableTitle"]}`, /\?{4,}|\uFFFD/);
});

check("shop i18n source/public mirrors stay synchronized", () => {
  const canonical = sha256("shop/shop-i18n.js");
  for (const outputRoot of allOutputRoots) assert.equal(sha256(`${outputRoot}/shop-i18n.js`), canonical, outputRoot);
});

check("real checkout payload strips nested client price and payment keys", () => {
  const runtime = read("shop/checkout.js");
  const instrumented = runtime.replace(
    /\n\s*render\(\);\s*\n\}\)\(\);\s*$/,
    "\n    globalThis.__checkoutQa = { payload, sanitizedConfiguration, state };\n})();",
  );
  assert.notEqual(instrumented, runtime, "could not instrument checkout payload");
  const context = {
    window: { GYUTRON_SHOP_LOCALE: "en", GYUTRON_CHECKOUT_I18N: { en: {} } },
    document: { querySelector: () => ({}) },
    location: { pathname: "/checkout" },
  };
  vm.runInNewContext(instrumented, context, { filename: "checkout.js" });
  const output = plain(context.__checkoutQa.payload([{
    product: { sku: "GY-CV220-INLINE", price: 489, total: 489 },
    qty: 1,
    configuration: {
      interface: "GigE",
      unitPrice: 489,
      nested: { total: 489, currency: "USD", card_cvc: "123" },
    },
  }]));
  assert.equal(output.items.length, 1);
  assert.deepEqual(output.items[0], {
    sku: "GY-CV220-INLINE",
    quantity: 1,
    configuration: { interface: "GigE", nested: {} },
  });
  const forbidden = [];
  (function scan(value, prefix = "") {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (/(?:price|total|amount|currency|cost|cents|card|cvc|cvv|bank|iban|swift|routing|payment)/.test(normalized)) forbidden.push(prefix ? `${prefix}.${key}` : key);
      scan(child, prefix ? `${prefix}.${key}` : key);
    }
  })(output);
  assert.deepEqual(forbidden, [], `forbidden payload keys: ${forbidden.join(", ")}`);
});

console.log(`\n  shop smoke: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  for (const failure of failures) console.error(`  FAIL ${failure}`);
  process.exit(1);
}
console.log("  PASS storefront structure, shared-style mirrors, isolated checkout, safety, and i18n contracts\n");
