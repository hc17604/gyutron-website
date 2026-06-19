# Safety Checklist — gyutron.com

Read before editing. These are the things that BREAK the live site, the deploy, or hard contracts.
("Brand site" = gyutron.com, the Astro project in `astro/`.)

## Never touch

- **shop.gyutron.com / `public/shop`, `public/de/shop`, `public/ja/shop`** and any `shop.*` i18n keys —
  out of scope, served separately. Do not edit, sync, or add to the sitemap.
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
  shop. Confirm impact with `diff -rq astro/dist public` (excluding `/shop`). See DEPLOYMENT.md.
- A scaffold/lib/docs-only change is deploy-neutral (no `public/` change) — verify with the diff.
- `package-lock.json` is **gitignored by repo convention** (CI uses `npm install`). Don't commit it.
- Don't commit `astro/dist/`.

## i18n

- New visible text needs the key in **all three** dicts (`en/de/ja`) or the build fails (intended gate).
- **Never translate product model names** (`GY-*`).
- Category fields in `products.{de,ja}.js` (`eyebrow`/`title`/`navLabel`/`intro`/`panelText`) are written
  per-locale directly (not via dicts) — translate them by hand; `verify:i18n` won't catch unrendered ones.

## Before you commit / push

1. `npm run build` (every change). 2. `npm run verify:all` (+ `verify:header` if header touched). 3.
Confirm `public/` diff is only the pages you intended; shop untouched. 4. Check `codex.exe` count is 0
and `git rev-parse HEAD == origin/main` (fetch first). 5. Commit per change (don't blind `git add -A`;
add specific paths). 6. End commit messages with the Co-Authored-By line. 7. Push to `main`; re-verify
`local == origin`; watch GitHub Actions (`gh run watch`) — fix red CI, don't leave it.
