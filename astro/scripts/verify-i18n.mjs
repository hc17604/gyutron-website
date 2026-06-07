#!/usr/bin/env node
/**
 * verify-i18n.mjs — residual-English scanner for the de/ja built pages.
 *
 * HEURISTIC aid (not an absolute oracle): scans the visible text of every built de/ja page for
 * a conservative set of English function words that essentially never occur in correct German or
 * Japanese prose (the, and, with, your, for, from, this, that, …). ALL-CAPS tokens are ignored so
 * technical acronyms / logic terms (AND, OR, RFID, LED) and model names (GY-*) don't false-positive.
 * It reports suspects for a human to judge — it does not translate or edit.
 *
 * USAGE (from astro/, after `npm run build`):
 *   npm run verify:i18n           # report mode: lists suspects, always exit 0
 *   npm run verify:i18n -- --strict   # exit 1 if any suspect (use once tuned/clean)
 *   node scripts/verify-i18n.mjs --dist dist --locales de,ja
 *
 * EXIT 0 = clean / report, 1 = suspects found (only with --strict), 2 = IO error.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative, sep } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASTRO = resolve(__dir, '..');
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };

const STRICT = has('--strict');
const distDir = resolve(process.cwd(), val('--dist', join(ASTRO, 'dist')));
const LOCALES = val('--locales', 'de,ja').split(',').map((s) => s.trim()).filter(Boolean);

// Conservative: English-only words that are NOT German words, loanwords, acronyms, units or model
// names. Deliberately excludes ambiguous loanwords (Support, Features, Online, …) and short tokens
// that exist in German (in, will, war, also, …). Matched case-insensitively but ALL-CAPS hits are
// dropped (so "AND"/"OR" logic terms and acronyms are ignored).
const MARKERS = [
  'the', 'and', 'with', 'your', 'our', 'for', 'from', 'this', 'that', 'these', 'those',
  'are', 'have', 'please', 'learn', 'request', 'discover', 'what', 'how', 'why', 'about', 'more',
];
const RE = new RegExp(`\\b(${MARKERS.join('|')})\\b`, 'gi');

// Known-acceptable English in de/ja visible text — proper nouns that legitimately stay English.
// A suspect whose surrounding context contains one of these is NOT flagged.
const CONTEXT_ALLOWLIST = [
  'Shenzhen Bay Technology and Ecology Park', // official English name of the HQ address (proper noun)
];

function visibleText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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

let FAIL = false;
console.log(`\nResidual-English scan (de/ja) — mode: ${STRICT ? 'STRICT' : 'report'}\n`);
if (!existsSync(distDir)) { console.error(`dist not found: ${distDir}\nRun \`npm run build\` first.`); process.exit(2); }

let totalSuspects = 0, pagesScanned = 0, pagesFlagged = 0;
for (const loc of LOCALES) {
  const locDir = join(distDir, loc);
  if (!existsSync(locDir)) { console.log(`  (no ${loc}/ dir)`); continue; }
  for (const file of walk(locDir)) {
    const text = visibleText(readFileSync(file, 'utf8'));
    if (!text) continue;
    pagesScanned++;
    const hits = [...text.matchAll(RE)]
      .filter((m) => m[0] !== m[0].toUpperCase()) // drop ALL-CAPS acronym/logic tokens
      .map((m) => ({ word: m[0], at: m.index, ctx: text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40) }))
      .filter((h) => !CONTEXT_ALLOWLIST.some((p) => h.ctx.includes(p))); // drop allowlisted proper nouns
    if (!hits.length) continue;
    pagesFlagged++;
    totalSuspects += hits.length;
    const rel = relative(distDir, file).split(sep).join('/');
    const sample = hits.slice(0, 6).map((h) => `"${h.word}" …${text.slice(Math.max(0, h.at - 25), h.at + h.word.length + 25).trim()}…`);
    console.log(`  ⚠ ${rel} — ${hits.length} suspect(s)`);
    for (const s of sample) console.log(`      ${s}`);
  }
}

console.log(`\n  scanned ${pagesScanned} de/ja pages · ${pagesFlagged} flagged · ${totalSuspects} suspect token(s)`);
if (totalSuspects === 0) { console.log('\nRESULT: PASS ✓ (no residual-English markers)\n'); process.exit(0); }
if (STRICT) { FAIL = true; console.log('\nRESULT: FAIL ✗ (residual English — review/translate or refine MARKERS)\n'); }
else console.log('\nRESULT: REPORT (suspects above are heuristic — judge each; brand/model/technical terms are excluded by design)\n');
process.exit(FAIL ? 1 : 0);
