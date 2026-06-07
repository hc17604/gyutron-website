#!/usr/bin/env node
/**
 * verify-seo.mjs — per-page SEO <head> regression gate for gyutron.com.
 *
 * Every indexable page renders its <head> via `components/seo/SeoHead.astro` (through
 * `Layout.astro`). This checks the BUILT `astro/dist/**.html` pages so a future page that
 * forgets a SEO field (or a SeoHead change that drops one) fails loudly. Redirect-stub pages
 * (<meta http-equiv="refresh">) have no SeoHead and are SKIPPED, like the sitemap excludes them.
 *
 * USAGE (from astro/, after `npm run build`):
 *   npm run verify:seo
 *   node scripts/verify-seo.mjs --dist dist
 *
 * Per page it asserts: exactly one non-empty <title>; non-empty meta description; a robots
 * directive; a canonical under the www origin whose locale prefix matches the page's locale;
 * hreflang en/de/ja + x-default (one each, absolute www URLs); og:type/url/title/description/
 * image (image absolute) + twitter:card; >=1 application/ld+json block, each valid JSON with
 * @context + @type. EXIT 0 = PASS, 1 = FAIL, 2 = IO error.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative, sep } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASTRO = resolve(__dir, '..');
const args = process.argv.slice(2);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const ORIGIN = 'https://www.gyutron.com';
const LOCALES = ['en', 'de', 'ja'];
const distDir = resolve(process.cwd(), val('--dist', join(ASTRO, 'dist')));

let FAIL = false;
let failPages = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.log(`  ✗ ${m}`); FAIL = true; };

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

function localeOf(rel) {
  if (rel.startsWith('de/')) return 'de';
  if (rel.startsWith('ja/')) return 'ja';
  return 'en';
}

function checkPage(file) {
  const rel = relative(distDir, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');
  // Skip redirect stubs (MetaRedirect) — they have no SeoHead.
  if (/http-equiv=["']?refresh/i.test(html)) return { skipped: true, rel };

  const head = (html.match(/<head[\s\S]*?<\/head>/i) || [html])[0];
  const errs = [];
  const loc = localeOf(rel);

  // 1. title
  const titleM = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleM || !titleM[1].trim()) errs.push('missing/empty <title>');

  // 2. description
  const descM = head.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!descM || !descM[1].trim()) errs.push('missing/empty meta description');

  // 3. robots
  const robotsM = head.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  if (!robotsM || !robotsM[1].trim()) errs.push('missing meta robots');

  // 4. canonical: present, www origin, locale prefix consistent with the page locale
  const canonM = head.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  if (!canonM) errs.push('missing canonical');
  else {
    const c = canonM[1];
    if (!c.startsWith(ORIGIN + '/') && c !== ORIGIN + '/') errs.push(`canonical not under ${ORIGIN}: ${c}`);
    else if (loc === 'de' && !c.startsWith(`${ORIGIN}/de/`)) errs.push(`de page canonical missing /de/ prefix: ${c}`);
    else if (loc === 'ja' && !c.startsWith(`${ORIGIN}/ja/`)) errs.push(`ja page canonical missing /ja/ prefix: ${c}`);
    else if (loc === 'en' && (c.startsWith(`${ORIGIN}/de/`) || c.startsWith(`${ORIGIN}/ja/`))) errs.push(`en page canonical has a locale prefix: ${c}`);
  }

  // 5. hreflang en/de/ja + x-default, one each, absolute www
  const alts = [...head.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]*)"/gi)];
  const seen = {};
  for (const a of alts) { seen[a[1]] = (seen[a[1]] || 0) + 1; if (!a[2].startsWith(ORIGIN + '/') && a[2] !== ORIGIN + '/') errs.push(`hreflang ${a[1]} href not under origin: ${a[2]}`); }
  for (const l of [...LOCALES, 'x-default']) {
    if (!seen[l]) errs.push(`missing hreflang "${l}"`);
    else if (seen[l] > 1) errs.push(`duplicate hreflang "${l}" (${seen[l]})`);
  }

  // 6. OG + Twitter essentials
  for (const [prop, label] of [['og:type', 'og:type'], ['og:url', 'og:url'], ['og:title', 'og:title'], ['og:description', 'og:description']]) {
    if (!new RegExp(`<meta\\s+property="${prop}"\\s+content="[^"]*"`, 'i').test(head)) errs.push(`missing ${label}`);
  }
  const ogImgM = head.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
  if (!ogImgM || !ogImgM[1].trim()) errs.push('missing og:image');
  else if (!/^https?:\/\//i.test(ogImgM[1])) errs.push(`og:image not absolute: ${ogImgM[1]}`);
  if (!/<meta\s+name="twitter:card"\s+content="[^"]*"/i.test(head)) errs.push('missing twitter:card');

  // 7. JSON-LD: >=1, each valid JSON with @context + @type
  const ld = [...head.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if (ld.length === 0) errs.push('no application/ld+json block');
  else {
    for (const [i, m] of ld.entries()) {
      try {
        const obj = JSON.parse(m[1]);
        if (!obj['@context'] || !obj['@type']) errs.push(`JSON-LD #${i + 1} missing @context/@type`);
      } catch {
        errs.push(`JSON-LD #${i + 1} is not valid JSON`);
      }
    }
  }

  return { skipped: false, rel, errs };
}

console.log('\nSEO head gate\n');
if (!existsSync(distDir)) { console.error(`dist not found: ${distDir}\nRun \`npm run build\` first.`); process.exit(2); }

const files = walk(distDir);
let scanned = 0, skipped = 0;
for (const f of files) {
  const r = checkPage(f);
  if (r.skipped) { skipped++; continue; }
  scanned++;
  if (r.errs.length) { failPages++; bad(`${r.rel}`); for (const e of r.errs) console.log(`      - ${e}`); }
}

console.log(`\n  scanned ${scanned} page(s) · skipped ${skipped} redirect stub(s)`);
if (!FAIL && scanned > 0) ok(`all ${scanned} pages have complete SEO head (title, description, robots, canonical, hreflang ${LOCALES.join('/')}+x-default, og/twitter, valid JSON-LD)`);
else if (scanned === 0) bad('no content pages scanned');
console.log(FAIL ? `\nRESULT: FAIL ✗ (${failPages} page(s) with SEO gaps)\n` : '\nRESULT: PASS ✓\n');
process.exit(FAIL ? 1 : 0);
