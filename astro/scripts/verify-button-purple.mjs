/**
 * Hard gate for the user-approved two-color interactive purple system.
 * Decorative/non-interactive purple remains outside this gate by design.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const tokenCss = fs.readFileSync(path.join(publicDir, 'brand-tokens.css'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'src', 'layouts', 'Layout.astro'), 'utf8');

const failures = [];
const exactToken = (name, value) => new RegExp(`--${name}\\s*:\\s*${value}\\s*;`, 'i').test(tokenCss);
if (!exactToken('button-purple-deep', '#4b2e83')) failures.push('deep token must be #4b2e83');
if (!exactToken('button-purple-light', '#efe8ff')) failures.push('light token must be #efe8ff');
if (!layout.includes("withVersion('/brand-tokens.css')")) failures.push('Layout.astro must load brand-tokens.css');

const controlSelector = /(?:\.button\b|button\b|\.hsl-cta\b|\.hero-(?:tab|dot)\b|\.tc-tab\b|\.tc-panel__cta\b|\.hx-explore__(?:tab|chip)\b|\.solution-tabs\s+a\b|\.category-nav\s+a\b|\.mobile-(?:menu-toggle|menu-icon|nav-row|nav-link|nav-quick)\b|\.language-(?:menu\s+a|icon)\b|\.header-quick\b|\.nav-search-(?:toggle|close)\b|\.cw-(?:launcher|chip|q|foot-cta)\b|\.pagination\b)/i;
const legacyPurple = /var\(--(?:brand-purple|purple-[0-9]+|violet-soft|signal|hero-accent)\b|#(?:12051f|1f0b35|33135a|4b177f|6f2dbd|8a63d2|3f256f|f1eef7|faf7ff)\b/i;
const declaration = /(?:background(?:-color)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|color|outline)\s*:[^;]+;/gi;

for (const name of fs.readdirSync(publicDir).filter((file) => file.endsWith('.css') && file !== 'brand-tokens.css')) {
  const css = fs.readFileSync(path.join(publicDir, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    if (!controlSelector.test(selector)) continue;
    for (const item of match[2].matchAll(declaration)) {
      if (legacyPurple.test(item[0])) failures.push(`${name}: ${selector} uses ${item[0].trim()}`);
    }
  }
}

console.log('\nButton purple token gate\n');
if (failures.length) {
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  console.error(`\nRESULT: FAIL (${failures.length})\n`);
  process.exit(1);
}
console.log('  ✓ deep #4b2e83 and light #efe8ff are centrally defined');
console.log('  ✓ Layout loads the shared tokens on every brand page');
console.log('  ✓ interactive selectors do not use legacy purple shades');
console.log('\nRESULT: PASS ✓\n');
