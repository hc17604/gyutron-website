#!/usr/bin/env node
/**
 * verify-assets.mjs — asset & performance maintenance REPORT for gyutron.com.
 *
 * REPORT-ONLY by design (always exits 0 unless an IO error) — it surfaces things to look at, it
 * does NOT compress images, change formats, or fail the build. Run it periodically or in CI as an
 * informational step.
 *
 * USAGE (from astro/):
 *   npm run verify:assets
 *   node scripts/verify-assets.mjs --dir ../public --html dist --limit 1
 *   node scripts/verify-assets.mjs --fail-over 5      # opt-in: exit 1 if any image exceeds 5 MB
 *
 * Reports, over the DEPLOYED assets (repo-root public/, shop excluded) + built dist HTML:
 *   - large images (> --limit MB, default 1)
 *   - duplicate image content (identical bytes, by sha1)
 *   - <img> tags missing an alt attribute (in dist HTML)
 *   - decorative images (alt="") count (expected for hero layers — informational)
 *   - a shop-exclusion note (shop is out of scope and never audited/edited)
 * EXIT 0 = report (or clean), 1 = only with --fail-over and an over-limit image, 2 = IO error.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative, sep, extname } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASTRO = resolve(__dir, '..');
const args = process.argv.slice(2);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const has = (f) => args.includes(f);

const imgDir = resolve(process.cwd(), val('--dir', resolve(ASTRO, '..', 'public')));
const htmlDir = resolve(process.cwd(), val('--html', join(ASTRO, 'dist')));
const LIMIT_MB = parseFloat(val('--limit', '1'));
const LIMIT = LIMIT_MB * 1024 * 1024;
const failOver = has('--fail-over') ? parseFloat(val('--fail-over', '0')) : null;
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);
const mb = (b) => (b / 1024 / 1024).toFixed(2);

function walk(dir, skipShop) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (skipShop && /(^|[\\/])shop$/.test(p)) continue; // never audit shop
      out.push(...walk(p, skipShop));
    } else out.push(p);
  }
  return out;
}

console.log('\nAsset maintenance report (informational)\n');
if (!existsSync(imgDir)) { console.error(`asset dir not found: ${imgDir}`); process.exit(2); }

// --- Images: size + duplicate-by-content ---
const allFiles = walk(imgDir, true);
const images = allFiles.filter((f) => IMG_EXT.has(extname(f).toLowerCase()));
const shopFiles = walk(imgDir, false).length - allFiles.length;

const sized = images.map((f) => ({ f, size: statSync(f).size }));
const large = sized.filter((x) => x.size >= LIMIT).sort((a, b) => b.size - a.size);
const totalBytes = sized.reduce((a, x) => a + x.size, 0);

console.log(`  • ${images.length} image(s) under ${relative(process.cwd(), imgDir).split(sep).join('/')} · ${mb(totalBytes)} MB total · shop excluded (${shopFiles} file(s))`);

console.log(`\n  Large images (> ${LIMIT_MB} MB): ${large.length}`);
for (const x of large.slice(0, 60)) console.log(`     ${mb(x.size).padStart(7)} MB  ${relative(imgDir, x.f).split(sep).join('/')}`);
if (large.length > 60) console.log(`     … and ${large.length - 60} more`);

// duplicates by sha1 of content
const byHash = new Map();
for (const { f } of sized) {
  const h = createHash('sha1').update(readFileSync(f)).digest('hex');
  (byHash.get(h) || byHash.set(h, []).get(h)).push(f);
}
const dups = [...byHash.values()].filter((g) => g.length > 1);
console.log(`\n  Duplicate image content (identical bytes): ${dups.length} group(s)`);
for (const g of dups.slice(0, 30)) console.log(`     ${g.map((f) => relative(imgDir, f).split(sep).join('/')).join('  ==  ')}`);

// --- HTML: missing / empty alt ---
const htmlFiles = walk(htmlDir, true).filter((f) => f.endsWith('.html'));
let missingAlt = 0, emptyAlt = 0;
const missingSamples = [];
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/\balt\s*=/.test(tag)) { missingAlt++; if (missingSamples.length < 10) missingSamples.push(`${relative(htmlDir, f).split(sep).join('/')}: ${tag.slice(0, 90)}`); }
    else if (/\balt\s*=\s*("")|(\balt\s*=\s*'')/.test(tag)) emptyAlt++;
  }
}
console.log(`\n  <img> missing alt attribute (in ${htmlFiles.length} dist pages): ${missingAlt}`);
for (const s of missingSamples) console.log(`     ${s}`);
console.log(`  <img> decorative alt="" (expected for hero layers): ${emptyAlt}`);

let fail = false;
if (failOver != null) {
  const over = sized.filter((x) => x.size >= failOver * 1024 * 1024);
  if (over.length) { fail = true; console.log(`\n  ✗ --fail-over ${failOver} MB: ${over.length} image(s) exceed the cap`); }
}

console.log(fail ? '\nRESULT: FAIL ✗ (over --fail-over cap)\n' : '\nRESULT: REPORT (informational — review large/duplicate images & missing alt; nothing was changed)\n');
process.exit(fail ? 1 : 0);
