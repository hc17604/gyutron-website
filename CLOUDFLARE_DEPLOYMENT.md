# Cloudflare Deployment Notes

This site must deploy from the clean `public/` asset directory, not from the repository root.

## Workers deployment

Use the checked-in Wrangler config:

```bash
npx wrangler deploy
```

`wrangler.jsonc` sets:

```json
"assets": {
  "directory": "./public",
  "binding": "ASSETS"
}
```

Do not use `--assets .`, `--assets /opt/buildhome/repo`, or any deploy command that points assets at the repository root. That can upload `.git/`, source files, and temporary files.

## Cloudflare Pages fallback

If deploying as a plain static Pages project instead of Workers, use:

```text
Build command: 
Build output directory: public
Deploy command: 
```

Leave build and deploy commands blank unless Cloudflare requires a value. If it requires a build command, use a no-op such as `true`.
