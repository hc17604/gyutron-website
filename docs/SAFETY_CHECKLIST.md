# Safety Checklist — gyutron.com

Read before editing. These are the things that BREAK the live site, the deploy, or hard contracts.
("Brand site" = gyutron.com, the Astro project in `astro/`.)

## Never touch

- **Shop surfaces** — `shop/`, `templates/shop/`, `templates/_partials/shop-*`, `de/shop/`, `ja/shop/`,
  `public/{shop,de/shop,ja/shop}`, `public/shop-analytics.js`, Shop keys in `locales/i18n/`, Shop-only
  API/migration files, and Worker host routing are out of scope for a main-site task. Do not edit, sync,
  or add them to the brand sitemap.
- **The legacy Python generator path** (`i18n:build` / `i18n:sync` / `generate_localized_site.py`) — it
  regenerates legacy pages into `public/` and CLOBBERS the Astro cutover. The generator still owns shop;
  just never run its main path.
- **Secrets / env files** — never commit `.env`, `.dev.vars`, API keys, `*.pem`/`*.key`. Real keys live
  in Cloudflare env. `.env.example` (placeholders) is the only committed env file.
- **The `node` process** — when stopping a conflicting Codex agent, kill `codex.exe` ONLY (Claude runs
  on node).

## URL / routing — don't break indexed URLs

- Keep `build.format: 'preserve'` (URLs end in `.html`). **Do not** switch to `/en/…` or drop `.html`.
- Don't rename or remove existing page paths. Canonical host is `https://www.gyutron.com` (www).
- Redirect stubs (`smart-cameras`, `industrial-sensors`, `inspection-instruments`) must stay
  `includeInSitemap:false` + `noindex` in `src/data/pages.ts`.

## Don't revert the data-driven architecture

These are single sources of truth — edit the DATA, never re-hardcode in components:
`data/header-navigation.ts` (header), `data/navigation.ts` (footer), `data/products.{en,de,ja}.js` +
`data/products.ts` (products), `data/faq.ts` (FAQ), `data/solutions.ts` (solutions), `data/heroSlides.ts`
(hero), `data/pages.ts` (page registry), `data/assets.ts` (site images).

## Image reuse breaks visual ownership

Content imagery must be single-use and slot-owned. Do **not** point a new homepage card, nav panel,
product-page hero, SKU render, solution hero, or news/partner visual at an existing content image just
because it looks close enough. Create a separately named file for that placement, then update only that
placement's data/component reference. Shared baseline UI assets such as the logo, favicon, payment marks,
social/share image, and icon libraries are the exceptions.

## Content icons are a deliberate exception, not decoration

Brand and Shop content surfaces use typography, spacing, product imagery, and state styling instead of
small decorative pictograms. Do not add Font Awesome/emoji/checkmark/square icons back to capability
cards, benefit lists, process steps, trust blocks, or ordinary CTA labels. Essential controls remain
allowed: search, language, menu hierarchy, account/cart, removal/edit/error feedback, disclosure state,
directional back navigation, the homepage contact-channel identifiers, and the compact Support/Contact
launcher icons. These contact exceptions are restricted to the allowlisted shared components; do not
spread them into ordinary content cards. Run `node scripts/smoke-content-icons.mjs --scope all`
after changing shared components, Shop templates, checkout runtime, icon-related data, or pseudo-content CSS.

## Header is a hard contract

The rendered header DOM (classes / nesting / order) is depended on by the desktop CSS, the inline nav
scripts, AND `public/mobile-navigation.js` (which CLONES it by selector). After ANY header/nav change:
`npm run build` then **`npm run verify:header`** (must PASS), and check the mobile drawer. Edit only
`data/header-navigation.ts` (+ `components/navigation/*` if structural) — see COMPONENTS.md /
TROUBLESHOOTING.md "Verify a header / nav change" + "Roll back a header / nav refactor".

## Deploy / public discipline

- Deploy = Cloudflare serving the **committed `public/`**. `astro/dist/` is the build output; it is
  **gitignored** and is NOT what deploys.
- After a change that alters rendered output, sync **only the affected** `astro/dist/<page>` into
  `public/` (and the de/ja variants). **Never bulk-copy all of `dist/` into `public/`**, and never sync
  Shop. Confirm impact with root `npm run deploy:diff` (cross-platform and read-only). See DEPLOYMENT.md.
- A scaffold/lib/docs-only change is deploy-neutral (no `public/` change) — verify with the diff.
- Root and `astro/` `package-lock.json` files are committed reproducibility contracts. Use `npm ci` in
  CI/fresh checkouts and include intentional dependency changes in the same reviewed commit.
- Don't commit `astro/dist/`.

## i18n

- New visible text needs the key in **all three** dicts (`en/de/ja`) or the build fails (intended gate).
- **Never translate product model names** (`GY-*`).
- Category fields in `products.{de,ja}.js` (`eyebrow`/`title`/`navLabel`/`intro`/`panelText`) are written
  per-locale directly (not via dicts) — translate them by hand; `verify:i18n` won't catch unrendered ones.

## Before you commit / push

1. `npm run build` (every change). 2. `npm run verify:all` (+ `verify:header` if header touched). 3.
Confirm `public/` diff is only the pages you intended; Shop untouched. 4. Update `HANDOFF.md` and run
root `npm run agent:check`. 5. Fetch and confirm `git rev-parse HEAD == git rev-parse origin/main`;
preserve any dirty or divergent work. 6. Commit per change (never blind `git add -A`; add specific
paths). 7. Push to `main`; watch CI and re-verify
`local == origin`; watch GitHub Actions (`gh run watch`) — fix red CI, don't leave it.
