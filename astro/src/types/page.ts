/**
 * Site page registry types. The registry (`src/data/pages.ts`) is the single, typed index of the
 * site's pages and their routing/SEO/sitemap metadata, so route/sitemap/SEO concerns stop being
 * maintained in separate hand-kept lists.
 *
 * Design note (deviation from the literal spec, intentional): `path` is the CANONICAL en path as a
 * single string (localized URLs come from `localizeUrl(locale, path)`), and titles/descriptions are
 * i18n KEYS — NOT `Record<Locale,string>`. Every URL on this site is just `localizeUrl(canonical)`
 * (no per-locale slugs), and the data-layer convention is to reference i18n keys rather than inline
 * translated strings; per-locale path/title maps would be pure redundancy + a divergence risk.
 */
export type PageType = 'home' | 'product' | 'solution' | 'industry' | 'support' | 'legal' | 'contact' | 'news' | 'redirect';

/** Where the page's existence is sourced from. */
export type PageSource = 'static' | 'product' | 'solution' | 'industry' | 'news' | 'redirect';

export interface SitePage {
  /** Stable id, e.g. "home", "faq", "automated-vision-inspection". */
  id: string;
  type: PageType;
  /** Canonical en path (no locale prefix), e.g. "/support/faq.html". */
  path: string;
  /** i18n key for the page <title> (optional; many titles live in the page component today). */
  titleKey?: string;
  /** i18n key for the meta description (optional). */
  descKey?: string;
  /** Whether the page belongs in sitemap.xml. */
  includeInSitemap: boolean;
  /** True → page emits robots "noindex" (e.g. redirect stubs). */
  noindex?: boolean;
  source: PageSource;
}
