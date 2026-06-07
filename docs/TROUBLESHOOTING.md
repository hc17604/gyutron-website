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

## Where to look
`docs/` (this folder), repo-root `HANDOFF.md` (operational handoff), `tools/i18n-audit.py` (i18n gate).
