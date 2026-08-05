/**
 * Decorative-content icon policy for the brand site and Shop.
 *
 * Product images, payment marks, logos, and the small controls needed to use
 * navigation, search, cart, checkout errors, and disclosure widgets are not
 * decorative content and remain explicitly allowlisted below.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requested = process.argv.includes("--scope")
  ? process.argv[process.argv.indexOf("--scope") + 1]
  : "all";
assert.ok(["all", "brand", "shop"].includes(requested), `unknown scope: ${requested}`);

const failures = [];
let checks = 0;

function check(label, fn) {
  try {
    fn();
    checks += 1;
  } catch (error) {
    failures.push(`${label}: ${error?.message || error}`);
  }
}

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function walk(relative, extensions) {
  const absolute = path.join(root, relative);
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(relative, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) return walk(child, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [child] : [];
  });
}

function iconTags(text) {
  return [...text.matchAll(/<i\b[^>]*>/gi)].map((match) => match[0]);
}

function iconClass(tag) {
  const match = tag.match(/\bclass\s*=\s*["']([^"']+)["']/i);
  return match?.[1].trim().replace(/\s+/g, " ") || "<dynamic-or-missing-class>";
}

function assertAllowedIconTags(relative, allowed) {
  const unexpected = iconTags(read(relative))
    .map(iconClass)
    .filter((className) => !allowed.includes(className));
  assert.deepEqual(unexpected, [], `unexpected content icon classes: ${unexpected.join(", ")}`);
}

function assertNoIconGlyphContent(relative, allowed = []) {
  const text = read(relative);
  const glyphs = [...text.matchAll(/content\s*:\s*(["'])(.*?)\1/giu)]
    .map((match) => match[2])
    .filter((value) => /[✓✔☑★●■◆→←↗➜➤+−]/u.test(value)
      || /\\(?:2713|2714|2611|25a0|25cf|25c6|2192|2190|2197)\b/iu.test(value))
    .filter((value) => !allowed.includes(value));
  assert.deepEqual(glyphs, [], `icon-like CSS content found: ${glyphs.join(", ")}`);
}

function verifyBrand() {
  const astroFiles = [
    ...walk("astro/src/components", [".astro"]),
    ...walk("astro/src/pages", [".astro"]),
  ];
  const allowedByFile = new Map([
    ["astro/src/components/Header.astro", [
      "fa-solid fa-magnifying-glass",
      "fa-solid fa-magnifying-glass nav-search-bar-icon",
      "fa-solid fa-xmark",
    ]],
    ["astro/src/components/LangSwitch.astro", ["fa-solid fa-globe"]],
    ["astro/src/components/Home.astro", [
      "fa-solid fa-envelope",
      "fa-brands fa-whatsapp",
      "fa-brands fa-linkedin-in",
    ]],
    ["astro/src/components/ChatWidget.astro", [
      "fa-solid fa-headset",
      "fa-solid fa-envelope",
      "fa-solid fa-xmark",
      "fa-solid fa-magnifying-glass",
    ]],
    ["astro/src/components/NewsArticle.astro", ["fa-solid fa-arrow-left"]],
    ["astro/src/components/navigation/HeaderNav.astro", ["fa-solid fa-chevron-down"]],
    ["astro/src/components/navigation/MegaMenu.astro", ["fa-solid fa-chevron-right"]],
    ["astro/src/components/navigation/MegaMenuLink.astro", ["fa-solid fa-chevron-right"]],
  ]);

  for (const relative of astroFiles) {
    check(`brand icon policy ${relative}`, () => {
      assertAllowedIconTags(relative, allowedByFile.get(relative) || []);
    });
  }

  for (const relative of [
    ...walk("astro/src/components", [".astro", ".ts"]),
    ...walk("astro/src/data", [".ts"]),
    ...walk("astro/src/types", [".ts"]),
  ]) {
    check(`brand icon data ${relative}`, () => {
      assert.doesNotMatch(read(relative), /\bicon\s*:/u, "decorative icon field found");
    });
  }

  for (const relative of walk("astro/src/i18n", [".json"])) {
    check(`brand emoji copy ${relative}`, () => {
      const pictographs = [...read(relative).matchAll(/\p{Extended_Pictographic}/gu)]
        .map((match) => match[0])
        .filter((value) => !["©", "®", "™"].includes(value));
      assert.deepEqual(pictographs, [], `emoji/pictographs found: ${[...new Set(pictographs)].join(" ")}`);
    });
  }

  for (const relative of walk("astro/public", [".css"])) {
    check(`brand CSS glyph policy ${relative}`, () => {
      const allowed = relative === "astro/public/support-page.css" ? ["+", "−"] : [];
      assertNoIconGlyphContent(relative, allowed);
    });
  }
}

function verifyShop() {
  for (const relative of walk("templates/shop", [".html"])) {
    check(`shop main icon policy ${relative}`, () => {
      const html = read(relative);
      const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] || "";
      assert.deepEqual(iconTags(main), [], "decorative <i> found inside <main>");
    });
  }

  check("shop runtime control icon allowlist", () => {
    assertAllowedIconTags("shop/shop.js", [
      "fa-solid fa-chevron-right",
      "fa-solid fa-xmark",
    ]);
  });

  check("checkout runtime control icon allowlist", () => {
    assertAllowedIconTags("shop/checkout.js", [
      "fa-solid fa-circle-exclamation",
      "fa-solid fa-pen",
    ]);
  });

  check("shop shared CSS glyph policy", () => assertNoIconGlyphContent("shop/shop.css"));
  check("checkout disclosure glyph policy", () => assertNoIconGlyphContent("shop/checkout.css", ["+", "−"]));
}

if (requested === "all" || requested === "brand") verifyBrand();
if (requested === "all" || requested === "shop") verifyShop();

console.log(`\n  content icon policy: ${checks} passed, ${failures.length} failed`);
if (failures.length) {
  for (const failure of failures) console.error(`  FAIL ${failure}`);
  process.exit(1);
}
console.log(`  PASS ${requested} decorative-content icon gate\n`);
