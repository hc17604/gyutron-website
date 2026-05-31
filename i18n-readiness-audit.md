# GYUTRON I18N Readiness Audit

Date: 2026-05-31

Scope: main brand site, official store, shared navigation, product data, generated pages, and image/text handling.

## Current State

- The site is English-only at the source level. HTML files use `lang="en"`.
- There is no `data-i18n`, translation dictionary, locale router, `hreflang`, `og:locale`, or per-language metadata layer.
- The site is not currently ready for professional one-click language switching. It needs a structured localization layer first.
- A localization scaffold now exists under `locales/` with English source dictionaries and planned target folders for Simplified Chinese, German, Spanish, Japanese, and Korean. The scaffold is not yet wired into page rendering.
- Main-site text is mostly hardcoded directly in static HTML files, especially `index.html`, `contact-sales.html`, and `automated-vision-inspection.html`.
- Product category content is partly centralized in `product-data.js` and rendered through `product-catalog.js`, which is a good starting point for localization.
- Store product content is centralized in `shop/shop.js`, but store page chrome, policy pages, forms, footers, headers, placeholders, and notices are still hardcoded in `shop/*.html` and `shop/shop.js`.
- Shared main navigation is hardcoded inside `tools/update_navigation.py` and propagated into page HTML. This avoids manual page drift but is not yet locale-aware.
- `public/` mirrors the source files and must remain deploy output only.

## Text Architecture Findings

- Approximate visible hardcoded text occurrences across source HTML/JS: `6926`.
- `data-i18n` usage: `0`.
- Main pages contain SEO-critical text in `<title>`, `<meta name="description">`, Open Graph/Twitter meta tags, headings, buttons, forms, and footer.
- Store pages contain legal/trust/policy wording directly in compact one-line HTML files. These need careful human localization, not machine-only translation.
- Dynamic UI strings are embedded in JavaScript templates, including product cards, cart summary, search suggestions, account/cart messages, and product-detail CTAs.
- Form placeholders, `aria-label`, image `alt`, and `document.title` are also English and must be localized for a professional market-specific site.

## Image Text Findings

- Key marketing/hero images are mostly photographic/scene assets with text overlaid by HTML/CSS rather than baked into the image. This is good for localization.
- The logo asset `gyutron-logo-purple.png` contains the GYUTRON wordmark. `GYUTRON` is the brand name and should not be translated; ignore it for localization extraction and keep it uppercase in visible copy.
- Some generated product/device images contain tiny pseudo labels or model-like marks on device surfaces. These are not primary marketing copy, but they cannot be translated without regenerating/editing the image.
- Do not create future hero/menu/product images with meaningful English slogans, feature callouts, buttons, or labels baked into the bitmap. Put all readable marketing text in HTML/CSS.
- If market-specific images are later needed, store them as locale-specific asset variants and reference them from the translation/content layer.

## Recommended Target Architecture

Use the new `locales/` content layer instead of browser translation:

- `locales/en/*.json` as the source of truth.
- Planned target locales: `locales/zh-cn/*.json`, `locales/de/*.json`, `locales/es/*.json`, `locales/ja/*.json`, and `locales/ko/*.json`.
- Separate dictionaries by domain:
  - `common.json`: header, footer, buttons, forms, shared labels.
  - `home.json`: homepage sections and hero slides.
  - `navigation.json`: main-site and store menus.
  - `products.json`: product categories, names, summaries, specs, search terms.
  - `solutions.json`: solution pages and industry content.
  - `store.json`: store homepage, catalog, cart, checkout, quote/contact flows.
  - `policies.json`: shipping, returns, warranty, privacy, terms, payment methods.
  - `seo.json`: title, meta description, Open Graph/Twitter, canonical/hreflang data.
- Generate static localized pages into `public/{locale}/...` or subdomains (`cn.gyutron.com`, future country sites) from the same source dictionaries.
- Keep `www.gyutron.com` and `shop.gyutron.com` English until a target market is explicitly launched.
- Add locale routing and `hreflang` only once translated pages actually exist.
- Routine scaffold validation: `npm.cmd run i18n:check`.
- Pre-launch strict validation: `npm.cmd run i18n:check:strict`. Strict mode currently fails because target locale files intentionally fall back to English placeholders until professional localization begins.

## Migration Priority

1. Extract shared chrome first: top strip, main navigation, store navigation, footer, CTA labels, form labels/placeholders, alerts, and search/cart/account messages.
2. Extract product data next: category titles, category intros, product summaries, feature tags, specs labels, and search synonyms. Keep `GYUTRON`, SKU/model names, measurement units, certifications, and interface names stable unless a market-specific standard requires otherwise.
3. Extract SEO metadata: `title`, `description`, Open Graph/Twitter metadata, canonical/alternate URL data, page slugs if localized slugs are desired.
4. Extract page bodies: homepage, solution pages, contact page, product category pages, and store policy/trust pages.
5. Add a build or runtime language switcher after dictionaries exist. For SEO and ad landing pages, prefer static generated pages per locale instead of client-only translation.
6. Add QA checks for missing keys, untranslated English, overflow from longer languages, and locale-specific legal/policy review.

## Quality Rules

- Localization must be professional adaptation, not raw machine translation. Technical terms, compliance wording, policy pages, CTAs, and product specs need review by market.
- Preserve `GYUTRON`, product model names, SKUs, measurements, electrical/spec units, and certification labels unless there is a verified local standard.
- Test localized layouts because German, French, Spanish, Russian, Vietnamese, and Indonesian copy may be longer than English; Japanese/Korean/Chinese need different line-break behavior.
- Localized pages must include translated `title`, `meta description`, `alt`, `aria-label`, form placeholders, validation/success messages, and search suggestions.
- Legal/policy translations should be marked draft until reviewed for that market.
