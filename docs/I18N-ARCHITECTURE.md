# GYUTRON i18n — Target Architecture (build-time key-based)

This is the architecture we are migrating TO. It matches the "one set of pages /
one set of components / one set of logic → i18n key → en.json / de.json / ja.json"
model. Generation happens at BUILD time so every locale still ships as static
HTML (SEO-safe), but the source authors against abstract keys, never raw text.

```
templates/  (one set of pages — language-neutral, uses {{t:key}} markers)
        │
        ▼  tools/build_i18n.py   (build time)
        │      for each locale: look up every {{t:key}} in locales/<loc>.json
        ▼
en/ (root)  de/  ja/  + public/ mirrors   ← static, SEO-complete per locale
```

## Why we migrated (the bugs this kills at the root)

The previous system used the **English sentence itself as the dictionary key**
and ran a blind find/replace over the whole file — HTML *and* JS. That caused:

- **Layout breakage**: replacing "Checkout" → "Zur Kasse" rewrote the JS
  identifier `renderCheckoutSummary` → `renderZur KasseSummary` (syntax error),
  taking the German store offline. Abstract keys never touch code.
- **English residue**: a missing sentence silently fell back to English.
  Here, a missing key is a **build error** — it can't ship unnoticed.
- **Mixed text** ("Payment & Beschaffung Info"): substring/partial replacement.
  Keys are replaced as whole units; partials are impossible.
- **High maintenance**: N copies of every page, hand-synced. Now: one template,
  three small JSON files.

## Rules

1. **Source of truth = `templates/` + `locales/en.json`.** Authors edit these.
2. **Translatable text → a key.** In HTML: `<span data-i18n="cta.shopProducts">Shop Products</span>`
   (the inline English is just a dev-time fallback; the build replaces it).
   In attributes: `data-i18n-attr="placeholder:search.placeholder"`.
   In JS: `t("cart.empty")` via a tiny lookup table injected per locale.
3. **Keys are namespaced & semantic**: `nav.products`, `checkout.intro`,
   `policy.return.title`, `product.cat.cameras`. Never the English text.
4. **locales/<loc>.json mirror the same key set.** `build_i18n.py --check` fails
   if any locale is missing a key the template references, or has an extra key.
5. **Locked terms** (GYUTRON, SKU, RFID, NFC, PDA, MES, WMS, ERP, PLC, API, ISO,
   B2B, OEM, ODM, IP67, model numbers) are never keyed — they stay literal.
6. **Build output is static per-locale HTML** (SEO: localized title/meta/og/
   hreflang baked in), plus `public/` deploy mirror.

## Migration plan (incremental, verified)

- **Phase A (pilot)**: migrate `shop/index.html` → template + keys; build en/de/ja;
  verify output parity + clean JS + SEO. ← prove the pattern.
- **Phase B**: shop chrome shared partial (header/footer/nav/switcher) → one
  template fragment, so all 16 shop pages stop duplicating it.
- **Phase C**: remaining 15 shop pages, then 21 main-site pages.
- **Phase D**: JS (`shop.js`, `product-catalog.js`, `product-data.js`) → `t()` table.
- **Phase E**: delete legacy generator + English-keyed strings.json once parity
  confirmed; switch `npm run i18n:build` to `build_i18n.py`.

Each phase: build → `node --check` all JS → audit (no residual English) →
visual parity → commit. Never mass-rewrite blind.

## Status
- 2026-06-01: design accepted by owner. Pilot in progress.
- Interim: legacy generator hardened (translate_js so it can't corrupt code;
  single-pass replace; audit gate) — site is functional during migration.
