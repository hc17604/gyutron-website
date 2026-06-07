#!/usr/bin/env node
/**
 * verify-sitemap.mjs — sitemap.xml regression gate for gyutron.com.
 *
 * The sitemap is generated at build time (src/pages/sitemap.xml.ts) from config/routes + the
 * product catalog. This checks the BUILT `astro/dist/sitemap.xml` holds the invariants the SEO
 * setup relies on, so a future page/route/catalog change can't silently break it.
 *
 * USAGE (from astro/, after `npm run build`):
 *   npm run verify:sitemap
 *   node scripts/verify-sitemap.mjs --file dist/sitemap.xml
 *
 * Checks: file exists & non-empty; every <url> has exactly one <loc> + one hreflang per locale
 * (en/de/ja) + one x-default; every loc/alternate is an absolute https://www.gyutron.com URL;
 * NO shop.gyutron.com / /shop/ URLs; NO redirect-stub category slugs; <loc> count is a multiple
 * of the locale count. EXIT 0 = PASS, 1 = FAIL, 2 = IO error.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASTRO = resolve(__dir, '..');
const args = process.argv.slice(2);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const LOCALES = ['en', 'de', 'ja'];
const ORIGIN = 'https://www.gyutron.com';
// Category slugs that render as redirect stubs (no own content) — must never be in the sitemap.
const REDIRECT_STUBS = ['smart-cameras', 'industrial-sensors', 'inspection-instruments'];

const file = resolve(process.cwd(), val('--file', join(ASTRO, 'dist', 'sitemap.xml')));

let FAIL = false;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.log(`  ✗ ${m}`); FAIL = true; };

console.log('\nSitemap gate\n');
if (!existsSync(file)) { console.error(`sitemap not found: ${file}\nRun \`npm run build\` first.`); process.exit(2); }
const xml = readFileSync(file, 'utf8');
if (!xml.trim()) { console.error('sitemap is empty'); process.exit(2); }

const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
console.log(`  • ${urlBlocks.length} <url> blocks, ${locs.length} <loc> entries`);

// 1. structure: one loc + hreflang per locale + x-default per url
let structOk = true;
for (const [i, block] of urlBlocks.entries()) {
  const nLoc = (block.match(/<loc>/g) || []).length;
  const hreflangs = [...block.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]);
  const missing = LOCALES.filter((l) => !hreflangs.includes(l));
  const hasXDefault = hreflangs.includes('x-default');
  if (nLoc !== 1 || missing.length || !hasXDefault) {
    structOk = false;
    if (i < 5) bad(`url #${i + 1}: loc=${nLoc}, missing hreflang [${missing.join(',') || '-'}], x-default=${hasXDefault}`);
  }
}
if (structOk && urlBlocks.length) ok(`every <url> has 1 <loc> + hreflang ${LOCALES.join('/')} + x-default`);
else if (!urlBlocks.length) bad('no <url> blocks found');

// 2. all loc + alternates are absolute www https URLs
const allUrls = [...locs, ...[...xml.matchAll(/href="([^"]+)"/g)].map((m) => m[1])];
const badOrigin = allUrls.filter((u) => !u.startsWith(ORIGIN + '/') && u !== ORIGIN + '/');
if (badOrigin.length === 0) ok(`all ${allUrls.length} URLs use canonical origin ${ORIGIN}`);
else bad(`${badOrigin.length} URL(s) not under ${ORIGIN}: ${badOrigin.slice(0, 5).join(', ')}`);

// 3. no shop
const shopHits = allUrls.filter((u) => /\/shop(\/|$|\.)/.test(u) || u.includes('shop.gyutron.com'));
if (shopHits.length === 0) ok('no shop URLs');
else bad(`shop URL(s) present: ${shopHits.slice(0, 5).join(', ')}`);

// 4. no redirect stubs
const stubHits = locs.filter((u) => REDIRECT_STUBS.some((s) => u.includes(`/${s}.html`) || u.endsWith(`/${s}`)));
if (stubHits.length === 0) ok(`no redirect-stub pages (${REDIRECT_STUBS.join(', ')})`);
else bad(`redirect stub(s) in sitemap: ${stubHits.slice(0, 5).join(', ')}`);

// 5. loc count is a clean multiple of locale count (each canonical path × locales)
if (locs.length > 0 && locs.length % LOCALES.length === 0) ok(`<loc> count ${locs.length} = ${locs.length / LOCALES.length} paths × ${LOCALES.length} locales`);
else bad(`<loc> count ${locs.length} is not a multiple of ${LOCALES.length} (locale coverage uneven?)`);

console.log(FAIL ? '\nRESULT: FAIL ✗\n' : '\nRESULT: PASS ✓\n');
process.exit(FAIL ? 1 : 0);
