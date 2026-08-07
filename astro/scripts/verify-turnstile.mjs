import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const siteKey = '0x4AAAAAADh5yZZyBs-zTw3Y';
const scriptUrl = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const basePages = [
  'contact-sales.html',
  'request-quote.html',
  'support/contact.html',
  'resources/download-request.html',
];
const pages = ['', 'de/', 'ja/'].flatMap((prefix) => basePages.map((page) => `${prefix}${page}`));
const failures = [];

if (!existsSync(dist)) {
  console.error('Turnstile gate: dist/ missing; run npm run build first.');
  process.exit(1);
}

for (const page of pages) {
  const path = join(dist, ...page.split('/'));
  if (!existsSync(path)) {
    failures.push(`${page}: built page missing`);
    continue;
  }
  const html = readFileSync(path, 'utf8');
  if (!html.includes('class="cf-turnstile"')) failures.push(`${page}: widget missing`);
  if (!html.includes(`data-sitekey="${siteKey}"`)) failures.push(`${page}: production site key missing`);
  if (!html.includes(scriptUrl)) failures.push(`${page}: Turnstile script missing`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  console.error(`Turnstile gate: FAIL (${failures.length} issue(s))`);
  process.exit(1);
}

console.log(`Turnstile gate: PASS (${pages.length} en/de/ja form pages include widget, site key, and script)`);
