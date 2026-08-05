#!/usr/bin/env node
/**
 * verify-scroll-chrome.mjs — regression gate for shared brand-page scroll controls.
 *
 * Every non-redirect HTML page must use Layout.astro and therefore receive the
 * directional fixed header, shared nav CSS, and localized back-to-top button.
 * Run from astro/ after `npm run build`.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const astroRoot = resolve(here, '..');
const args = process.argv.slice(2);
const value = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const dist = resolve(process.cwd(), value('--dist', join(astroRoot, 'dist')));

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const absolute = join(directory, entry);
    if (statSync(absolute).isDirectory()) files.push(...walk(absolute));
    else if (entry.endsWith('.html')) files.push(absolute);
  }
  return files;
}

const asRelative = (file) => relative(dist, file).split(sep).join('/');
const labelFor = (file) => file.startsWith('de/') ? 'Nach oben' : file.startsWith('ja/') ? 'ページ上部へ' : 'Back to top';
const failures = [];
const fail = (file, message) => failures.push(`${file}: ${message}`);

console.log('\nShared scroll chrome gate\n');
if (!existsSync(dist)) {
  console.error(`dist not found: ${dist}\nRun \`npm run build\` first.`);
  process.exit(2);
}

const htmlFiles = walk(dist);
let contentPages = 0;
let redirects = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const name = asRelative(file);
  if (/<meta\b[^>]*http-equiv=["']refresh["']/i.test(html)) {
    redirects += 1;
    continue;
  }

  contentPages += 1;
  if (!/<header\b[^>]*class=["'][^"']*\bsite-header\b/i.test(html)) fail(name, 'missing shared .site-header (page must use Layout.astro)');
  if (!/href=["']\/nav-chrome\.css\?v=[a-f0-9]+["']/i.test(html)) fail(name, 'missing versioned /nav-chrome.css');

  const buttons = [...html.matchAll(/<button\b[^>]*\bdata-back-to-top(?:\s|=)[^>]*>/gi)].map((match) => match[0]);
  if (buttons.length !== 1) {
    fail(name, `expected one back-to-top button, found ${buttons.length}`);
  } else {
    const button = buttons[0];
    const label = labelFor(name);
    if (!button.includes(`aria-label="${label}"`)) fail(name, `missing localized aria-label "${label}"`);
    if (!button.includes(`title="${label}"`)) fail(name, `missing localized title "${label}"`);
    if (!/aria-hidden=["']true["']/i.test(button) || !/tabindex=["']-1["']/i.test(button)) fail(name, 'initial hidden/focus state is missing');
  }

  if (!html.includes("classList.add('nav-hidden')") || !html.includes("classList.remove('nav-hidden')")) fail(name, 'missing directional header scroll controller');
  if (!/class=["']fa-solid fa-arrow-up["'][^>]*aria-hidden=["']true["']/i.test(html)) fail(name, 'missing decorative-hidden upward-arrow icon');
}

const sharedCssPath = join(dist, 'nav-chrome.css');
if (!existsSync(sharedCssPath)) {
  fail('nav-chrome.css', 'shared CSS output missing');
} else {
  const css = readFileSync(sharedCssPath, 'utf8');
  for (const selector of [
    'body.nav-hidden .top-strip',
    'body.nav-hidden .site-header',
    '.back-to-top.is-visible',
    'body.mobile-nav-open .back-to-top',
    '@media (prefers-reduced-motion: reduce)',
  ]) {
    if (!css.includes(selector)) fail('nav-chrome.css', `missing ${selector}`);
  }
  if (/will-change\s*:\s*transform/i.test(css)) {
    fail('nav-chrome.css', 'permanent will-change: transform breaks fixed desktop search geometry');
  }
}

if (failures.length) {
  for (const item of failures) console.error(`  ✗ ${item}`);
  console.error(`\nRESULT: FAIL ✗ (${failures.length} issue(s))\n`);
  process.exit(1);
}

console.log(`  ✓ ${contentPages} content pages inherit Layout scroll controls`);
console.log(`  ✓ ${redirects} intentional meta redirects excluded`);
console.log('  ✓ localized labels, initial focus state, shared CSS, and reduced-motion rules present');
console.log('\nRESULT: PASS ✓\n');
