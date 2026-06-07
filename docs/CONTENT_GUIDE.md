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
| Homepage hero / carousel slides | **`src/data/heroSlides.ts`** (`HERO_SLIDES`), rendered by `HeroSlider.astro` | 3 layouts (solutions/grid/product); copy via i18n keys |
| Contact-form product options | **`CONTACT_PRODUCT_OPTIONS`** in `src/data/products.ts` | curated subset; `{category, labelKey}` pairs |
| Solutions | **`src/data/solutions.ts`** (`SOLUTIONS`; type in `src/types/solution.ts`), rendered by `SolutionPage.astro` | see SOLUTIONS_GUIDE.md |
| Pages (routing/SEO/sitemap metadata) | **`src/data/pages.ts`** (`SITE_PAGES`; type in `src/types/page.ts`) | sitemap derives static pages from it; see ROUTES.md |
| News posts | **`src/data/news.ts`** (`NEWS`; type in `src/types/news.ts`), homepage "Newsroom" | locale-aware `Record<Locale>` per post |
| Partners / ecosystem | **`src/data/partners.ts`** (`PARTNERS`; type in `src/types/partner.ts`), homepage "Ecosystem & integration" | name + optional logo image |
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

> ⚠️ `eyebrow`, `title`, `navLabel`, `intro`, `panelText` are written directly per-locale in
> `products.{de,ja}.js` (NOT via the i18n dicts), so **translate them by hand** in all three files —
> `verify:i18n` only scans rendered pages and won't catch a residual in a not-yet-rendered field
> (`panelMetric`/`sectionIntro`). See I18N.md "Residual-English status".

## Edit the homepage hero / carousel

Slides are data-driven in **`src/data/heroSlides.ts`** (`HERO_SLIDES`), rendered by `HeroSlider.astro`.
Each slide has a `layout` (`solutions` | `grid` | `product`), a `bg` image, and copy via i18n keys
(`kickerKey`/`titleKey`/`subKey`/`ctaKey`…). To change a slide, edit its entry (and any `*Key` must
exist in all three dicts). The hero is **visually sensitive** — after editing, `npm run build` and
visually verify desktop + mobile before deploying. See HANDOFF.md §6.

## Edit contact-form product options

The Contact Sales `<select>` options come from **`CONTACT_PRODUCT_OPTIONS`** in `src/data/products.ts`
— a curated array of `{ category, labelKey }` (the label reuses an existing nav-label i18n key, so the
visible text stays consistent). Add/remove/reorder entries there; the "Select one" placeholder and the
trailing "OEM / ODM Cooperation" option are rendered in `ContactSales.astro`. Do **not** change the
form field `name`s or the `/api/contact` submit logic. Then `npm run build`.

## Add / edit a solution

Solutions are data-driven in `src/data/solutions.ts`. See **docs/SOLUTIONS_GUIDE.md** for the full
step-by-step (model fields, page wrapper, byte-equivalence note).

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

## Brand color (purple-only)

The brand uses **only purple**. The accent / second color is **light purple `--purple-500 #8a63d2`**
(tokens `--signal` / `--hero-accent` / homepage `--hx-accent`; paler fills use `--violet-soft #efe8ff`).
**Do NOT introduce green / teal / cyan** accents — they were removed 2026-06-07 and mapped to purple.
Functional red (form errors) and amber (`--warning`) may stay. To retune the accent shade, change the
token in one place. See HANDOFF §2.

## Add a news post

News is data-driven in **`src/data/news.ts`** (`NEWS`). It powers the homepage "Newsroom" teaser
(latest 3 via `getLatestNews`), the **`/news` index** (`NewsIndex.astro`) and per-post **`/news/<slug>`
article pages** (`NewsArticle.astro`, generated via `getStaticPaths`). To add a post, prepend a
`NewsItem`:
- `id`, `slug`, `date` (`YYYY-MM-DD`), `category` / `title` / `excerpt` / optional `body` as `{en,de,ja}`.
- `href: '/news/<slug>.html'` (the article page is created automatically from the slug; homepage cards
  and site search link to it).
- optional `image` (public path; a placeholder block shows if omitted).

Then `astro build` (new `/news/<slug>` pages appear in all three locales + the sitemap, via
`data/pages.ts`). The article page falls back to the `excerpt` when `body` is absent. A future headless
CMS can back this same `NEWS` source.

## Edit partners / ecosystem

The homepage "Ecosystem & integration" wall renders **`src/data/partners.ts`** (`PARTNERS`). Each entry
is `{ id, name, logo?, url? }` — if `logo` (a public image path) is set it renders the image, else `name`
renders as a text tile. It is seeded with the industrial interface STANDARDS GYUTRON supports; add real
partner companies by adding entries with a `logo` (drop the file in `public/` AND `astro/public/`).

## Edit the About / company section

The homepage "About GYUTRON" section uses i18n keys (`home.x.about.*`, `home.x.val1..4.*`) for copy plus a
small facility-image list in `Home.astro` (`aboutImages`, currently `nav-company-*.png`). Edit copy in all
three dicts; swap facility images by changing `aboutImages`.

## Data layer

`src/data/` holds the maintainable content models (`navigation`, `company`, `faq`, `solutions`,
`support`, `locales`, `assets`, `pages`, `news`, `partners`, and a typed `products` accessor). Most
follow the site convention of **referencing i18n keys**; `faq` and `news` inline `Record<Locale,string>`
content (better for frequently-edited posts).
