# Content Guide — gyutron.com

Where each kind of content lives, and how to edit it.

## Content map

| Content | Lives in | Notes |
|---|---|---|
| UI labels, headings, SEO title/desc, home & solution copy | `src/i18n/{en,de,ja}.json` | edit all 3 |
| Products (categories + models + specs) | `src/data/products.{en,de,ja}.js` | per-locale, **kept separate on purpose** |
| Navigation — footer | **`src/data/navigation.ts` `FOOTER_NAV`** (Footer.astro renders from it) | |
| Navigation — header | top-level in **`src/data/navigation.ts` `MAIN_NAV`**; mega-menu PANELS stay in `Header.astro` (rewrite deferred — high risk) | |
| Company info (offices, email, WhatsApp, socials) | `footer.*` i18n keys + `src/data/company.ts` | |
| FAQ items | **`src/data/faq.ts`** (locale-aware), rendered by `components/support/FaqList.astro` | |
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
- **Header top-level** (the 6 mega-menu triggers) is modelled in `src/data/navigation.ts` `MAIN_NAV`.
  The deep mega-menu PANELS (sections, link groups, submenus, images) are still authored directly in
  `Header.astro` — rewriting them to be data-driven is deferred as high risk (irregular markup + the
  mobile menu clones the desktop DOM by selector). To change a mega-menu link today, edit `Header.astro`.

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

## Data layer

`src/data/` holds the maintainable content models (`navigation`, `company`, `faq`, `solutions`,
`support`, `locales`, and a typed `products` accessor). They follow the site convention of
**referencing i18n keys** rather than inlining translated text.
