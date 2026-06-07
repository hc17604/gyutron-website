# Content Guide — gyutron.com

Where each kind of content lives, and how to edit it.

## Content map

| Content | Lives in | Notes |
|---|---|---|
| UI labels, headings, SEO title/desc, home & solution copy | `src/i18n/{en,de,ja}.json` | edit all 3 |
| Products (categories + models + specs) | `src/data/products.{en,de,ja}.js` | per-locale, **kept separate on purpose** |
| Navigation — footer | **`src/data/navigation.ts` `FOOTER_NAV`** (Footer.astro renders from it) | |
| Navigation — header (incl. mega-menu) | **`src/data/header-navigation.ts` `HEADER_NAV`** (rendered by `components/navigation/*`); `MAIN_NAV` is a derived top-level view | |
| Company info (offices, email, WhatsApp, socials) | `footer.*` i18n keys + `src/data/company.ts` | |
| FAQ items | **`src/data/faq.ts`** (locale-aware), rendered by `components/support/FaqList.astro` | |
| Site-level images (logo, social share, payment, hero backgrounds) | **`src/data/assets.ts`** (`SITE_IMAGES`; type in `src/types/asset.ts`) | curated index; per-product/nav/hero image SETS stay in their own data files |
| Legal (privacy / terms / warranty / shipping) | hardcoded in the page `.astro` files | long prose; migrate only if needed |

## Add a product

1. Add the model object to the right category in **all three** `products.{en,de,ja}.js`
   (`{ name, type, summary, kind, image, specs, tags }`). Keep `name` identical across locales.
2. Drop its image in `public/product-library/transparent/` (and `astro/public/…`).
3. `python tools/i18n-audit.py` → exit 0. Then `astro build`.

## Add a product category

Add a new key to `GYUTRON_PRODUCTS` in all three files with `{ eyebrow, title, navLabel, heroImage,
intro, panelMetric, panelText, products: [...] }`. The `[category].astro` route picks it up
automatically. Add `seo.<category>.title`/`.desc` i18n keys. Link it in the nav.

## Edit navigation

- **Footer** is data-driven: edit `src/data/navigation.ts` `FOOTER_NAV` (Footer.astro maps it).
- **Header** (top-level triggers **and** the full mega-menu panels) is data-driven in
  **`src/data/header-navigation.ts` `HEADER_NAV`**, rendered by `components/navigation/*`. Edit links,
  sections, submenus, panel images, and trigger labels there — never in the components. `MAIN_NAV` (in
  `navigation.ts`) is a derived top-level projection of `HEADER_NAV`.
  - top-level item → add a `HeaderNavItem` (`triggerHref` + `labelKey` + `menu`).
  - section → push `{ labelKey, groups: [] }` onto `menu.sections`; card → push `{ link, submenu }` onto `groups`.
  - submenu link → push `{ href, titleKey, descKey }` onto `submenu.links` (use `titleText` for a literal label).
  - panel images are `menu.overviewImage` / `submenu.image` (keep any `?v=` cache-buster).
  - Every `*Key` must exist in all three i18n dicts; never translate model names (GY-*). Then `astro build`.
  - The rendered DOM (classes/nesting/order) is a hard contract with the desktop CSS/JS and the mobile
    drawer (`mobile-navigation.js` clones it). See COMPONENTS.md "Header navigation" + TROUBLESHOOTING.md.

## Edit company info / addresses

Office labels & addresses are `footer.{hqLabel,hqAddr,rdLabel,rdAddr}` in the i18n dicts (rendered by
`CompanyAddresses.astro`). Language-neutral facts (email, WhatsApp, shop URL, socials) are centralized
in `src/data/company.ts`.

## Add / edit a FAQ entry

FAQ content is data-driven in **`src/data/faq.ts`** (`FAQ_CATEGORIES` + `FAQ_ITEMS`, both locale-aware
`Record<Locale, string>`), rendered by `components/support/FaqList.astro`. To add a question, append a
`FaqItem` — `{ id, category, question: {en,de,ja}, answer: {en,de,ja} }`. `answer` is inline HTML, so it
may contain localized `<a>` links (rendered via `set:html`). The 3 `support/faq.astro` pages are thin
wrappers and need no edit. Then `astro build`.

> Support legal pages (warranty / shipping / privacy / terms) are still per-locale prose in their
> `.astro` files — intentionally not migrated (long-form legal text, low churn).

## Images & assets

**Site-level shared images** (logos, the default social-share/og image, payment marks, homepage hero
backgrounds and the hero industry collage) are indexed in **`src/data/assets.ts`** (`SITE_IMAGES`,
typed by `src/types/asset.ts` `SiteImage`). Each entry records `src`, localized `alt` (empty for
decorative), `usage` (where it's used), `owner`, and a `decorative` flag. Use `getImage(id)` to look one
up. The registry is a documentation/lookup index — it is **not yet wired** into components, so editing an
image still means editing its current reference (Header logo path, `config/seo.ts` og image, etc.).

Bulk image SETS keep living in their own data layer — do **not** move them into `assets.ts`:
per-product/category images in `products.{en,de,ja}.js`, mega-menu panels in `header-navigation.ts`,
hero art in `heroSlides.ts`. The file header in `assets.ts` also records the dist alt-audit result
(the only empty-alt images are intentional decorative hero layers).

For **image weight, alt-text rules, decorative-image rules, when to compress, and what not to delete**,
see **docs/PERFORMANCE.md**. Run `npm run verify:assets` (from `astro/`, REPORT-only) to list large /
duplicate / missing-alt images before and after adding media.

## Data layer

`src/data/` holds the maintainable content models (`navigation`, `company`, `faq`, `solutions`,
`support`, `locales`, `assets`, and a typed `products` accessor). They follow the site convention of
**referencing i18n keys** rather than inlining translated text.
