/**
 * Site page registry — the single, typed index of the site's pages + their routing/SEO/sitemap
 * metadata. Composed from existing single-sources (ROUTES for static paths, SOLUTIONS for solution
 * pages) so paths are NOT duplicated; this layer adds page type / sitemap-inclusion / noindex /
 * source metadata on top.
 *
 * Product CATEGORY pages are intentionally NOT enumerated here — there are ~21 and they are dynamic
 * (derived from the product catalog). The sitemap keeps deriving those from `getCatalog`; this
 * registry covers the static + solution + redirect-stub pages.
 *
 * ADOPTION (incremental, low-risk): `sitemap.xml.ts` derives its static-path list from
 * `sitemapStaticPaths()` here (verified byte-identical). Other consumers (SEO, nav, route checks)
 * can adopt `SITE_PAGES` / `getPage()` over time. To register a new static/solution page, add it
 * here (and, for sitemap inclusion, set `includeInSitemap: true`). See docs/ROUTES.md.
 */
import type { SitePage } from '../types/page';
import { ROUTES } from '../config/routes';
import { SOLUTIONS } from './solutions';
import { INDUSTRIES } from './industries';
import { NEWS } from './news';

// Order is significant: it defines the static-page order in the sitemap (kept identical to the
// previous hand-maintained STATIC_PATHS: home, solution(s), contact, support, faq, warranty,
// shipping, privacy, terms), so sitemap output stays byte-for-byte the same.
export const SITE_PAGES: SitePage[] = [
  { id: 'home', type: 'home', path: ROUTES.home, titleKey: 'seo.index.title', descKey: 'seo.index.desc', includeInSitemap: true, source: 'static' },
  ...SOLUTIONS.map((s): SitePage => ({
    id: s.slug,
    type: 'solution',
    path: s.path,
    titleKey: s.titleKey,
    descKey: s.descKey,
    includeInSitemap: true,
    source: 'solution',
  })),
  // Industry pages: only those that have a built page (titleKey set + a real /<slug>.html path).
  ...INDUSTRIES.filter((i) => i.titleKey && i.path.endsWith('.html')).map((i): SitePage => ({
    id: i.slug,
    type: 'industry',
    path: i.path,
    titleKey: i.titleKey,
    descKey: i.descKey,
    includeInSitemap: true,
    source: 'industry',
  })),
  { id: 'contact', type: 'contact', path: ROUTES.contact, includeInSitemap: true, source: 'static' },
  // Phase-2 form pages (RFQ / support / download-request) — backed by the worker form APIs.
  { id: 'request-quote', type: 'contact', path: ROUTES.requestQuote, titleKey: 'seo.request-quote.title', descKey: 'seo.request-quote.desc', includeInSitemap: true, source: 'static' },
  { id: 'support-contact', type: 'support', path: ROUTES.supportContact, titleKey: 'seo.support-contact.title', descKey: 'seo.support-contact.desc', includeInSitemap: true, source: 'static' },
  { id: 'download-request', type: 'support', path: ROUTES.downloadRequest, titleKey: 'seo.download-request.title', descKey: 'seo.download-request.desc', includeInSitemap: true, source: 'static' },
  { id: 'support', type: 'support', path: ROUTES.support, includeInSitemap: true, source: 'static' },
  { id: 'faq', type: 'support', path: ROUTES.faq, includeInSitemap: true, source: 'static' },
  { id: 'warranty', type: 'support', path: ROUTES.warranty, includeInSitemap: true, source: 'static' },
  { id: 'shipping', type: 'support', path: ROUTES.shipping, includeInSitemap: true, source: 'static' },
  { id: 'privacy', type: 'legal', path: ROUTES.privacy, includeInSitemap: true, source: 'static' },
  { id: 'terms', type: 'legal', path: ROUTES.terms, includeInSitemap: true, source: 'static' },
  // Newsroom — index + one article page per post (data/news.ts).
  { id: 'news', type: 'news', path: '/news.html', titleKey: 'seo.news.title', descKey: 'seo.news.desc', includeInSitemap: true, source: 'news' },
  ...NEWS.map((n): SitePage => ({ id: 'news-' + n.slug, type: 'news', path: '/news/' + n.slug + '.html', includeInSitemap: true, source: 'news' })),
  // Redirect stubs: render a MetaRedirect, must NOT be indexed or in the sitemap.
  { id: 'smart-cameras', type: 'redirect', path: '/smart-cameras.html', includeInSitemap: false, noindex: true, source: 'redirect' },
  { id: 'industrial-sensors', type: 'redirect', path: '/industrial-sensors.html', includeInSitemap: false, noindex: true, source: 'redirect' },
  { id: 'inspection-instruments', type: 'redirect', path: '/inspection-instruments.html', includeInSitemap: false, noindex: true, source: 'redirect' },
];

/** A registered page by id, or undefined. */
export function getPage(id: string): SitePage | undefined {
  return SITE_PAGES.find((p) => p.id === id);
}

/** All registered pages. */
export function getSitePages(): SitePage[] {
  return SITE_PAGES;
}

/**
 * Canonical paths of the NON-product pages that belong in the sitemap, in registry order.
 * Product category pages are added separately by the sitemap (dynamic from the catalog).
 */
export function sitemapStaticPaths(): string[] {
  return SITE_PAGES.filter((p) => p.includeInSitemap && p.source !== 'product').map((p) => p.path);
}
