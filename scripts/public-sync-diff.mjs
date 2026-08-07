import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const builtRoot = join(root, 'astro', 'dist');
const deployedRoot = join(root, 'public');
const shopPath = /^(?:shop|de\/shop|ja\/shop)(?:\/|$)/;
const checkMode = process.argv.includes('--check');

function walk(base, current = base, out = new Map()) {
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    const absolute = join(current, entry.name);
    if (entry.isDirectory()) walk(base, absolute, out);
    if (entry.isFile()) {
      const path = relative(base, absolute).split(sep).join('/');
      if (!shopPath.test(path)) out.set(path, absolute);
    }
  }
  return out;
}

function digest(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

if (!existsSync(builtRoot)) {
  console.error('astro/dist is missing. Run `cd astro && npm run build` first.');
  process.exitCode = 1;
} else if (!existsSync(deployedRoot)) {
  console.error('root public/ is missing. Refusing to compare an unknown deploy target.');
  process.exitCode = 1;
} else {
  const built = walk(builtRoot);
  const deployed = walk(deployedRoot);
  const buildOnly = [];
  const deployedOnly = [];
  const changed = [];

  for (const [path, absolute] of built) {
    if (!deployed.has(path)) buildOnly.push(path);
    else if (digest(absolute) !== digest(deployed.get(path))) changed.push(path);
  }
  for (const path of deployed.keys()) {
    if (!built.has(path)) deployedOnly.push(path);
  }

  const print = (label, paths, details = true) => {
    console.log(`\n${label} (${paths.length})`);
    if (!paths.length) console.log('  none');
    else if (!details) console.log('  details suppressed in check mode');
    else paths.sort().forEach((path) => console.log(`  ${path}`));
  };

  console.log('Read-only Astro build ↔ committed public comparison');
  console.log('Excluded: shop/, de/shop/, ja/shop/');
  print('Changed bytes (candidate selective sync)', changed);
  print('Build-only files (candidate additions)', buildOnly);
  print('Public-only files (review; do not delete automatically)', deployedOnly, !checkMode);
  console.log('\nThis command never copies or deletes files. Review task scope before syncing.');
  if (checkMode && (changed.length || buildOnly.length)) {
    console.error('\nDeploy sync gate: FAIL — built brand output is newer than committed public/.');
    process.exitCode = 1;
  } else if (checkMode) {
    console.log('\nDeploy sync gate: PASS — every built brand file is byte-synced to public/.');
  }
}
