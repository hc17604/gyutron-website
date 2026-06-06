import type { APIRoute } from 'astro';
import { locales, localizeUrl, htmlLang } from '../i18n';
import { SITE_URL } from '../config/site';
import { ROUTES } from '../config/routes';
import { getCatalog } from '../data/products';

// Static, indexable brand pages, reused from config/routes (shop.gyutron.com is out of
// scope and is never enumerated here). Placeholder footer links (/about, /certifications,
// /downloads, /solutions/*) are intentionally omitted — no page exists yet.
const STATIC_PATHS: string[] = [
  ROUTES.home,
  ROUTES.solution,
  ROUTES.contact,
  ROUTES.support,
  ROUTES.faq,
  ROUTES.warranty,
  ROUTES.shipping,
  ROUTES.privacy,
  ROUTES.terms,
];

// Product category pages that actually render products — redirect / empty categories
// (smart-cameras, industrial-sensors, inspection-instruments) are skipped.
function categoryPaths(): string[] {
  const catalog = getCatalog('en');
  return Object.keys(catalog)
    .filter((slug) => {
      const c = catalog[slug];
      return !!c && !c.redirectTo && Array.isArray(c.products) && c.products.length > 0;
    })
    .map((slug) => `/${slug}.html`);
}

/**
 * Build-time sitemap (Astro static endpoint → /sitemap.xml). Uses the canonical www origin
 * (config/site SITE_URL, matching every page's canonical), and lists each page in all three
 * locales with reciprocal hreflang + x-default alternates. No @astrojs/sitemap dependency;
 * page lists are derived from config/routes + the product catalog, not hand-maintained.
 */
export const GET: APIRoute = () => {
  const paths = [...STATIC_PATHS, ...categoryPaths()];
  const body = paths
    .flatMap((path) =>
      locales.map((loc) => {
        const alternates = [
          ...locales.map(
            (l) =>
              `    <xhtml:link rel="alternate" hreflang="${htmlLang[l]}" href="${SITE_URL}${localizeUrl(l, path)}"/>`,
          ),
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${path}"/>`,
        ].join('\n');
        return `  <url>\n    <loc>${SITE_URL}${localizeUrl(loc, path)}</loc>\n${alternates}\n  </url>`;
      }),
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
