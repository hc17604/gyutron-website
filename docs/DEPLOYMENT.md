# Deployment — gyutron.com

## Model

- **Cloudflare Worker serves the committed `public/` directory.** Cloudflare does **not** run a build.
- **Push to `main` → Cloudflare auto-deploys.** So `public/` must contain the built site, and it is
  git-tracked.
- `wrangler.toml`: `main = src/worker.mjs`, `[assets] directory = "./public"`, `run_worker_first = true`.
- `src/worker.mjs` routes: `POST /api/contact` → `contact-handler.mjs` (Resend email);
  `shop.gyutron.com/*` → rewrites to `/shop/` (out of scope); everything else → `env.ASSETS.fetch`.

## Local dev

```
cd astro
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs astro/dist (also the missing-i18n-key gate)
npm run preview   # serve the build
npm run check     # astro check (type/diagnostics)
```

## Deploy procedure (every change to a rendered page)

1. Edit `astro/src/**`.
2. `cd astro && npx astro build` (63 pages; a missing i18n key throws — that's the gate).
3. **Sync the changed build output into the committed `public/`**: copy the changed
   `astro/dist/<file>` to the same path under `public/` (e.g. `index.html`, `de/index.html`,
   `ja/index.html`, changed `.css`, `_astro/…`). Only `public/` is deployed. **Never touch the
   `shop` subtrees.**
4. Commit `astro/` **and** `public/` with an explicit path list, then push.

> Pure scaffolding changes (new files under `src/config`, `src/types`, `src/lib`, `src/data`, `docs/`,
> `.env.example`) that **no page imports** do not change `astro/dist`, so there is nothing to sync to
> `public/` and the live site is unaffected.

## Concurrency guard (a Codex agent also auto-commits to `main`)

Before **any** edit and immediately before **every** push:

```powershell
@(Get-Process -Name codex -ErrorAction SilentlyContinue).Count   # must be 0
git fetch origin; git rev-parse HEAD; git rev-parse origin/main  # must be equal
```

If Codex is running and you need a clean window, stop it (`Stop-Process -Name codex -Force` — codex.exe
only, never `node`), deploy, then tell the user to restart Codex. Commit with explicit paths
(`git add -- astro/ public/ docs/ …`), never a blind `git add -A`.

## Never run the legacy generator

`npm run i18n:build` / `i18n:sync` / `python tools/generate_localized_site.py` regenerate the **old**
HTML into `public/` and **clobber the Astro site**. See TROUBLESHOOTING.md.
