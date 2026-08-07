# Agent Takeover Runbook — gyutron.com

This is the stable operating procedure for Claude, Codex, and any future engineering agent. A new
agent must be able to continue using only Git and files in this repository.

## Two-minute takeover

Run from the repository root:

```powershell
git status -sb
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
npm run agent:status
```

Supported runtime is Node 24. Dependency state is locked in root and `astro/` `package-lock.json`; use
`npm ci` for a fresh checkout and do not substitute another package manager in committed work.

Interpret the result before editing:

- Clean tree + equal hashes: safe baseline.
- Dirty tree: treat every file as someone else's work until proven otherwise. Inspect it; do not reset,
  overwrite, or pull through it.
- Local behind remote: synchronize safely before editing.
- Local ahead or diverged: inspect commits and coordinate; do not force-push.
- `agent:status` reports cached remote state only, so `git fetch origin` comes first.

Read `HANDOFF.md`'s fast snapshot and newest entries, then `AGENTS.md` and
`docs/SAFETY_CHECKLIST.md`. Search older `HANDOFF.md` entries only when they relate to the task; the
chronological history contains superseded design iterations.

## Authority and project boundaries

| Concern | Authority |
|---|---|
| Current production state and recent decisions | `HANDOFF.md` fast snapshot + newest dated entries |
| Mandatory cross-agent rules | `AGENTS.md` |
| Task-to-file map | `docs/MAINTENANCE.md` |
| Dangerous operations | `docs/SAFETY_CHECKLIST.md` |
| Build/public deployment | `docs/DEPLOYMENT.md` |
| Main-site source | `astro/` |
| Production static output | root `public/` |
| Worker/backend | root `src/`, `migrations/`, `wrangler.toml` |
| Shop | `shop/HANDOFF.md` plus Shop source/output paths |

The current user's request wins over older product/design decisions, but it does not silently broaden
scope. Ask before changing Shop, backend bindings, payment behavior, routing, or a large unrelated
surface.

## Start-of-task record

Before editing, know and state:

1. exact task and explicit out-of-scope areas;
2. clean/dirty status and HEAD versus `origin/main`;
3. source files and generated/deployed files expected to change;
4. validation needed for the risk level;
5. whether the task is deploy-neutral or requires a `public/` sync.

Do not encode active task state only in chat. If work will span agents, add a short `IN PROGRESS` entry
at the top of `HANDOFF.md` with ownership, changed paths, completed checks, and the next exact action.
Replace it with a completed entry before final delivery.

## During implementation

- Make small, reversible changes and preserve unrelated work.
- Use authoritative source files; do not hand-edit only generated locale pages.
- Build before inspecting `astro/dist/` or running deploy comparisons.
- Treat `astro/dist/` as a build subset, not a mirror-delete source. Root `public/` has intentional
  public-only production assets; `astro preview` may not resolve them, so final route/asset acceptance
  uses `npx wrangler dev` or the live site.
- Keep CSS version hashing line-ending neutral. `withVersion()` intentionally normalizes CRLF/LF before
  hashing so Windows and Linux agents produce the same deployed HTML.
- Keep en/de/ja aligned and preserve UTF-8.
- For rendered changes, validate the affected desktop/tablet/mobile states and interactive states.
- Never claim a check passed unless it was run in the current worktree.
- Treat Turnstile as a two-sided contract: built form pages must contain the public widget and the
  Worker may enforce an external secret. The hard gate checks the HTML; only a human browser submission
  confirms the complete production flow.

## End-of-task sequence

1. From `astro/`: `npm run build`, then `npm run verify:all`.
2. From the root: `npm run agent:check`, then `git diff --check`.
3. If rendered output changed, run root `npm run deploy:diff`, then sync only intended files from
   `astro/dist/` to root `public/`; rebuild and re-run checks if the sync decision changes.
4. For main-site work, confirm this Shop guard is empty:

   ```bash
   git diff --name-only -- shop templates/shop templates/_partials/shop-footer.html templates/_partials/shop-head-tail.html templates/_partials/shop-header.html de/shop ja/shop public/shop public/de/shop public/ja/shop public/shop-analytics.js src/api/order-intents.mjs src/api/shop-events.mjs migrations/0002_order_intents.sql
   ```

   Also inspect any `locales/i18n/*.json` or `src/worker.mjs` diff for Shop-specific keys/routing.
5. Update the fast snapshot if project-wide state changed, and prepend a dated entry to the current
   state section in `HANDOFF.md`.
6. Review the exact diff, stage explicit paths, commit, fetch/recheck the remote, then push.
7. Watch GitHub CI. For deployed UI/assets, verify the production URL, cache key, or byte hash.
8. Leave the worktree clean and `HEAD == origin/main` unless a blocker is explicitly documented.

## Verification matrix

| Command | Run from | Writes files | Meaning | CI |
|---|---|---:|---|---:|
| `npm run agent:status` | root | no | Git/worktree and latest handoff snapshot | no |
| `npm run agent:check` | root | no | hard handoff structure/freshness gate | yes, via Astro alias |
| `npm run build` | `astro/` | `astro/dist/` | hard Astro/i18n build gate | yes |
| `npm run verify:all` | `astro/` | no | hard structural gates plus report-only i18n output | equivalent explicit CI steps |
| `npm run verify:assets` | `astro/` | no | asset/performance report; review warnings | yes, report step |
| `npm run deploy:diff` | root | no | byte comparison of build and committed deploy, Shop excluded | no |
| `npm run deploy:check` | root | no | hard gate: every built brand file is committed in `public/` | yes |
| `node scripts/smoke-platform.mjs` | root | no | Worker/platform offline logic smoke | yes |
| `npx wrangler deploy --dry-run --outdir .wrangler/dry-run` | root | ignored bundle | Worker config/binding bundle gate; does not deploy | yes |
| `npm run shop:verify` | root | check mode | Shop baseline/isolation check | yes |

Do not summarize report-oriented checks as "zero warnings" unless their actual output says that. The
handoff entry records both the exit result and remaining baseline reports.

## Required HANDOFF entry template

```markdown
> **YYYY-MM-DD (Agent) — Short outcome.**
> Scope: what changed, authoritative files, routes/locales affected.
> Preserved: what was intentionally not changed, especially Shop/backend/routing.
> Verification: exact commands, viewport/browser/live checks, and result.
> Deploy: deploy-neutral / pushed commit / CI / live verification.
> Limits: known warnings, credentials or human decisions still needed.
> Rollback: commit or exact files to restore.
> Next: one concrete safe continuation, or "none".
```

For a partial handoff, explicitly label it `IN PROGRESS` and add:

- files currently modified;
- last successful check;
- current error or uncertainty verbatim;
- exact next command/action;
- whether anything has been pushed or deployed.

## What `agent:check` guarantees

`npm run agent:check` is a dependency-free structural gate. It verifies that takeover entry files exist,
active docs point to the same source/build/deploy model, the local verification command includes the
handoff gate, CI runs it, and committed implementation work is not newer than the applicable handoff
ledger. It cannot replace a truthful handoff entry or visual/live QA.

## Recovery when context is missing

If an agent receives only "continue" or "deploy":

1. run the takeover commands;
2. read the newest `HANDOFF.md` entry and recent Git commits;
3. inspect the dirty diff, if any;
4. reconstruct the intended next action from repository evidence;
5. stop before irreversible or external changes if evidence is insufficient.

Repository evidence beats remembered conversation. Never invent the missing state.
