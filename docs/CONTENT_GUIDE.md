# Content Guide — gyutron.com

Where each kind of content lives, and how to edit it.

## Content map

| Content | Lives in | Notes |
|---|---|---|
| UI labels, headings, SEO title/desc, home & solution copy | `src/i18n/{en,de,ja}.json` | edit all 3 |
| Products (categories + models + specs) | `src/data/products.{en,de,ja}.js` | per-locale, **kept separate on purpose** |
| Navigation (header + footer) | `Header.astro` / `Footer.astro` today; canonical model in `src/data/navigation.ts` | |
| Company info (offices, email, WhatsApp, socials) | `footer.*` i18n keys + `src/data/company.ts` | |
| FAQ items | hardcoded in `pages/**/support/faq.astro` today; target = `src/data/faq.ts` | |
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

Today: edit `Header.astro` (mega-menu) and `Footer.astro` (footer columns). The canonical data model
is `src/data/navigation.ts` — when these get rewired to read from it, edit the data file only.

## Edit company info / addresses

Office labels & addresses are `footer.{hqLabel,hqAddr,rdLabel,rdAddr}` in the i18n dicts (rendered by
`CompanyAddresses.astro`). Language-neutral facts (email, WhatsApp, shop URL, socials) are centralized
in `src/data/company.ts`.

## FAQ

Currently the Q&A markup is duplicated across `pages/{,de/,ja/}/support/faq.astro`. The data-driven
target is `src/data/faq.ts` (typed items) + a thin page that renders them. Until that migration lands,
edit the three page files together.

## Data layer

`src/data/` holds the maintainable content models (`navigation`, `company`, `faq`, `solutions`,
`support`, `locales`, and a typed `products` accessor). They follow the site convention of
**referencing i18n keys** rather than inlining translated text.
