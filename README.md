# GYUTRON — gyutron.com

Brand website for GYUTRON (industrial automation, machine vision, traceability,
PDAs, sensors, industrial control hardware). Built on **Astro** and served by a
**Cloudflare Worker + Static Assets**.

Supported toolchain: **Node 24**, npm with committed root and `astro/` lockfiles, Astro **5.18.2**.

> **Single source of truth for current state:** [`HANDOFF.md`](./HANDOFF.md).
> New agent? Run `npm run agent:status`, then follow
> [`docs/AGENT_TAKEOVER.md`](./docs/AGENT_TAKEOVER.md). Task routing and red lines live in
> [`docs/MAINTENANCE.md`](./docs/MAINTENANCE.md) and
> [`docs/SAFETY_CHECKLIST.md`](./docs/SAFETY_CHECKLIST.md).

## Layout

| Path            | What                                                                 |
| --------------- | -------------------------------------------------------------------- |
| `astro/`        | The Astro site (components, pages, i18n, product data). Builds to `astro/dist`. |
| `public/`       | The **committed, deployed** static output (what Cloudflare serves).  |
| `src/`          | The **Cloudflare Worker**: router + backend (`platform/`, `api/`, `contact-handler.mjs`). |
| `migrations/`   | Cloudflare **D1** SQL migrations.                                    |
| `docs/`         | Frontend + backend documentation.                                   |
| `wrangler.toml` | Worker + assets + active D1/R2/KV production bindings (IDs are non-secret). |

## Frontend (Astro)

```bash
cd astro
npm ci
npm run build         # → astro/dist  (then sync changed files into ../public)
npm run verify:all    # header / sitemap / routes / seo / a11y gates
```

Repository-level takeover checks (run from the root):

```bash
npm run agent:status  # branch, HEAD/origin relation, dirty files, recent handoff entries
npm run agent:check   # handoff structure + committed-state freshness gate
npm run deploy:diff   # read-only astro/dist ↔ public comparison; Shop excluded
npm run deploy:check  # CI gate: built brand output must already be committed in public/
```

Three locales: `en` (root), `de` (`/de/`), `ja` (`/ja/`). Deploy = commit the
changed `public/` files; Cloudflare serves them. See [`CLOUDFLARE_DEPLOYMENT.md`](./CLOUDFLARE_DEPLOYMENT.md).

## Backend (Phase 1 — Data Layer + Data API)

The Worker captures inbound (Contact / RFQ / Support / Download) into D1, emits a
unified event stream, and exposes a **read-only Data API** (`/api/v1/*`) for the
GYUTRON Agent Workspace to consume. There is **no customer login** on the brand site
(accounts/cart/orders live on `shop.gyutron.com`).

```bash
node scripts/smoke-platform.mjs                         # offline logic tests
npx wrangler deploy --dry-run --outdir .wrangler/dry-run  # validate the bundle
npx wrangler dev                                        # local (see docs)
```

Backend docs:

- [`docs/backend-architecture.md`](./docs/backend-architecture.md) — system topology + module map.
- [`docs/data-api-contract.md`](./docs/data-api-contract.md) — the `/api/v1/*` contract.
- [`docs/cloudflare-deployment.md`](./docs/cloudflare-deployment.md) — create D1/R2, secrets, migrations, deploy, rollback.
- [`docs/phase-roadmap.md`](./docs/phase-roadmap.md) — what's in/out of each phase.

> D1, R2, and rate-limit KV are currently declared as active production bindings in
> `wrangler.toml`; their identifiers are non-secret and intentionally committed. Runtime secrets stay
> in Cloudflare Worker secrets. Do not recreate, replace, or comment a binding without explicit
> approval and the checks in `docs/cloudflare-deployment.md`.
