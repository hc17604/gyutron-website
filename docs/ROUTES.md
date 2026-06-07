# Routes — gyutron.com

## URL scheme

- `en` → `/` (no prefix), `de` → `/de/`, `ja` → `/ja/`.
- `build.format: 'preserve'` emits `page.html` (e.g. `/barcode-scanners.html`), byte-matching the
  legacy URLs for SEO continuity. **Do not switch to `/en/…` or drop `.html`** — it breaks indexed URLs.
- Config: `astro.config.mjs` (`i18n.locales`, `prefixDefaultLocale: false`). Canonical host:
  `https://www.gyutron.com` (`src/config/site.ts` → `SITE_URL`).

## Page inventory (per locale × en/de/ja)

| Path | Source | Notes |
|---|---|---|
| `/` (`index.html`) | `pages/index.astro` → `<Home/>` | homepage |
| `/<category>.html` | `pages/[category].astro` → `<ProductPage/>` | **dynamic**, one per product category |
| `/automated-vision-inspection.html` | `pages/automated-vision-inspection.astro` → `<SolutionPage/>` | solution |
| `/contact-sales.html` | `pages/contact-sales.astro` → `<ContactSales/>` | inquiry form |
| `/support.html` | `pages/support.astro` | support hub |
| `/support/faq.html` | `pages/support/faq.astro` | FAQ |
| `/support/warranty.html` | `pages/support/warranty.astro` | legal/support |
| `/support/shipping-delivery.html` | `pages/support/shipping-delivery.astro` | legal/support |
| `/privacy-policy.html` | `pages/privacy-policy.astro` | legal |
| `/terms-and-conditions.html` | `pages/terms-and-conditions.astro` | legal |
| `/search-index.json` | `pages/search-index.json.ts` | build-time search index endpoint |

de/ja live under `pages/de/…` and `pages/ja/…` with the same structure.

## Page registry (`src/data/pages.ts`)

`src/data/pages.ts` (`SITE_PAGES`, typed by `src/types/page.ts` `SitePage`) is the single, typed
index of the **static + solution + redirect-stub** pages and their metadata: `type`
(home/product/solution/support/legal/contact/redirect), canonical `path`, optional `titleKey`/
`descKey`, `includeInSitemap`, `noindex`, and `source`. Paths are composed from `ROUTES` and
`SOLUTIONS` (not duplicated). Product category pages are **dynamic** and intentionally not listed.

- **`sitemap.xml.ts` derives its static-page list from `sitemapStaticPaths()`** here (verified
  byte-identical output). Redirect stubs are `includeInSitemap: false` + `noindex: true`, so they
  never enter the sitemap.
- Helpers: `getPage(id)`, `getSitePages()`, `sitemapStaticPaths()`.
- Adoption is incremental: SEO / nav / route checks can move onto `SITE_PAGES` over time; today only
  the sitemap consumes it. `config/routes.ts` `ROUTES` remains the canonical path constants.

## Dynamic product route — `[category].astro`

```
getStaticPaths() → Object.keys(GYUTRON_PRODUCTS)
  .filter(k => products?.length || redirectTo)   // skip empty
  .map(category => ({ params: { category } }))
```

- Reads category keys from `data/products.en.js` (all locales share the same route set).
- A category with a `redirectTo` renders `<MetaRedirect/>` (e.g. `smart-cameras` → `area-scan-cameras`).
- Otherwise renders `<ProductPage locale category/>`, which selects the per-locale product data.

## Add a page

1. Create `astro/src/pages/<slug>.astro`, wrap a component, pass `locale="en"`, `path="/<slug>.html"`,
   and SEO via i18n keys: `title={t(locale,'seo.<slug>.title')}` / `description={t(locale,'seo.<slug>.desc')}`.
2. Create `pages/de/<slug>.astro` and `pages/ja/<slug>.astro` as thin wrappers (`locale="de"|"ja"`).
3. Add the `seo.<slug>.title` / `.desc` keys to **all three** i18n dicts (build fails on a missing key).
4. Add the link to navigation (`Header.astro` / `Footer.astro`; canonical list in `src/data/navigation.ts`).
5. **Register it in `src/data/pages.ts` `SITE_PAGES`** (set `type`, `includeInSitemap`, `noindex` as
   appropriate) so the sitemap (and future SEO/nav consumers) pick it up. A new indexable page with
   `includeInSitemap: true` will appear in `sitemap.xml` automatically.
6. `cd astro && npx astro build`, then `npm run verify:all` (sitemap/routes/seo), then deploy
   (see DEPLOYMENT.md).

Canonical path constants live in `src/config/routes.ts`; page metadata in `src/data/pages.ts`.
