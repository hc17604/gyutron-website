import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

/**
 * Append a build-time CONTENT HASH to a local CSS href so a browser re-fetches the file whenever it
 * changes. The `public/` CSS is linked by a stable path with NO hash, so without this a browser that
 * cached an older stylesheet keeps using it after a deploy — and stale CSS + newly-deployed markup
 * renders broken (this is exactly what happened to the Industries flyout). The hash is derived from the
 * file's bytes, so it updates automatically on every edit — nothing to bump by hand.
 *
 * External URLs (font CDNs) and any non-`.css` / missing file pass through unchanged. Computed once per
 * href (memoised) at build time.
 */
const cache = new Map<string, string>();

export function withVersion(href: string): string {
  if (!href.startsWith('/') || !href.endsWith('.css')) return href;
  const memo = cache.get(href);
  if (memo) return memo;
  let out = href;
  try {
    const bytes = readFileSync(join(process.cwd(), 'public', href.replace(/^\//, '')));
    out = `${href}?v=${createHash('sha1').update(bytes).digest('hex').slice(0, 8)}`;
  } catch {
    out = href; // file not found at build time → link as-is rather than fail the build
  }
  cache.set(href, out);
  return out;
}
