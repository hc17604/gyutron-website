# GYUTRON Localization Layer

This directory is the source structure for future language and country-site work. It is not yet wired into the static pages, but every new visible string should be planned against this structure so the site can be migrated gradually without a painful rewrite.

## Locale Plan

- `en/` is the source locale and the current production language.
- `zh-cn/`, `de/`, `es/`, `ja/`, and `ko/` are planned target locales for professional localization.
- Target locale files currently contain placeholders with `__fallbackLocale: "en"` so the folder structure exists without pretending machine translation is final.
- Keep `GYUTRON` unchanged in every language. It is the brand name.

## Namespace Rules

- `common.json`: shared labels, buttons, forms, errors, account/cart/search strings.
- `navigation.json`: main-site navigation, store navigation, footer groups, language switcher labels.
- `home.json`: homepage hero, homepage sections, homepage CTA copy.
- `products.json`: product families, product names, summaries, spec labels, tags, search terms.
- `solutions.json`: solution taxonomy, solution page copy, industry/use-case labels.
- `store.json`: shop homepage, catalog, product detail, cart, quote/contact flows.
- `policies.json`: shipping, returns, warranty, privacy, terms, payment methods.
- `seo.json`: title tags, meta descriptions, Open Graph/Twitter copy, hreflang/canonical data.

## Workflow

1. Add or change English source copy in `locales/en/{namespace}.json` first.
2. Mirror the new keys into every planned locale file, or keep that file marked with `__fallbackLocale` until localization starts.
3. Run `npm run i18n:check` before shipping.
4. Run `npm run i18n:check:strict` before launching a real localized site.
5. Do not bake readable marketing copy into images. Use HTML/CSS text or locale-specific image variants under `assets/{locale}/`.

## Quality Notes

- Professional localization is more than translation. Technical terms, policy pages, CTA wording, measurements, certificates, and compliance language need market review.
- Preserve model names, SKUs, measurements, interface names, and certifications unless a verified local standard requires a different expression.
- German and Spanish can be much longer than English; Chinese, Japanese, and Korean have different line-break behavior. Localized layouts must be checked on desktop, tablet, and mobile.
