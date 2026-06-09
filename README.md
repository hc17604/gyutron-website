# GYUTRON — gyutron.com

Brand website for GYUTRON (industrial automation, machine vision, traceability,
PDAs, sensors, industrial control hardware). Built on **Astro** and served by a
**Cloudflare Worker + Static Assets**.

> **Single source of truth for engineers/agents:** [`HANDOFF.md`](./HANDOFF.md).
> New here? Start at [`docs/MAINTENANCE.md`](./docs/MAINTENANCE.md) and
> [`docs/SAFETY_CHECKLIST.md`](./docs/SAFETY_CHECKLIST.md).

## Layout

| Path            | What                                                                 |
| --------------- | -------------------------------------------------------------------- |
| `astro/`        | The Astro site (components, pages, i18n, product data). Builds to `astro/dist`. |
| `public/`       | The **committed, deployed** static output (what Cloudflare serves).  |
| `src/`          | The **Cloudflare Worker**: router + backend (`platform/`, `api/`, `contact-handler.mjs`). |
| `migrations/`   | Cloudflare **D1** SQL migrations.                                    |
| `docs/`         | Frontend + backend documentation.                                   |
| `wrangler.toml` | Worker + assets + (commented) D1/R2/KV bindings.                     |

## Frontend (Astro)

```bash
cd astro
npm install
npm run build         # → astro/dist  (then sync changed files into ../public)
npm run verify:all    # header / sitemap / routes / seo / a11y gates
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

> The backend self-disables when its bindings/secrets are absent, so the static
> site and contact email keep working. D1/R2/KV bindings ship **commented** in
> `wrangler.toml` — activate them per `docs/cloudflare-deployment.md`.
