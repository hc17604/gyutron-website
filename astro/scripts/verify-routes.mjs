#!/usr/bin/env node
/**
 * verify-routes.mjs — route/page-existence + nav-link gate for gyutron.com.
 *
 * Confirms the canonical pages in config/routes.ts are actually emitted for every locale, and
 * that the internal links rendered in the Header + Footer resolve to a real built page (so a
 * data/nav edit can't ship a dead in-site link). Known placeholder links (footer entries whose
 * pages don't exist yet) are listed but not treated as failures.
 *
 * USAGE (from astro/, after `npm run build`):
 *   npm run verify:routes
 *   node scripts/verify-routes.mjs --dist dist
 *
 * EXIT 0 = PASS, 1 = FAIL, 2 = IO error.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASTRO = resolve(__dir, '..');
const args = process.argv.slice(2);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const LOCALES = ['en', 'de', 'ja'];
const distDir = resolve(process.cwd(), val('--dist', join(ASTRO, 'dist')));
const routesTs = join(ASTRO, 'src', 'config', 'routes.ts');

// Footer placeholder links whose target pages intentionally do not exist yet (see
// sitemap.xml.ts note). Listed, never failed on. Keep in sync if real pages land.
const KNOWN_PLACEHOLDERS = new Set([
  '/about', '/certifications', '/downloads',
  '/solutions/electronics-manufacturing', '/solutions/robotics-automation',
]);

let FAIL = false;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.log(`  ✗ ${m}`); FAIL = true; };
const note = (m) => console.log(`    ${m}`);

console.log('\nRoutes / nav-link gate\n');
if (!existsSync(distDir)) { console.error(`dist not found: ${distDir}\nRun \`npm run build\` first.`); process.exit(2); }

// canonical path → built file (en at root; de/ja prefixed)
const fileFor = (loc, path) => {
  const rel = path === '/' ? 'index.html' : path.replace(/^\//, '');
  return loc === 'en' ? join(distDir, rel) : join(distDir, loc, rel);
};

// 1. core ROUTES pages exist for every locale
const routesSrc = existsSync(routesTs) ? readFileSync(routesTs, 'utf8') : '';
const routeVals = [...routesSrc.matchAll(/^\s*\w+:\s*'([^']+)'/gm)].map((m) => m[1]);
if (!routeVals.length) bad('could not read ROUTES from config/routes.ts');
let missingCore = 0;
for (const path of routeVals) {
  for (const loc of LOCALES) {
    if (!existsSync(fileFor(loc, path))) { bad(`core page missing: ${loc} ${path}`); missingCore++; }
  }
}
if (!missingCore && routeVals.length) ok(`all ${routeVals.length} core routes present in en/de/ja (${routeVals.length * LOCALES.length} files)`);

// 2. Header + Footer internal links (from the en home page) resolve to a built page
const home = join(distDir, 'index.html');
if (!existsSync(home)) { bad('dist/index.html missing — cannot check nav links'); }
else {
  const html = readFileSync(home, 'utf8');
  const slice = (open, close) => { const a = html.indexOf(open); const b = a >= 0 ? html.indexOf(close, a) : -1; return a >= 0 && b >= 0 ? html.slice(a, b + close.length) : ''; };
  const region = slice('<div class="top-strip">', '</header>') + '\n' + slice('<footer', '</footer>');
  const hrefs = [...region.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const internal = [...new Set(hrefs)]
    .filter((h) => !/^(https?:|mailto:|tel:|#)/.test(h)) // drop external + pure-anchor
    .map((h) => h.split('#')[0]) // strip fragment
    .filter(Boolean);

  let dead = 0, placeholders = 0, resolved = 0;
  for (const path of [...new Set(internal)]) {
    if (existsSync(fileFor('en', path))) { resolved++; continue; }
    if (KNOWN_PLACEHOLDERS.has(path)) { placeholders++; continue; }
    bad(`dead nav link (no built page): ${path}`); dead++;
  }
  if (!dead) ok(`all ${resolved} resolvable Header/Footer links point to a built page`);
  if (placeholders) note(`(${placeholders} known placeholder link(s) skipped: ${[...KNOWN_PLACEHOLDERS].join(', ')})`);
}

console.log(FAIL ? '\nRESULT: FAIL ✗\n' : '\nRESULT: PASS ✓\n');
process.exit(FAIL ? 1 : 0);
