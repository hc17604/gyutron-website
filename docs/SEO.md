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
| No Twitter Card tags | add `twitter:card`/`title`/`description`/`image` (see `seo/SeoHead.astro`) |
| No `og:image` | add a default share image in `src/config/seo.ts` (`DEFAULT_OG_IMAGE`) |
| No structured data (JSON-LD) | emit `Organization` + per-page `Product`/`BreadcrumbList` |
| `sitemap.xml` is stale | only a hand-written `sitemap.xml` exists at repo root; Astro does **not** generate one. Adopt `@astrojs/sitemap`. |
| robots host mismatch | `public/robots.txt` points at `gyutron.com` but canonical is `www.gyutron.com` — unify |

## Where SEO config lives

- `src/config/seo.ts` — defaults: title template, default description, `DEFAULT_OG_IMAGE`,
  `TWITTER_HANDLE`, and the `Organization` JSON-LD object (for future adoption).
- `src/components/seo/SeoHead.astro` — the **upgraded** `<head>` block (current meta **plus** Twitter
  Card, `og:image`, JSON-LD). It is intentionally **not yet wired into `Layout.astro`**, so this pass
  does not change any rendered HTML. To adopt: replace the inline `<head>` meta in `Layout.astro` with
  `<SeoHead .../>`, build, and diff `astro/dist` to confirm the only changes are the new tags.

## Per-page title/description

Set via i18n keys, e.g. `title={t(locale, 'seo.index.title')}`. Add the `seo.<page>.title` /
`seo.<page>.desc` keys to all three dicts when adding a page.

## Don't

Don't keyword-stuff. The brand is industrial automation / machine vision — keep copy professional and
international.
