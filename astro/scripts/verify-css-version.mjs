import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const publicRoot = join(root, 'public');
const failures = [];
let pages = 0;
let links = 0;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

function expectedHash(href) {
  const source = join(publicRoot, ...href.replace(/^\//, '').split('/'));
  if (!existsSync(source)) return null;
  const normalized = readFileSync(source, 'utf8').replace(/\r\n?/g, '\n');
  return createHash('sha1').update(normalized, 'utf8').digest('hex').slice(0, 8);
}

if (!existsSync(dist)) {
  console.error('CSS version gate: dist/ missing; run npm run build first.');
  process.exit(1);
}

for (const file of walk(dist)) {
  pages += 1;
  const page = relative(dist, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');
  const localCssLinks = [...html.matchAll(/href="(\/[^"?]+\.css)(?:\?v=([0-9a-f]{8}))?"/g)];
  for (const match of localCssLinks) {
    links += 1;
    const [, href, actual] = match;
    const expected = expectedHash(href);
    if (!expected) failures.push(`${page}: source CSS missing for ${href}`);
    else if (!actual) failures.push(`${page}: local CSS lacks ?v= hash for ${href}`);
    else if (actual !== expected) failures.push(`${page}: ${href}?v=${actual}, expected ${expected}`);
  }
}

if (failures.length) {
  failures.slice(0, 40).forEach((failure) => console.error(`FAIL: ${failure}`));
  if (failures.length > 40) console.error(`... ${failures.length - 40} more`);
  console.error(`CSS version gate: FAIL (${failures.length} issue(s))`);
  process.exit(1);
}

console.log(`CSS version gate: PASS (${links} local stylesheet links across ${pages} pages use normalized content hashes)`);
