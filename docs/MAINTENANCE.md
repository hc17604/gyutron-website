# Maintenance Handbook — gyutron.com

This is the task-to-file index for the **gyutron.com brand site** (the Astro project in `astro/`). A new
agent starts with **AGENT_TAKEOVER.md**, then reads **SAFETY_CHECKLIST.md** before editing.

## 30-second orientation

- Static Astro site, 3 locales (en `/`, de `/de/`, ja `/ja/`). Content is **data-driven** (edit files
  in `src/data/` + i18n keys in `src/i18n/{en,de,ja}.json`, not the components).
- Deploy = Cloudflare serves the **committed `public/`**. Build with `cd astro && npm run build`; sync
  only changed pages from `astro/dist/` → `public/` (see DEPLOYMENT.md). `dist/` is gitignored.
- Gates: `npm run verify:all` (+ `verify:header` after header changes). CI runs them on every push.
- Agent continuity: from the root run `npm run agent:status`; before commit run `npm run agent:check`
  and update the newest state in `HANDOFF.md`.
- Out of scope: **shop.gyutron.com** (never touch). No cart/payment/orders/inventory.

## How do I… (task → where)

| Task | Where | Doc |
|---|---|---|
| Add a product category | `data/products.{en,de,ja}.js` (+ `seo.<cat>` keys, nav link) | CONTENT_GUIDE |
| Add a product card | `data/products.{en,de,ja}.js` (+ image, `i18n-audit.py`) | CONTENT_GUIDE |
| Edit homepage hero/carousel | `data/heroSlides.ts` (+ i18n keys) | CONTENT_GUIDE, HANDOFF §6 |
| Edit contact-form product options | `CONTACT_PRODUCT_OPTIONS` in `data/products.ts` | CONTENT_GUIDE, COMPONENTS |
| Add / edit a solution | `data/solutions.ts` (+ i18n keys, page wrappers) | SOLUTIONS_GUIDE |
| Add / edit a FAQ | `data/faq.ts` | CONTENT_GUIDE |
| Add a news post | `data/news.ts` (`NEWS`), homepage Newsroom | CONTENT_GUIDE |
| Edit partners / ecosystem | `data/partners.ts` (`PARTNERS`) | CONTENT_GUIDE |
| Edit the About / company section | `home.x.about.*` keys + `aboutImages` in `Home.astro` | CONTENT_GUIDE |
| Edit the Header mega-menu | `data/header-navigation.ts` (then `verify:header`) | CONTENT_GUIDE, COMPONENTS |
| Edit header scroll / back-to-top behavior | `layouts/Layout.astro` + `public/nav-chrome.css` (then `verify:scroll-chrome`) | COMPONENTS |
| Edit the Footer | `data/navigation.ts` `FOOTER_NAV` (+ `company.ts`, `footer.*` keys) | CONTENT_GUIDE |
| Edit multilingual copy | `src/i18n/{en,de,ja}.json` (all three) | I18N |
| Add a language | `astro.config.mjs` + `src/i18n` + dicts + `products.<code>.js` + pages | I18N, ADD-A-LANGUAGE |
| Add a page | page `.astro` (×3 locales) + i18n + nav + register in `data/pages.ts` | ROUTES |
| Update the sitemap | automatic (build-time `sitemap.xml.ts` from `data/pages.ts` + catalog) | ROUTES, SEO |
| Check SEO | `verify:seo` + the new-page SEO checklist | SEO |
| Run verification | `npm run verify:all` (+ `verify:header`/`verify:assets`/`verify:a11y-lite`) | TROUBLESHOOTING |
| Hand work to another agent | `npm run agent:status` / `agent:check` + update `HANDOFF.md` | AGENT_TAKEOVER |
| Decide if `public/` needs syncing | root `npm run deploy:diff` (read-only; Shop excluded) | DEPLOYMENT, SAFETY_CHECKLIST |
| Sync `public/` | copy only the changed `astro/dist/<page>` → `public/<page>` | DEPLOYMENT |
| Roll back the Header | revert the nav commit(s), rebuild, re-sync | TROUBLESHOOTING |
| Roll back `public/` | `git checkout <prev> -- public/<page>` (or revert the commit) | DEPLOYMENT, §Rollback below |
| Handle i18n residual English | fix the source string (dict or `products.{de,ja}.js`), TODO uncertain terms | I18N |
| Handle images & alt | `data/assets.ts` + rules; `verify:assets` | PERFORMANCE, CONTENT_GUIDE |
| Read the a11y report | `verify:a11y-lite` (hard checks + report items) | ACCESSIBILITY |
| Read the performance report | `verify:assets` | PERFORMANCE |
| Know what NOT to edit | the don't-touch list | SAFETY_CHECKLIST |
| Know which modules are mock | api/forms(partly)/crm/cms/agent/logger | FUTURE_INTEGRATIONS |
| Plan future CMS/CRM/Agent | adapter-swap pattern | FUTURE_INTEGRATIONS |
| Debug a failed CI / deploy | see below + TROUBLESHOOTING | TROUBLESHOOTING |

## Which modules are mock / placeholder

Real today: the **contact form** (`POST /api/contact` → Cloudflare worker → Resend). Everything else
under `src/lib/` is **mock/scaffold**: `lib/cms` (local adapter delegates to `src/data`), `lib/crm`,
`lib/agent` (in-memory mocks), `lib/api`, `lib/forms` inquiry/validation, `lib/logger`. They expose
stable interfaces so a real backend can swap in later — see FUTURE_INTEGRATIONS.md.

## CI / deploy failures (quick triage)

- **GitHub Actions red:** open the run (`gh run list` / `gh run watch`), read the failing step. It is one
  of build / verify:header / verify:sitemap / verify:routes / verify:seo / verify:a11y-lite. Reproduce
  locally (`cd astro && npm run build && npm run verify:all`), fix the data/source, push. CI never
  deploys — a red run does not affect the live site, but fix it before merging.
- **Cloudflare didn't update:** the site serves the committed `public/`. If a change isn't live, you
  probably edited `astro/src` but didn't sync `astro/dist/<page>` → `public/<page>` and commit it. Check
  `git status public/` and the DEPLOYMENT.md sync step.
- **"Live site reverted to old design":** the legacy generator was run and clobbered `public/`. See
  TROUBLESHOOTING.md; restore `public/` from the last good Astro build and never run the generator.

## Rollback

- **Per commit:** every phase is its own commit — `git revert <hash>` (or `git checkout <hash>~1 -- <paths>`)
  to undo one. Additive files (new `data/`/`lib/`/`scripts/`/`docs/`) are safe to delete.
- **Header:** see TROUBLESHOOTING.md "Roll back a header / nav refactor".
- **A deployed page:** `git checkout <good-hash> -- public/<page>.html` then commit (re-sync from a known
  good `dist` if needed).
