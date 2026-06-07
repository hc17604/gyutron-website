# Performance & Asset Maintenance — gyutron.com

This is a **maintenance-rules** doc, not a redesign plan. The site is static HTML served by
Cloudflare from the committed `public/`. The biggest performance lever here is **image weight**.

## Current baseline (measured 2026-06-07 via `npm run verify:assets`)

- `public/` images: **260 files, ~285 MB** (shop excluded).
- **141 images are > 1 MB.** The heaviest are the mega-menu / hero backdrops (`nav-*`, `*-matrix`,
  `*-stage`, `hero-*`, `cta-*`) at **~1.6–2.2 MB each** (uncompressed PNG).
- **0 duplicate image files** (identical bytes), **0 `<img>` missing an `alt`**, **51 decorative
  `alt=""`** images (hero layers — expected, see below).
- CSS: chrome (reset, `:root` vars, header/nav, `.button`, mega-menu) is **duplicated** across
  `global.css` / `product-page.css` / `contact-page.css` / `solution-page.css` (~250–400 lines).

> These are **known** and currently **acceptable** (the site is fast enough as static HTML on
> Cloudflare's CDN). They are documented so a future optimization pass is informed — not urgent.

## How to run the check

```
cd astro
npm run build            # so dist/ HTML exists for the alt scan
npm run verify:assets    # REPORT only — never fails; nothing is changed
```
Useful flags: `--limit 2` (only flag images > 2 MB), `--fail-over 5` (opt-in: exit 1 if any image
exceeds 5 MB — e.g. to gate against accidental huge uploads), `--dir <path>` / `--html <path>`.
It also runs in CI as an **informational** step (it never fails the build).

## Adding an image (rules)

1. **Right-size before committing.** Export at the actual display size (≤ ~1920px wide for full-bleed
   backdrops; much smaller for thumbnails). A 2 MB PNG for a menu backdrop is too heavy — aim for a
   few hundred KB.
2. **Prefer the existing folders:** product art in `public/product-library/…` and
   `public/product-images/`; reference shared/site images via the registry `src/data/assets.ts`.
3. **Commit the image in BOTH `public/` (deployed) and `astro/public/` (build/preview)** — they must
   stay in sync (see DEPLOYMENT.md).
4. Don't add a near-duplicate of an existing image; reuse it (verify:assets reports duplicates).

## alt-text rules

- **Content images** (logo, product photos) need a meaningful `alt` (e.g. the product name). Product
  images already do; the logo uses `alt="GYUTRON"`.
- **Decorative images** (hero collage / grid / spotlight backdrops) use `alt=""` AND sit inside a
  parent with `aria-hidden="true"`. This is correct — screen readers skip them. `verify:assets`
  counts these separately and does NOT flag them.
- **Never ship an `<img>` with no `alt` attribute at all** — `verify:assets` reports those (currently 0).

## When to compress / optimize (and when not to)

- **Do** consider optimization if: a single image is > ~2.5 MB, total page weight noticeably grows, or
  Lighthouse/PageSpeed flags image bytes. Re-export at the right size first; WebP/AVIF conversion is a
  larger project (changes `public/` and cache keys) — plan it deliberately, don't do it ad-hoc.
- **Don't** compress/convert images as a drive-by change in an unrelated PR, and don't run a bulk
  re-encode without verifying every page still looks right.
- **CSS dedup** (extracting the shared chrome into one base file) is a worthwhile future cleanup but is
  **deferred**: the chrome is duplicated across 4 CSS files and a careless merge can change the cascade.
  If attempted, verify the built pages are byte-equivalent (`diff astro/dist public` per page).

## What NOT to delete

- Anything under `public/shop*` (out of scope — belongs to the storefront; never touch).
- `public/product-library/`, `public/product-images/`, `public/product-cutouts/` — referenced by the
  product data and hero (deleting breaks pages).
- `nav-*`, `product-hero-*`, `product-menu-*`, `*-stage`, `hero-*`, `cta-*`, `mega-*` — referenced by
  the header mega-menu (`src/data/header-navigation.ts`) and hero (`src/data/heroSlides.ts`).
- Logos (`gyutron-logo*.{svg,png}`) and `images/payment/*.svg`.
- If unsure whether an image is used, grep `src/` for its filename before removing it.
