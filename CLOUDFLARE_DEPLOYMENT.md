# Cloudflare Deployment Notes

This site must deploy from the clean `public/` asset directory, not from the repository root.

## Workers deployment

Use the checked-in Wrangler config:

```bash
npm run deploy
```

As of 2026-08-07, the local Wrangler OAuth token can identify the account but deployment inspection
returns Cloudflare API authentication error 10000. Run `npx wrangler login` and verify access before a
manual deploy; do not describe manual deployment as available until that check passes. Push-to-main
auto-deploy is configured outside this repository in Cloudflare and is separate from GitHub CI.

`wrangler.toml` sets:

```toml
[assets]
directory = "./public"
binding = "ASSETS"
```

Do not use `--assets .`, `--assets /opt/buildhome/repo`, or any deploy command that points assets at the repository root. That can upload `.git/`, source files, and temporary files.

If Cloudflare logs `assets directory /opt/buildhome/repo`, its dashboard deployment settings are not applying the repository config and Wrangler is auto-detecting the repository root as the asset directory. Change the Worker Build deploy command to one of these:

```bash
npm run deploy
```

or:

```bash
npx wrangler deploy --config wrangler.toml
```

The safest explicit command is:

```bash
npx wrangler deploy --config wrangler.toml --assets ./public/
```

The repo also includes `.wrangler/deploy/config.json` so the plain dashboard command `npx wrangler deploy` can be redirected to `wrangler.toml`, but the dashboard command with `--assets ./public/` is the most reliable because it bypasses Wrangler auto-detection entirely.

## Cloudflare Pages fallback

This is an **emergency static-only degradation**, not an equivalent production deployment. Plain Pages
would not provide the Worker APIs, contact/RFQ/support/download handling, admin/Data API, D1/R2/KV
behavior, scheduled backups, or `shop.gyutron.com` host routing.

Only if the user explicitly accepts those losses, use:

```text
Build command: 
Build output directory: public
Deploy command: 
```

Leave build and deploy commands blank unless Cloudflare requires a value. If it requires a build command, use a no-op such as `true`.
