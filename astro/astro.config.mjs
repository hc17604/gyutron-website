import { defineConfig } from 'astro/config';

// GYUTRON main site (www.gyutron.com). Static SSG, built-in i18n.
// URLs preserve the current scheme: en at /, de at /de/, ja at /ja/, *.html files.
export default defineConfig({
  site: 'https://www.gyutron.com',
  output: 'static',
  build: {
    format: 'file', // emit page.html (not page/index.html) to match existing URLs
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'ja'],
    routing: {
      prefixDefaultLocale: false, // en has no /en prefix
    },
  },
  trailingSlash: 'ignore',
});
