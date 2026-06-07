# Components — gyutron.com

All components live in `astro/src/components/` and take a `locale: Locale` prop, looking up text via
`t(locale, key)`. Styling is global CSS in `astro/public/*.css`.

## Inventory

| Component | Role | Reusability |
|---|---|---|
| `Layout.astro` (in `layouts/`) | `<head>` + SEO meta + Header + slots | high |
| `Header.astro` | top bar, brand, search, lang switch + `<HeaderNav/>` (nav now data-driven) | singleton |
| `navigation/HeaderNav.astro` | `<ul class="nav">` — data-driven from `HEADER_NAV` | singleton |
| `navigation/MegaMenu.astro` | one `.mega-menu` panel (feature + sections + extra links) | **high** |
| `navigation/MegaMenuFeature.astro` | `.mega-feature` hero link (standard panels) | high |
| `navigation/MegaMenuSection.astro` | `.mega-section-label` + the groups under it | high |
| `navigation/MegaMenuLink.astro` | one `.mega-link-group` (`.mega-link` + `.submenu`) | **high** |
| `Footer.astro` | footer nav (data-driven via `FOOTER_NAV`) + company + payment | singleton |
| `Home.astro` | homepage sections | page-specific |
| `ProductPage.astro` | product category template (data-driven) | **high** |
| `SolutionPage.astro` | solution page | page-specific |
| `SupportPage.astro` | support/legal wrapper (breadcrumb + slot) | **high** |
| `ContactSales.astro` | contact form page | page-specific |
| `HeroSlider.astro` | homepage hero (3 layouts, data-driven) | medium |
| `TabCarousel.astro` | industry tabs | medium |
| `LangSwitch.astro` | language switcher | **high** |
| `CompanyAddresses.astro` | footer office block (i18n-driven) | high |
| `PaymentMethods.astro` | footer payment logos | high |
| `MetaRedirect.astro` | redirect-category helper | high |
| `support/FaqList.astro` | FAQ accordion rendered from `data/faq.ts` (locale-aware) | **high** |

## Target grouping (incremental migration)

The folder layout we are moving toward (do this gradually, never in one risky bulk move):

```
components/
  layout/      Layout (already in layouts/), Header, Footer
  navigation/  (mega-menu pieces, breadcrumbs)
  seo/         SeoHead
  language/    LangSwitch
  forms/       InquiryForm, ContactSales form
  common/      SectionTitle, CtaSection, cards
```

**Migration rule:** moving a component changes its import path in every page that uses it. Only move
one component at a time, update all importers, run `astro build`, and verify visually before the next.
Until then existing components stay where they are.

### New scaffold components (safe, additive — added this pass)

- `common/SectionTitle.astro` — eyebrow + heading + optional subtitle. Presentational, reusable.
- `common/CtaSection.astro` — call-to-action band with up to two buttons.
- `seo/SeoHead.astro` — the unified `<head>` SEO block, **now rendered by `Layout.astro`** (Twitter
  Card, `og:image`, robots, JSON-LD). See [SEO.md](SEO.md).
- `support/FaqList.astro` — **in use**: renders the FAQ accordion from `data/faq.ts`.
- `forms/InquiryForm.astro` — placeholder inquiry form (mock), not yet imported. The live contact form
  is `ContactSales.astro`, which already routes through `lib/forms/contact.ts`.
- `common/SectionTitle.astro`, `common/CtaSection.astro` — presentational, not yet imported.

## Header navigation (data-driven) — added 2026-06-07

The whole header nav (top-level triggers **and** the mega-menu panels) is data-driven from
**`src/data/header-navigation.ts`** `HEADER_NAV` (typed by `src/types/navigation.ts`), rendered by the
`components/navigation/*` pieces above. `Header.astro` keeps only the chrome (top strip, brand, search,
lang switch, CTA, the inline scrollbar/active-submenu/close-on-click scripts) and calls `<HeaderNav/>`.
`MAIN_NAV` (in `data/navigation.ts`) is now a derived projection of `HEADER_NAV`.

**To edit the nav, edit `header-navigation.ts` only** — never the components:
- new top-level item → add a `HeaderNavItem` (`triggerHref` + `labelKey` + `menu`).
- new mega section → push `{ labelKey, groups: [] }` onto `menu.sections`.
- new product/category card → push `{ link, submenu }` onto a section's `groups`.
- new submenu link → push `{ href, titleKey, descKey }` onto `submenu.links`.
- standard (wide) panel → `variant: 'standard'` + a `feature`; compact → `variant: 'compact'`, no feature.
- a one-link intro panel → `submenu.intro: true`. A language-neutral label → `titleText` instead of `titleKey`.

**Hard DOM contract (do not break):** the rendered class names, nesting, and child order are a contract
with (a) the desktop CSS (`nav-chrome.css` + the per-page chrome), (b) `Header.astro`/`Home.astro` inline
scripts (`.nav-item`, `.mega-link-group.is-open`, …), and (c) `public/mobile-navigation.js`, which **clones
the rendered desktop DOM by selector** (`.mega-links` children, `:scope > .mega-link`, `:scope > .submenu > a`).
The components emit byte-structure-identical DOM to the old hand-written markup — verified across en/de/ja
(see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) "Verify a header refactor"). Keep it that way.

## Known duplication / TODO (incremental)

- ✅ **Footer nav** renders `data/navigation.ts` `FOOTER_NAV`.
- ✅ **Header nav** (top-level + mega-menu panels) renders `data/header-navigation.ts` `HEADER_NAV` via
  `components/navigation/*` (done 2026-06-07; output verified byte-structure-identical across en/de/ja).
- Mega-menu interaction JS is inlined in several page components (Header/Home/ContactSales/…).
- The contact form's product `<select>` hardcodes a product subset — could derive from `data/products`.
- `HeroSlider.astro` imports the per-locale product files directly — could use the `data/products` accessor.
