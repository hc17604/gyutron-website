console.error([
  'BLOCKED: the legacy root i18n generator is not valid for the Astro main site.',
  'It can overwrite the committed production site in public/.',
  'Edit astro/src/i18n and Astro data files, then run:',
  '  cd astro',
  '  npm run build',
  '  npm run verify:all',
  'For Shop work, read shop/HANDOFF.md and use the Shop-specific workflow.',
].join('\n'));

process.exitCode = 1;
