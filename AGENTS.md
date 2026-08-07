# GYUTRON repository rules for every agent

These rules apply to the whole repository. They are intentionally short and current. Do not rely on
chat history or private agent memory as project state.

## Mandatory takeover sequence

1. Run `git status -sb`, then `git fetch origin`.
2. Confirm `git rev-parse HEAD` equals `git rev-parse origin/main`. If the tree is dirty or the hashes
   differ, preserve the existing work and resolve that state before editing; never overwrite another
   agent's changes.
3. Run `npm run agent:status` from the repository root.
4. Read, in order:
   - `HANDOFF.md` — current project state and recent decisions.
   - `docs/AGENT_TAKEOVER.md` — start/work/finish protocol.
   - `docs/SAFETY_CHECKLIST.md` — operations that can break production.
   - `docs/MAINTENANCE.md` — task-to-file routing.
5. For a Shop task, also read `shop/HANDOFF.md`. For a main-site task, Shop is out of scope.

When guidance conflicts, use this priority: the user's current request → the current snapshot at the
top of `HANDOFF.md` → this file → focused docs → Git history. Historical notes are context, not active
instructions.

## Repository map

- `astro/`: authoritative source for the multilingual brand site.
- `astro/dist/`: generated build output; ignored by Git.
- `public/`: committed production assets served by Cloudflare.
- `src/`: Cloudflare Worker and backend routes.
- `shop/`, `templates/shop/`, `templates/_partials/shop-*`, locale/shop mirrors, Shop-only API/migration files, and
  `public/{shop,de/shop,ja/shop}`: separately governed official store.
- `HANDOFF.md`: cross-agent state ledger. Update it in the same commit as substantive work.

## Non-negotiable rules

- Main site locales are English, German, and Japanese. Update all affected locales and keep files UTF-8.
- Never run the legacy root `i18n:build`, `i18n:sync`, or
  `tools/generate_localized_site.py` for a main-site task; they can overwrite the Astro site.
- Never bulk-copy `astro/dist/` into `public/`. Sync only intended changed build artifacts, including
  the matching `de/` and `ja/` outputs. Never include Shop paths in a main-site sync.
- Do not touch Shop unless the user explicitly places it in scope. This includes `shop/`,
  `templates/shop/`, `templates/_partials/shop-*`, `de/shop/`, `ja/shop/`, Shop keys in `locales/i18n/`, all three deployed Shop
  trees, `public/shop-analytics.js`, Shop-only API/migration files, and Worker host routing.
- Do not invent claims, specifications, dates, customer counts, certifications, partner logos, payment
  capability, stock, or delivery promises.
- Buttons and interactive controls use only the two semantic tokens in
  `astro/public/brand-tokens.css`: `--button-purple-deep` and `--button-purple-light`. Do not introduce
  another button-purple literal.
- Preserve the hard-edged industrial system (`border-radius: 0`), responsive behavior, indexed URLs,
  accessibility, and `prefers-reduced-motion` support.
- Treat the Header DOM as high risk: mobile navigation depends on its structure. Run the header gate
  after any navigation change.
- Never guess Cloudflare binding IDs, account values, credentials, or secrets. Keep secrets out of Git.
- Preserve user and other-agent changes. Do not use destructive Git commands or blind `git add -A`.

## Required verification

For every change, from `astro/` run:

```bash
npm run build
npm run verify:all
```

Then return to the repository root and run:

```bash
npm run agent:check
npm run deploy:check
git diff --check
```

Run task-specific browser/responsive checks when rendered UI changes. `verify:i18n` and
`verify:assets` are report-oriented; review their output instead of treating a zero exit code as proof
that every warning is resolved.

## Deploy contract

The production site is the committed root `public/` directory. For rendered main-site changes:

1. Build first, then verify.
2. From the root run `npm run deploy:diff`, then copy only the intended changed files.
3. Confirm Shop has no diff.
4. Update the top of `HANDOFF.md` with scope, verification, deploy state, limitations, rollback, and the
   next safe action.
5. Stage explicit paths, commit, fetch/recheck `origin/main`, push `main`, watch CI, and verify the live
   URL or asset hash when applicable.

Docs/tooling-only changes are deploy-neutral when they do not alter `astro/dist/`; do not manufacture a
`public/` diff for them. GitHub Actions verifies the repository but does not perform the Cloudflare
deployment.

## Finish / handoff definition

A task is not handed off until the repository itself contains enough information for an agent with no
chat context to continue. The final `HANDOFF.md` entry must state:

- what changed and what deliberately did not;
- authoritative files and affected locales/routes;
- commands and visual/live checks completed;
- commit/deployment status and any known blocker;
- rollback method and next safe action.

Use `docs/AGENT_TAKEOVER.md` for the exact template. Run `npm run agent:check` before committing; CI
runs the same handoff-contract gate on every push and pull request.
