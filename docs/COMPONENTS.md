# Components — gyutron.com

All components live in `astro/src/components/` and take a `locale: Locale` prop, looking up text via
`t(locale, key)`. Styling is global CSS in `astro/public/*.css`.

## Inventory

| Component | Role | Reusability |
|---|---|---|
| `Layout.astro` (in `layouts/`) | `<head>` + SEO meta + Header + slots | high |
| `Header.astro` | desktop mega-menu, top bar, search, lang switch | singleton |
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

## Known duplication / TODO (incremental)

- ✅ **Footer nav** renders `data/navigation.ts` `FOOTER_NAV`.
- **Header mega-menu** still authored in `Header.astro` (deep irregular markup + the mobile menu clones
  the desktop DOM by selector). Top-level lives in `MAIN_NAV`; the panel rewrite is **deferred (high risk)**.
- Mega-menu interaction JS is inlined in several page components (Header/Home/ContactSales/…).
- The contact form's product `<select>` hardcodes a product subset — could derive from `data/products`.
- `HeroSlider.astro` imports the per-locale product files directly — could use the `data/products` accessor.
