#!/usr/bin/env node
/**
 * verify-a11y-lite.mjs — lightweight, dependency-free accessibility scan of the built dist HTML.
 *
 * NOT a replacement for axe/Lighthouse — it catches a small set of high-confidence, static issues.
 * A few unambiguous checks are HARD gates (fail the build); heuristic ones are REPORT-only.
 *
 * USAGE (from astro/, after `npm run build`):
 *   npm run verify:a11y-lite
 *   node scripts/verify-a11y-lite.mjs --dist dist
 *
 * HARD (fail): <img> missing alt; empty href=""; <html> missing lang.
 * REPORT (informational): icon-only <a>/<button> with no accessible name; duplicate id on a page;
 *   >1 <h1> on a page; .nav-trigger disclosure missing aria-expanded (known — see docs/ACCESSIBILITY.md).
 * EXIT 0 = pass/report, 1 = a HARD check failed, 2 = IO error.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative, sep } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASTRO = resolve(__dir, '..');
const args = process.argv.slice(2);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const distDir = resolve(process.cwd(), val('--dist', join(ASTRO, 'dist')));

let FAIL = false;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.log(`  ✗ ${m}`); FAIL = true; };

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e); const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}
const rel = (f) => relative(distDir, f).split(sep).join('/');

console.log('\nAccessibility (a11y-lite) gate\n');
if (!existsSync(distDir)) { console.error(`dist not found: ${distDir}\nRun \`npm run build\` first.`); process.exit(2); }

const files = walk(distDir);
let imgNoAlt = 0, emptyHref = 0, noLang = 0;
let iconNoName = 0, dupId = 0, multiH1 = 0, navNoExpanded = 0;
const samples = { imgNoAlt: [], emptyHref: [], iconNoName: [], dupId: [], multiH1: [] };
const push = (k, v) => { if (samples[k].length < 8) samples[k].push(v); };

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const r = rel(f);

  // HARD: <html lang>
  const htmlTag = html.match(/<html\b[^>]*>/i);
  if (htmlTag && !/\blang\s*=/.test(htmlTag[0])) { noLang++; bad(`${r}: <html> missing lang`); }

  // HARD: <img> missing alt
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/.test(m[0])) { imgNoAlt++; push('imgNoAlt', `${r}: ${m[0].slice(0, 90)}`); }
  }
  // HARD: empty href
  for (const m of html.matchAll(/<a\b[^>]*\bhref\s*=\s*("")[^>]*>/gi)) { emptyHref++; push('emptyHref', `${r}: ${m[0].slice(0, 90)}`); }

  // REPORT: icon-only <a>/<button> with no accessible name
  for (const m of html.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const attrs = m[2]; const inner = m[3];
    const hasName = /\baria-label\s*=\s*"[^"]+"/i.test(attrs) || /\baria-labelledby\s*=/.test(attrs) || /\btitle\s*=\s*"[^"]+"/i.test(attrs);
    const text = inner.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, '').trim();
    const hasIcon = /<i\b|<svg\b/i.test(inner);
    if (!hasName && !text && hasIcon) { iconNoName++; push('iconNoName', `${r}: <${m[1]} ${attrs.trim().slice(0, 60)}>`); }
  }

  // REPORT: duplicate id
  const ids = [...html.matchAll(/\sid\s*=\s*"([^"]+)"/gi)].map((m) => m[1]);
  const seen = new Set(), dups = new Set();
  for (const id of ids) { if (seen.has(id)) dups.add(id); else seen.add(id); }
  if (dups.size) { dupId += dups.size; push('dupId', `${r}: ${[...dups].slice(0, 5).join(', ')}`); }

  // REPORT: multiple <h1>
  const h1 = (html.match(/<h1\b/gi) || []).length;
  if (h1 > 1) { multiH1++; push('multiH1', `${r}: ${h1} <h1>`); }

  // REPORT: nav-trigger disclosure missing aria-expanded
  for (const m of html.matchAll(/<a\b[^>]*class\s*=\s*"[^"]*\bnav-trigger\b[^"]*"[^>]*>/gi)) {
    if (!/\baria-expanded\s*=/.test(m[0])) navNoExpanded++;
  }
}

// HARD results
if (!imgNoAlt) ok('every <img> has an alt attribute');
else bad(`${imgNoAlt} <img> missing alt`);
if (!emptyHref) ok('no empty href=""');
else bad(`${emptyHref} empty href=""`);
if (!noLang) ok('every page <html> has lang');

for (const s of samples.imgNoAlt) console.log(`      ${s}`);
for (const s of samples.emptyHref) console.log(`      ${s}`);

// REPORT results
console.log(`\n  [report] icon-only <a>/<button> with no accessible name: ${iconNoName}`);
for (const s of samples.iconNoName) console.log(`      ${s}`);
console.log(`  [report] pages with duplicate id(s): ${dupId}`);
for (const s of samples.dupId) console.log(`      ${s}`);
console.log(`  [report] pages with >1 <h1>: ${multiH1}`);
for (const s of samples.multiH1) console.log(`      ${s}`);
console.log(`  [report] .nav-trigger without aria-expanded: ${navNoExpanded}  (known — disclosure state is JS-driven; see docs/ACCESSIBILITY.md)`);

console.log(`\n  scanned ${files.length} page(s)`);
console.log(FAIL ? '\nRESULT: FAIL ✗ (a hard a11y check failed)\n' : '\nRESULT: PASS ✓ (hard checks; review [report] items)\n');
process.exit(FAIL ? 1 : 0);
