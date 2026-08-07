import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const checkMode = process.argv.includes('--check');

const rel = (path) => join(root, ...path.split('/'));
const read = (path) => readFileSync(rel(path), 'utf8');

function git(args, { allowFailure = false } = {}) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0 && !allowFailure) {
    throw new Error((result.stderr || result.stdout || `git ${args.join(' ')} failed`).trim());
  }
  return result.status === 0 ? result.stdout.trim() : '';
}

function isAncestor(older, newer) {
  if (!older || !newer) return true;
  return spawnSync('git', ['merge-base', '--is-ancestor', older, newer], {
    cwd: root,
    encoding: 'utf8',
  }).status === 0;
}

function latestCommit(paths) {
  return git(['log', '-1', '--format=%H', '--', ...paths], { allowFailure: true });
}

function runChecks() {
  const failures = [];
  const warnings = [];
  const requiredFiles = [
    'README.md',
    'AGENTS.md',
    'CLAUDE.md',
    'HANDOFF.md',
    'docs/AGENT_TAKEOVER.md',
    'docs/MAINTENANCE.md',
    'docs/SAFETY_CHECKLIST.md',
    'docs/DEPLOYMENT.md',
    'shop/HANDOFF.md',
  ];

  for (const path of requiredFiles) {
    if (!existsSync(rel(path))) failures.push(`missing required handoff file: ${path}`);
  }

  if (failures.length === 0) {
    const agents = read('AGENTS.md');
    const readme = read('README.md');
    const claude = read('CLAUDE.md');
    const handoff = read('HANDOFF.md');
    const takeover = read('docs/AGENT_TAKEOVER.md');
    const deployment = read('docs/DEPLOYMENT.md');
    const wrangler = read('wrangler.toml');
    const rootPackage = JSON.parse(read('package.json'));
    const astroPackage = JSON.parse(read('astro/package.json'));
    const workflow = read('.github/workflows/verify.yml');

    const assertions = [
      [agents.includes('docs/AGENT_TAKEOVER.md'), 'AGENTS.md must link the takeover runbook'],
      [agents.includes('npm run agent:status'), 'AGENTS.md must expose the status command'],
      [agents.includes('npm run agent:check'), 'AGENTS.md must require the handoff gate'],
      [agents.includes('astro/dist/') && agents.includes('public/'), 'AGENTS.md must describe source and deployed output'],
      [agents.includes('public/shop'), 'AGENTS.md must protect Shop paths'],
      [readme.includes('docs/AGENT_TAKEOVER.md'), 'README.md must link the takeover runbook'],
      [claude.includes('docs/AGENT_TAKEOVER.md'), 'CLAUDE.md must use the shared takeover runbook'],
      [handoff.includes('Fast takeover snapshot'), 'HANDOFF.md must contain a fast takeover snapshot'],
      [takeover.includes('Required HANDOFF entry template'), 'takeover runbook must contain the finish template'],
      [deployment.includes('committed `public/`'), 'deployment guide must identify committed public output'],
      [rootPackage.scripts?.['agent:status'] === 'node scripts/agent-handoff.mjs', 'package.json agent:status script is missing or changed'],
      [rootPackage.scripts?.['agent:check'] === 'node scripts/agent-handoff.mjs --check', 'package.json agent:check script is missing or changed'],
      [rootPackage.scripts?.['deploy:diff'] === 'node scripts/public-sync-diff.mjs', 'package.json deploy:diff script is missing or changed'],
      [rootPackage.scripts?.['deploy:check'] === 'node scripts/public-sync-diff.mjs --check', 'package.json deploy:check script is missing or changed'],
      [rootPackage.scripts?.['i18n:build'] === 'node scripts/block-legacy-main-i18n.mjs', 'legacy i18n:build must fail safely'],
      [rootPackage.scripts?.['i18n:sync'] === 'node scripts/block-legacy-main-i18n.mjs', 'legacy i18n:sync must fail safely'],
      [astroPackage.scripts?.['verify:handoff'] === 'node ../scripts/agent-handoff.mjs --check', 'astro verify:handoff script is missing or changed'],
      [astroPackage.scripts?.['verify:all']?.includes('verify:handoff'), 'astro verify:all must include verify:handoff'],
      [astroPackage.scripts?.['verify:all']?.includes('verify:turnstile'), 'astro verify:all must include verify:turnstile'],
      [astroPackage.scripts?.['verify:all']?.includes('verify:css-version'), 'astro verify:all must include verify:css-version'],
      [workflow.includes('npm run verify:handoff'), 'GitHub CI must run verify:handoff'],
      [workflow.includes('npm run verify:button-purple'), 'GitHub CI must run verify:button-purple'],
      [workflow.includes('npm run verify:turnstile'), 'GitHub CI must run verify:turnstile'],
      [workflow.includes('npm run verify:css-version'), 'GitHub CI must run verify:css-version'],
      [workflow.includes('node scripts/smoke-platform.mjs'), 'GitHub CI must run the Worker platform smoke'],
      [workflow.includes('npm run shop:verify'), 'GitHub CI must run the Shop baseline'],
      [workflow.includes('wrangler deploy --dry-run'), 'GitHub CI must run Wrangler dry-run'],
      [workflow.includes('npm run deploy:check'), 'GitHub CI must verify committed deploy output'],
      [/^\[\[d1_databases\]\]/m.test(wrangler) && /^\[\[r2_buckets\]\]/m.test(wrangler) && /^\[\[kv_namespaces\]\]/m.test(wrangler), 'wrangler.toml active binding declarations are missing'],
    ];

    for (const [ok, message] of assertions) {
      if (!ok) failures.push(message);
    }

    const staleRules = [
      'dark product stage with colored bars',
      'German sample lives at',
      'Use `tools/update_navigation.py`',
      'codex.exe count is 0',
    ];
    for (const phrase of staleRules) {
      if (agents.includes(phrase)) failures.push(`stale active rule remains in AGENTS.md: ${phrase}`);
    }

    const mainCommit = latestCommit([
      'astro',
      'src',
      'migrations',
      'wrangler.toml',
      'package.json',
      'public',
      ':(exclude)public/shop',
      ':(exclude)public/de/shop',
      ':(exclude)public/ja/shop',
    ]);
    const mainHandoffCommit = latestCommit(['HANDOFF.md']);
    if (mainCommit && mainHandoffCommit && !isAncestor(mainCommit, mainHandoffCommit)) {
      failures.push(`HANDOFF.md is older than committed main-site/platform work (${mainCommit.slice(0, 7)})`);
    }

    const shopCommit = latestCommit([
      'shop',
      'templates/shop',
      'templates/_partials/shop-footer.html',
      'templates/_partials/shop-head-tail.html',
      'templates/_partials/shop-header.html',
      'de/shop',
      'ja/shop',
      'public/shop',
      'public/de/shop',
      'public/ja/shop',
      'public/shop-analytics.js',
      'locales/i18n/en.json',
      'locales/i18n/de.json',
      'locales/i18n/ja.json',
      'src/api/order-intents.mjs',
      'src/api/shop-events.mjs',
      'migrations/0002_order_intents.sql',
      'tools/build_shop.py',
      'scripts/smoke-shop.mjs',
    ]);
    const shopHandoffCommit = latestCommit(['shop/HANDOFF.md']);
    if (shopCommit && shopHandoffCommit && !isAncestor(shopCommit, shopHandoffCommit)) {
      failures.push(`shop/HANDOFF.md is older than committed Shop work (${shopCommit.slice(0, 7)})`);
    }

    const dirty = git(['status', '--porcelain']);
    if (dirty && !dirty.split(/\r?\n/).some((line) => line.slice(3) === 'HANDOFF.md')) {
      const implementationDirty = dirty
        .split(/\r?\n/)
        .map((line) => line.slice(3))
        .filter((path) => /^(astro\/|src\/|migrations\/|public\/|wrangler\.toml$|package\.json$)/.test(path));
      if (implementationDirty.length) {
        warnings.push('implementation files are dirty; update HANDOFF.md before the final commit');
      }
    }
  }

  if (warnings.length) warnings.forEach((warning) => console.warn(`WARN: ${warning}`));
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL: ${failure}`));
    console.error(`Agent handoff contract: FAIL (${failures.length})`);
    process.exitCode = 1;
    return;
  }
  console.log(`Agent handoff contract: PASS (${requiredFiles.length} required files, structural + freshness gates)`);
}

function printStatus() {
  const branch = git(['branch', '--show-current'], { allowFailure: true }) || '(detached)';
  const head = git(['rev-parse', '--short=12', 'HEAD']);
  const origin = git(['rev-parse', '--short=12', 'origin/main'], { allowFailure: true }) || '(not fetched)';
  const relation = origin === '(not fetched)'
    ? 'unknown; run git fetch origin'
    : git(['rev-list', '--left-right', '--count', 'HEAD...origin/main'])
        .split(/\s+/)
        .map(Number);
  const status = git(['status', '-sb']);
  const log = git(['log', '-5', '--oneline', '--decorate']);
  const handoff = read('HANDOFF.md');
  const updated = handoff.match(/Last updated\s+(\d{4}-\d{2}-\d{2})/i)?.[1] || 'not declared';
  const entries = [...handoff.matchAll(/^> \*\*(\d{4}-\d{2}-\d{2}[^*]*)\*\*([^\r\n]*)/gm)]
    .slice(0, 3)
    .map((match) => `${match[1]}${match[2]}`.trim());

  console.log('GYUTRON agent takeover status');
  console.log(`repo: ${root}`);
  console.log(`branch: ${branch}`);
  console.log(`HEAD: ${head}`);
  console.log(`origin/main (cached): ${origin}`);
  if (Array.isArray(relation)) {
    console.log(`relation: local ahead ${relation[0]}, behind ${relation[1]}`);
  } else {
    console.log(`relation: ${relation}`);
  }
  console.log(`HANDOFF last updated: ${updated}`);
  console.log('\nworktree:');
  console.log(status || '(clean)');
  console.log('\nlatest commits:');
  console.log(log);
  if (entries.length) {
    console.log('\nlatest handoff entries:');
    entries.forEach((entry) => console.log(`- ${entry}`));
  }
  console.log('\nnext: read HANDOFF.md, AGENTS.md, docs/AGENT_TAKEOVER.md, and docs/SAFETY_CHECKLIST.md');
  console.log('note: run git fetch origin before trusting the cached remote comparison');
}

try {
  if (checkMode) runChecks();
  else printStatus();
} catch (error) {
  console.error(`Agent handoff tool failed: ${error.message}`);
  process.exitCode = 1;
}
