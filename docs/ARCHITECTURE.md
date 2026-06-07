# Architecture — gyutron.com

> Scope: **brand website only** (`www.gyutron.com`). The storefront `shop.gyutron.com`
> is a separate project and is out of scope — never edit `shop/`, `public/**/shop/`, or
> `shop.*` i18n keys.

## Stack

| Concern | Choice |
|---|---|
| Framework | **Astro 5**, `output: 'static'` (pure SSG, no server runtime) |
| Language | TypeScript + `.astro` components |
| i18n | Astro built-in i18n + thin `src/i18n/index.ts` (`t()` lookups). Locales: `en` (`/`), `de` (`/de/`), `ja` (`/ja/`) |
| URLs | `build.format: 'preserve'` → emits `page.html`, byte-matching the legacy URLs |
| Styling | Plain global CSS in `astro/public/*.css`, injected via `Layout`'s `pageCss` prop |
| Deploy | Cloudflare Worker serving the committed `public/` dir (see [DEPLOYMENT.md](DEPLOYMENT.md)) |
| Backend | One endpoint only: `POST /api/contact` → `src/contact-handler.mjs` (Resend email) |

No UI framework (React/Vue), no CSS-in-JS, no state library. Keep it light.

## Directory map (Astro project = `astro/`)

```
astro/src/
  pages/          route files (en at root, de/, ja/); [category].astro is dynamic
  layouts/        Layout.astro — <head>, SEO meta, Header + slots
  components/     core .astro components + navigation/ (data-driven header nav) — see COMPONENTS.md
  data/           products.{en,de,ja}.js, heroSlides.ts, header-navigation.ts  + scaffold (navigation/company/faq/…)
  i18n/           en.json / de.json / ja.json (807 keys) + index.ts
  lib/            productI18n.ts, productText.ts, searchIndex.ts  + NEW scaffold (api/forms/crm/cms/agent/logger)
  config/         NEW — centralized site/seo/i18n/routes/integrations config
  types/          NEW — shared TypeScript types
  styles/         (currently unused; CSS lives in astro/public/*.css)
astro/public/     static assets + the *.css stylesheets + product images
```

Repo root also contains: `public/` (the **deployed build output**, committed), `src/worker.mjs`
(Cloudflare worker), `wrangler.toml`, `docs/`, and **legacy generator artifacts** that are dead
(root-level `*.html`, `de/`, `ja/`, `locales/`, `templates/`, `tools/generate_localized_site.py`,
`product-data.js`, `product-catalog.js`). Do not run the legacy generator — see TROUBLESHOOTING.md.

## Active vs. scaffold

- **Active** (renders the live site): `pages/` (incl. `sitemap.xml.ts`), `layouts/Layout.astro` → `components/seo/SeoHead.astro` (uses `config/{site,seo}` + `utils/{seo,structured-data}`), `components/` (incl. `support/FaqList.astro` and `navigation/*` rendering the header), `i18n/`, `config/{site,seo,i18n,routes}`, `data/{products.*.js, products.ts (accessor), faq.ts, header-navigation.ts, navigation.ts (FOOTER_NAV + derived MAIN_NAV), heroSlides.ts}`, `types/navigation.ts`, `utils/{seo,structured-data}`, `lib/{productI18n, productText, searchIndex, forms/contact, api}`.
- **Scaffold** (not yet wired into pages — adopt incrementally): `config/integrations`, most of `types/`, `data/{company,solutions,support,locales}.ts`, `lib/{crm,cms,agent,logger}` + `lib/forms/inquiry`, the grouped `components/{layout,language,forms,common}/` placeholders, and `.env.example`. All future-integration code (CRM/CMS/Agent) is **mock/placeholder** — see [FUTURE_INTEGRATIONS.md](FUTURE_INTEGRATIONS.md).

## Principles (apply on every change)

1. Componentize, never copy-paste. 2. Data-drive content (`src/data`, referencing i18n keys). 3. Static-first. 4. i18n-ready (no text hardcoded deep in components). 5. SEO-friendly (one `<h1>`, unique title/description, clean URLs). 6. Industrial B2B visual. 7. **Don't over-engineer** — every abstraction must make maintenance genuinely easier, not just look advanced.
