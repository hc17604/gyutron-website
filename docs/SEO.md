# SEO — gyutron.com

## What `Layout.astro` already emits (per page)

- Unique `<title>` and `<meta name="description">` (from `seo.*` i18n keys).
- `<link rel="canonical">` to the `www.gyutron.com` URL.
- Full `hreflang` set (en/de/ja) + `x-default`.
- Open Graph: `og:type`, `og:url`, `og:locale`, `og:title`, `og:description`, `og:site_name`.
- Favicons / apple-touch-icon. Exactly one `<h1>` per page.

## Known gaps (to close incrementally)

| Gap | Fix |
|---|---|
| ~~No Twitter Card~~ | ✅ done — `SeoHead.astro` emits `twitter:card`/`title`/`description`/`image` |
| ~~No `og:image`~~ | ✅ done — `DEFAULT_OG_IMAGE` in `src/config/seo.ts`, emitted by `SeoHead` |
| Structured data (JSON-LD) | ✅ `Organization` site-wide via `SeoHead`; per-page `Product`/`BreadcrumbList` still TODO |
| `sitemap.xml` is stale | only a hand-written `sitemap.xml` exists at repo root; Astro does **not** generate one. Adopt `@astrojs/sitemap`. |
| robots host mismatch | `public/robots.txt` points at `gyutron.com` but canonical is `www.gyutron.com` — unify |

## Where SEO config lives

- `src/config/seo.ts` — defaults: title template, default description, `DEFAULT_OG_IMAGE`,
  `TWITTER_HANDLE`, and the `Organization` JSON-LD object (for future adoption).
- `src/components/seo/SeoHead.astro` — the unified `<head>` SEO block, **now rendered by
  `Layout.astro`** (adopted 2026-06-06). Emits title / description / canonical / hreflang / OG **plus**
  `robots`, `og:image`, Twitter Card, and Organization JSON-LD. Every field is overridable per page
  (`title`/`description`/`canonical`/`locale`/`ogTitle`/`ogDescription`/`ogImage`/`ogType`/
  `twitterCard`/`noindex`/`robots`/`structuredData`). URL helpers live in `src/utils/seo.ts`.

## Per-page title/description

Set via i18n keys, e.g. `title={t(locale, 'seo.index.title')}`. Add the `seo.<page>.title` /
`seo.<page>.desc` keys to all three dicts when adding a page.

## Don't

Don't keyword-stuff. The brand is industrial automation / machine vision — keep copy professional and
international.
