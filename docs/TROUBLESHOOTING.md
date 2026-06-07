# Troubleshooting — gyutron.com

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
