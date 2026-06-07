# Troubleshooting — gyutron.com

## Website verification gates (`npm run verify:*`)

Run from `astro/` **after `npm run build`** (they read `astro/dist`). Also run automatically in CI
(`.github/workflows/verify.yml`) on push/PR to `main` — build + header/sitemap/routes/seo/a11y-lite as
hard gates, i18n + assets informational; CI never deploys.

| Command | Checks | Gate |
|---|---|---|
| `npm run verify:header` | built header (en/de/ja) is equivalent to deployed `public/` + structural/mobile-hook contract (see "Verify a header / nav change" below) | hard |
| `npm run verify:sitemap` | `dist/sitemap.xml`: every `<url>` has hreflang en/de/ja + x-default, canonical `https://www.gyutron.com`, NO shop, NO redirect stubs, `<loc>` count = paths×locales | hard |
| `npm run verify:routes` | `config/routes` core pages exist in en/de/ja; every Header/Footer internal link resolves to a built page (known footer placeholders listed, not failed) | hard |
| `npm run verify:seo` | every built `dist/**.html` page's `<head>`: title, meta description, robots, canonical (correct locale prefix), hreflang en/de/ja + x-default, og + twitter:card, ≥1 valid JSON-LD; redirect stubs skipped | hard |
| `npm run verify:a11y-lite` | static a11y scan of dist HTML: HARD = every `<img>` has alt, no empty `href`, `<html lang>`; REPORT = icon-only unnamed links/buttons, duplicate ids, >1 `<h1>`, `.nav-trigger` without `aria-expanded` (see ACCESSIBILITY.md) | hard (report items don't fail) |
| `npm run verify:i18n` | heuristic residual-English scan of de/ja pages; ALL-CAPS acronyms / model names excluded, a proper-noun allowlist applies | **report** (exit 0) |
| `npm run verify:assets` | asset report over deployed `public/` (shop excluded) + dist HTML: large images (>1 MB), duplicate image bytes, `<img>` missing alt, decorative `alt=""` count | **report** (exit 0; `--fail-over N` opt-in gate) |
| `npm run verify:all` | header, sitemap, routes, seo, a11y-lite, i18n in sequence | hard (i18n stays report) |

- A `verify:*` FAIL prints exactly what broke. Fix the data/source, rebuild, re-run.
- `verify:i18n` is REPORT-only on purpose: product-spec *values* in de/ja are still English (deferred
  pending a glossary), so it currently flags those by design. Add `-- --strict` to make it a hard gate
  once spec translation is complete; extend its `CONTEXT_ALLOWLIST` for legitimate English proper nouns.
- New verify scripts live in `astro/scripts/*.mjs` (plain Node, no dependencies).

## CI / deploy failures

- **GitHub Actions run is red.** `gh run list` → `gh run watch <id>` (or open the run on GitHub) and
  read the failing step. It's always one of: `build`, `verify:header`, `verify:sitemap`,
  `verify:routes`, `verify:seo`, `verify:a11y-lite` (i18n + assets are informational and never fail).
  Reproduce locally: `cd astro && npm run build && npm run verify:all` (+ `verify:a11y-lite`), fix the
  data/source, push again. **CI never deploys**, so a red run doesn't change the live site — but don't
  leave it red. Common causes: a new visible string missing from one of the three i18n dicts (build
  throws), a header edit that broke the DOM contract (`verify:header`), or a new page missing a SEO tag
  (`verify:seo`).
- **GitHub Actions install step fails.** The workflow uses `npm install` (NOT `npm ci`) because
  `package-lock.json` is gitignored by convention. If you add a real dependency, install locally and
  confirm the build still works; don't commit a lockfile unless the convention changes.
- **Cloudflare didn't pick up a change.** The Worker serves the committed **`public/`**, with no build
  step. If your change isn't live, you likely edited `astro/src/**` and built `astro/dist/` but forgot
  to sync the changed page into `public/` and commit it. Check `git status public/` and re-do the
  DEPLOYMENT.md sync (copy only the affected `astro/dist/<page>` → `public/<page>`, never bulk-copy,
  never shop). Pushing to `main` is what triggers the deploy.

## Build fails: `[i18n] missing key "x" for locale "de"`
A page references a key that isn't in `de.json` (or `ja`/`en`). Add the key to **all three** dicts.
This gate is intentional — it stops English from silently shipping.

## de/ja text shows `?` mojibake
Python wrote non-UTF-8. Re-run the script with `PYTHONUTF8=1 PYTHONIOENCODING=utf-8` and re-translate
the affected values. Verify with `python tools/i18n-audit.py` (exit 0 = clean).

## The live site reverted to the old design / lost the Astro pages
Someone ran the **legacy generator** (`npm run i18n:build`, `i18n:sync`, or
`tools/generate_localized_site.py`), which regenerated old HTML into `public/` and clobbered the Astro
build. Fix: `git restore`/`git revert` the bad commit's `public/` changes, rebuild Astro
(`cd astro && npx astro build`), re-sync `dist/* → public/`, push. **Never run those scripts.**

## `git push` shows red text but seems to work (PowerShell)
PowerShell wraps a native command's stderr as a `NativeCommandError` even on success. Trust the
re-check: `git fetch; git rev-parse HEAD` == `git rev-parse origin/main`.

## My commit and Codex's diverged
A Codex agent also auto-commits to `main`. `git fetch origin`, compare `HEAD` vs `origin/main`. If
behind, rebase/pull. Before pushing again, confirm `@(Get-Process -Name codex).Count` is 0.

## Dev/preview port 4321 already in use
`Get-NetTCPConnection -LocalPort 4321 -State Listen` → `Stop-Process` that PID (never kill `node`
broadly). Then `npm run dev` / `npm run preview`.

## A new page 404s
Check: (a) the `.html` URL matches `build.format: 'preserve'`; (b) the `de/` and `ja/` wrapper files
exist; (c) for a product category, its key has `products` or `redirectTo` in `products.en.js`.

## Contact form returns 503
The worker's `RESEND_API_KEY` / `CONTACT_FROM_EMAIL` env vars aren't set in Cloudflare. The form
degrades gracefully (shows the fallback email). Set the secrets in the Cloudflare dashboard.

## `npm run check` complains about scaffold files
`src/config`, `src/types`, `src/lib/{api,forms,crm,cms,agent,logger}` are typed scaffolding. They must
stay type-clean even though no page imports them yet. Fix the types; don't delete the files.

## `astro build` fails: "Expected ; but found …" inside a `.ts` data file
A JS block comment (`/** … */`) contains a `*/` sequence in its text — e.g. a path glob written as
`pages/**/support` (the `**/` includes `*/`, which closes the comment early; the rest is parsed as code).
Fix: avoid `*/` / `**/` inside doc comments — write `pages/[locale]/support` or `src/pages/.../support`.

## Verify a header / nav change (the header is a hard DOM contract)

The header nav is data-driven (`data/header-navigation.ts` → `components/navigation/*`), but its rendered
DOM is a contract with the desktop CSS, the `Header.astro`/`Home.astro` inline scripts, and
`public/mobile-navigation.js` (which **clones the rendered desktop DOM by CSS selector**). After ANY change
to `Header.astro`, the `components/navigation/*` pieces, or `data/header-navigation.ts`, don't eyeball —
run the gate:

```
cd astro
npm run build          # always build first; missing i18n key throws here
npm run verify:header  # strict: built header must be EQUIVALENT to the deployed public/
```

- **PASS ✓ (exit 0)** — the freshly-built header (en/de/ja) is whitespace-normalized byte-identical to the
  deployed `public/` header, the structural contract holds, and the three locales share one structure.
  This is the expected result for a *rendering/refactor* change that shouldn't alter content.
- **FAIL ✗ (exit 1)** — the report prints exactly what changed: `href` / `class` / `style url()` items
  **removed** or **added**, and count deltas (`nav-item`, `mega-menu`, `mega-link-group`, `mega-link`,
  `submenu`, `submenu--intro`, bare link). `removed` items / decreasing counts = a likely accidental loss.

**Made an intentional nav change** (added a product, a section, a link)? The strict gate fails because the
built header now differs from the still-old deployed `public/`. Re-run `npm run verify:header -- --report`:
content deltas become INFO (a removal/decrease is shown as a ⚠ loss to double-check), and only the
**structural contract** stays a hard gate — mobile/desktop hook classes present (`.nav .nav-item .nav-trigger
.mega-menu .mega-links .button-primary .language-switch-mobile|.language-icon-mobile .nav-search data-locale
data-noresults .brand`) and count invariants (`nav-item==mega-menu`, `mega-links==mega-menu`,
`mega-link-group==mega-link==submenu`, `submenu--intro<=submenu`, `mega-compact<=mega-menu`). Confirm the
printed deltas are exactly what you intended, then sync `dist/*.html → public/` and deploy; after the sync,
strict `verify:header` passes again.

Mode of operation: STRICT compares the whole normalized header region (`<div class="top-strip"> … </header>`,
which covers every desktop/mobile dependency) — an identical region means no regression, so it is the safe
default. REPORT mode's structural gate is **count-level**: it deliberately allows a *balanced* content
change (e.g. removing a whole group: link-group+mega-link+submenu all drop together) and only flags it via
the loss warning — for a non-content (component markup) change, rely on STRICT. Other flags:
`--reference ../public` / `--candidate dist` (override sources), `--ref-file a --cand-file b` (diff two
header files directly), `--locales en,de,ja`.

**Which classes are mobile-load-bearing — do NOT rename/drop:** `.nav`, `.nav-item`, `.nav-trigger`,
`.mega-menu` (+`.mega-compact`), `.mega-links`, `.mega-section-label`, `.mega-link-group`, `.mega-link`,
`.submenu` (+`.submenu--intro`), `.brand`, `.button-primary`, `.language-switch-mobile`/`.language-icon-mobile`,
`.nav-search` (+ its `data-locale` / `data-noresults`). `mobile-navigation.js` selects on all of these.

## Roll back a header / nav refactor

The change is isolated: `components/navigation/*`, `data/header-navigation.ts`, `types/navigation.ts`, plus
the `Header.astro` + `data/navigation.ts` edits, and the `public/*.html` re-render. To revert, `git revert`
the nav commits (or `git checkout <prev> -- astro/src/components/navigation astro/src/data/header-navigation.ts
astro/src/types/navigation.ts astro/src/components/Header.astro astro/src/data/navigation.ts`), then rebuild
Astro and re-sync `dist/*.html → public/`. No other subsystem depends on the new files.

## Where to look
`docs/` (this folder), repo-root `HANDOFF.md` (operational handoff), `tools/i18n-audit.py` (i18n gate).
