# Components — gyutron.com

All components live in `astro/src/components/` and take a `locale: Locale` prop, looking up text via
`t(locale, key)`. Styling is global CSS in `astro/public/*.css`.

## Inventory

| Component | Role | Reusability |
|---|---|---|
| `Layout.astro` (in `layouts/`) | `<head>` + SEO meta + Header + slots | high |
| `Header.astro` | desktop mega-menu, top bar, search, lang switch | singleton |
| `Footer.astro` | footer nav + company + payment | singleton |
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
- `seo/SeoHead.astro` — the **future** `<head>` SEO block (adds Twitter Card, `og:image`, JSON-LD on
  top of the current meta). Not yet adopted by `Layout.astro` to keep output byte-identical — see [SEO.md](SEO.md).
- `forms/InquiryForm.astro` — placeholder inquiry form wired to `lib/forms` (mock submit). Marked TODO.

These are not yet imported by existing pages; adopt them incrementally.

## Known duplication to address (incrementally)

- Mega-menu interaction JS is inlined in several page components (Header/Home/ContactSales/…).
- Navigation links are authored in both `Header.astro` and `Footer.astro` — canonical source is being
  moved to `src/data/navigation.ts`.
- The contact form's product `<select>` hardcodes a product subset — should derive from `data/products`.
