#!/usr/bin/env node
/**
 * verify-header-equivalence.mjs — header regression gate for gyutron.com.
 *
 * The header nav is data-driven (src/data/header-navigation.ts → components/navigation/*),
 * but its RENDERED DOM is a hard contract with: the desktop CSS (nav-chrome.css + per-page
 * chrome), the Header.astro/Home.astro inline scripts, and public/mobile-navigation.js — which
 * CLONES the rendered desktop DOM by CSS selector. This script proves a header change did not
 * drop links / classes / submenus or break that structure.
 *
 * USAGE (run from astro/, after `npm run build`):
 *   npm run verify:header                 # strict: built header must be EQUIVALENT to deployed public/
 *   npm run verify:header -- --report     # allow intentional content changes; only the structural
 *                                         # contract is a hard gate, content deltas are shown as INFO
 *   node scripts/verify-header-equivalence.mjs --candidate dist --reference ../public
 *   node scripts/verify-header-equivalence.mjs --locales en,de,ja
 *   node scripts/verify-header-equivalence.mjs --ref-file a.html --cand-file b.html   # compare 2 files
 *
 * EXIT 0 = PASS, 1 = FAIL, 2 = usage/IO error.
 *
 * What it checks (per locale en/de/ja, region = `<div class="top-strip"> … </header>`):
 *   - EQUIVALENCE (strict mode, the SAFE default): the whitespace-normalized header is byte-identical
 *     to the reference. Normalization collapses formatting whitespace but PRESERVES a significant space
 *     between text and an element (e.g. "English <span>EN</span>"), so it catches ANY in-region change —
 *     lost/added/reordered link, changed class, changed image, changed/retext, even an inter-token space.
 *     The region covers every desktop/mobile dependency, so identical canon ⇒ no regression. When it
 *     differs, the href/class/style-url set diffs + count deltas are printed to explain exactly what.
 *   - STRUCTURAL CONTRACT (reference-independent, always a hard gate, even in --report):
 *       · mobile/desktop hook classes present (.nav .nav-item .nav-trigger .mega-menu .mega-links
 *         .button-primary .language-switch-mobile|.language-icon-mobile .nav-search data-locale …),
 *         matched token-aware so a suffix-renamed hook is caught.
 *       · count invariants: nav-item == mega-menu, mega-links == mega-menu,
 *         mega-link-group == mega-link == submenu, submenu--intro <= submenu, mega-compact <= mega-menu
 *       · the three locales render an IDENTICAL structure (counts match across en/de/ja)
 *     NOTE: the structural gate is count/hook-level — it does NOT verify per-group nesting, so a
 *     *balanced* content change (whole group removed, or a submenu moved between groups) is NOT a
 *     structural failure in --report (it surfaces only as the loss/INFO warning). For a markup/component
 *     change, rely on STRICT, which catches it via the equivalence diff.
 *
 * Adding a real nav item legitimately changes content → run with --report, confirm the printed
 * deltas are what you intended, then sync dist → public and deploy. See docs/TROUBLESHOOTING.md
 * "Verify a header / nav refactor".
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url)); // astro/scripts
const ASTRO = resolve(__dir, '..'); // astro/
const REPO = resolve(ASTRO, '..'); // repo root

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };

const REPORT = has('--report');
const STRICT = !REPORT;
const LOCALES = val('--locales', 'en,de,ja').split(',').map((s) => s.trim()).filter(Boolean);
const candDir = resolve(process.cwd(), val('--candidate', join(ASTRO, 'dist')));
const refDir = resolve(process.cwd(), val('--reference', join(REPO, 'public')));
const refFile = val('--ref-file', null);
const candFile = val('--cand-file', null);

// ---- locale → home page path ----
const localePath = (loc) => (loc === 'en' ? 'index.html' : `${loc}/index.html`);

// ---- region extraction + whitespace normalization ----
const START = '<div class="top-strip">';
const END = '</header>';
function regionOf(html) {
  // Strip HTML comments first so a stray/commented-out `</header>` inside the header can't truncate
  // the extracted region (first-match opener → first-match close after it).
  const clean = html.replace(/<!--[\s\S]*?-->/g, '');
  const a = clean.indexOf(START);
  if (a < 0) return null;
  const b = clean.indexOf(END, a);
  if (b < 0) return null;
  return clean.slice(a, b + END.length);
}
function canon(s) {
  // Collapse whitespace runs to ONE space, then drop whitespace strictly BETWEEN tags (pure
  // formatting/indentation). A SIGNIFICANT single space between text and an element — e.g.
  // "English <span>EN</span>" — sits between a letter and `<`, not between `>` and `<`, so it is
  // PRESERVED: collapse-not-strip keeps STRICT sensitive to that inter-token spacing change.
  return s.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

// ---- multiset helpers ----
function tally(arr) { const m = new Map(); for (const x of arr) m.set(x, (m.get(x) || 0) + 1); return m; }
function diffMultiset(refArr, candArr) {
  const r = tally(refArr), c = tally(candArr);
  const removed = [], added = [];
  for (const [k, n] of r) { const d = n - (c.get(k) || 0); if (d > 0) removed.push(`${k}${d > 1 ? ` ×${d}` : ''}`); }
  for (const [k, n] of c) { const d = n - (r.get(k) || 0); if (d > 0) added.push(`${k}${d > 1 ? ` ×${d}` : ''}`); }
  return { removed, added, equal: removed.length === 0 && added.length === 0 };
}

// ---- analyze one header region ----
function analyze(html, label) {
  const region = regionOf(html);
  if (region == null) return { label, fatal: `no header region (\`${START}\` … \`${END}\`) found in ${label}` };
  const list = (re) => [...region.matchAll(re)].map((m) => m[1]);
  const cnt = (re) => (region.match(re) || []).length;
  const hrefs = list(/href="([^"]*)"/g);
  const classes = list(/class="([^"]*)"/g);
  const styleUrls = list(/url\('([^']*)'\)/g);
  // Token-aware counts: a class renamed by suffix (e.g. submenu → submenuX) must NOT still be tallied,
  // so the count invariants stay meaningful in --report mode (where the diff isn't the gate).
  const counts = {
    navItem: cnt(/class="nav-item"/g),
    megaMenu: cnt(/class="mega-menu(?:"| mega-compact")/g),
    megaCompact: cnt(/\bmega-compact\b/g),
    megaFeature: cnt(/class="mega-feature /g),
    megaLinks: cnt(/class="mega-links"/g),
    sectionLabel: cnt(/class="mega-section-label"/g),
    linkGroup: cnt(/class="mega-link-group"/g),
    megaLink: cnt(/class="mega-link"/g),
    submenu: cnt(/class="submenu(?:"| submenu--intro"| submenu--solution")/g),
    submenuIntro: cnt(/\bsubmenu--intro\b/g),
  };
  // bare links = top-level .mega-links anchors with a chevron-right that are NOT .mega-link.
  // Only .mega-link and the bare links carry fa-chevron-right (triggers use chevron-down; submenu
  // links / feature have no icon), so this is exact.
  const chevronRight = cnt(/fa-chevron-right/g);
  counts.bareLink = chevronRight - counts.megaLink;
  return { label, region, canon: canon(region), hrefs, classes, styleUrls, counts };
}

// ---- structural contract (reference-independent) ----
// Token-aware (NOT substring) matching, so a class/attr renamed by suffix — e.g.
// `language-switch-mobile` → `language-switch-mobileZ` — trips the gate instead of slipping through.
const HOOKS = [
  [/class="nav"/, '.nav (desktop nav list + mobile clone source)'],
  [/class="nav-item"/, '.nav-item (mobile clone iterates these)'],
  [/class="nav-trigger"/, '.nav-trigger (per-item label/href)'],
  [/class="mega-menu(?:"| )/, '.mega-menu (panel root)'],
  [/class="mega-links"/, '.mega-links (mobile reads its children)'],
  [/class="brand"/, '.brand (mobile toggle anchor)'],
  [/\bbutton-primary[" ]/, '.button-primary (CTA → mobile quick link)'],
  [/class="nav-search"/, '.nav-search (mobile search locale/placeholder source)'],
  [/\bdata-locale=/, 'data-locale on .nav-search (mobile search locale)'],
  [/\bdata-noresults=/, 'data-noresults on .nav-search (mobile no-results text)'],
];
function structuralIssues(a) {
  const issues = [];
  const r = a.region;
  for (const [re, why] of HOOKS) if (!re.test(r)) issues.push(`missing mobile/desktop hook: ${why}`);
  if (!/\blanguage-switch-mobile[" ]/.test(r) && !/\blanguage-icon-mobile[" ]/.test(r))
    issues.push('missing mobile/desktop hook: .language-switch-mobile / .language-icon-mobile (mobile lang switch)');
  const c = a.counts;
  if (c.navItem < 1) issues.push('no .nav-item found');
  if (c.navItem !== c.megaMenu) issues.push(`each .nav-item needs one .mega-menu: nav-item=${c.navItem} mega-menu=${c.megaMenu}`);
  if (c.megaLinks !== c.megaMenu) issues.push(`each .mega-menu needs one .mega-links: mega-links=${c.megaLinks} mega-menu=${c.megaMenu}`);
  if (c.linkGroup !== c.megaLink) issues.push(`each .mega-link-group needs one .mega-link: link-group=${c.linkGroup} mega-link=${c.megaLink}`);
  if (c.linkGroup !== c.submenu) issues.push(`each .mega-link-group needs one .submenu: link-group=${c.linkGroup} submenu=${c.submenu}`);
  if (c.submenuIntro > c.submenu) issues.push(`submenu--intro (${c.submenuIntro}) > submenu (${c.submenu})`);
  if (c.megaCompact > c.megaMenu) issues.push(`mega-compact (${c.megaCompact}) > mega-menu (${c.megaMenu})`);
  if (c.bareLink < 0) issues.push(`fa-chevron-right count < .mega-link count (malformed mega-link markup)`);
  return issues;
}

// ---- output helpers ----
let FAIL = false;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.log(`  ✗ ${m}`); FAIL = true; };
const warn = (m) => console.log(`  ⚠ ${m}`);
const info = (m) => console.log(`    ${m}`);

function compare(refA, candA) {
  // structural gate on candidate (always hard)
  const sIssues = structuralIssues(candA);
  if (sIssues.length === 0) ok(`structural contract intact (nav-item=${candA.counts.navItem}, link-group==mega-link==submenu=${candA.counts.linkGroup}, intro=${candA.counts.submenuIntro}, bare=${candA.counts.bareLink})`);
  else sIssues.forEach((i) => bad(`structure: ${i}`));

  // equivalence
  if (candA.canon === refA.canon) {
    ok(`EQUIVALENT to reference (normalized header byte-identical; ${candA.hrefs.length} links, ${candA.styleUrls.length} panel images)`);
    return;
  }
  const hd = diffMultiset(refA.hrefs, candA.hrefs);
  const cd = diffMultiset(refA.classes, candA.classes);
  const ud = diffMultiset(refA.styleUrls, candA.styleUrls);
  const countDeltas = [];
  for (const k of Object.keys(candA.counts)) { const d = candA.counts[k] - (refA.counts[k] ?? 0); if (d) countDeltas.push(`${k} ${d > 0 ? '+' : ''}${d}`); }
  const lossy = hd.removed.length || cd.removed.length || ud.removed.length || countDeltas.some((s) => s.includes('-'));

  const report = (verb) => {
    verb(`header DIFFERS from reference (${candA.label} vs ${refA.label})`);
    if (hd.removed.length) info(`href removed:  ${hd.removed.join(', ')}`);
    if (hd.added.length) info(`href added:    ${hd.added.join(', ')}`);
    if (cd.removed.length) info(`class removed: ${cd.removed.join(', ')}`);
    if (cd.added.length) info(`class added:   ${cd.added.join(', ')}`);
    if (ud.removed.length) info(`image removed: ${ud.removed.join(', ')}`);
    if (ud.added.length) info(`image added:   ${ud.added.join(', ')}`);
    if (countDeltas.length) info(`count deltas:  ${countDeltas.join(', ')}`);
  };

  if (STRICT) {
    report(bad);
    info('→ strict mode: any change vs the deployed reference fails. If the change is INTENTIONAL,');
    info('  re-run with `--report` to confirm the deltas, then sync dist → public and deploy.');
  } else {
    report(lossy ? warn : info.bind(null, 'INFO:'));
    if (lossy) warn('content was REMOVED / counts decreased — confirm this loss is intentional.');
    info('→ report mode: content deltas are not failures; the structural contract above is the gate.');
  }
}

// ---- run ----
console.log(`\nHeader equivalence gate — mode: ${STRICT ? 'STRICT (must be equivalent)' : 'REPORT (structural gate only)'}\n`);

if (refFile || candFile) {
  if (!refFile || !candFile) { console.error('--ref-file and --cand-file must be given together'); process.exit(2); }
  for (const f of [refFile, candFile]) if (!existsSync(f)) { console.error(`not found: ${f}`); process.exit(2); }
  const refA = analyze(readFileSync(refFile, 'utf8'), refFile);
  const candA = analyze(readFileSync(candFile, 'utf8'), candFile);
  if (refA.fatal) { console.error(refA.fatal); process.exit(2); }
  if (candA.fatal) { bad(candA.fatal); }
  else { console.log(`[file pair]`); compare(refA, candA); }
} else {
  if (!existsSync(candDir)) { console.error(`candidate dir not found: ${candDir}\nRun \`npm run build\` first.`); process.exit(2); }
  if (!existsSync(refDir)) { console.error(`reference dir not found: ${refDir}`); process.exit(2); }
  const analyses = [];
  for (const loc of LOCALES) {
    const cf = join(candDir, localePath(loc));
    const rf = join(refDir, localePath(loc));
    console.log(`[${loc}]`);
    if (!existsSync(cf)) { bad(`candidate page missing: ${cf}`); continue; }
    if (!existsSync(rf)) { bad(`reference page missing: ${rf}`); continue; }
    const candA = analyze(readFileSync(cf, 'utf8'), `dist/${localePath(loc)}`);
    const refA = analyze(readFileSync(rf, 'utf8'), `public/${localePath(loc)}`);
    if (candA.fatal) { bad(candA.fatal); continue; }
    if (refA.fatal) { bad(refA.fatal); continue; }
    compare(refA, candA);
    analyses.push({ loc, candA });
    console.log('');
  }
  // cross-locale structural consistency (header is locale-invariant in structure)
  if (analyses.length > 1) {
    console.log('[cross-locale structure]');
    const base = analyses[0];
    const keys = Object.keys(base.candA.counts);
    let consistent = true;
    for (const { loc, candA } of analyses.slice(1)) {
      const mismatched = keys.filter((k) => candA.counts[k] !== base.candA.counts[k]);
      if (mismatched.length) { consistent = false; bad(`${loc} structure differs from ${base.loc}: ${mismatched.map((k) => `${k} ${candA.counts[k]}!=${base.candA.counts[k]}`).join(', ')}`); }
    }
    if (consistent) ok(`en/de/ja render identical structure (${keys.map((k) => `${k}=${base.candA.counts[k]}`).join(', ')})`);
    console.log('');
  }
}

console.log(FAIL ? '\nRESULT: FAIL ✗\n' : '\nRESULT: PASS ✓\n');
process.exit(FAIL ? 1 : 0);
