/**
 * SEO configuration — the single source for site-wide SEO defaults. Per-page title/
 * description still come from the `seo.*` i18n keys; these are the defaults and the values
 * that close the SEO gaps (Twitter Card, og:image, JSON-LD, robots). Consumed by
 * `components/seo/SeoHead.astro` (and `utils/seo.ts`).
 */
import { SITE_NAME, SITE_URL } from './site';
import { defaultLocale, locales } from '../i18n';

export { SITE_NAME, SITE_URL };

/** Locale config, re-exported for SEO consumers. */
export const DEFAULT_LOCALE = defaultLocale;
export const SUPPORTED_LOCALES = locales;

/** Fallback title for pages that don't supply their own. */
export const DEFAULT_TITLE = `${SITE_NAME} — Industrial Intelligent Hardware & Machine Vision`;

/**
 * Title template (`%s` = page title). NOTE: existing page titles already include the brand
 * (e.g. "FAQ | GYUTRON Support"), so SeoHead uses the title as-is and does NOT auto-apply
 * this template — it's here for future pages that pass a bare title.
 */
export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

export const DEFAULT_DESCRIPTION =
  'GYUTRON supplies industrial intelligent hardware and machine-vision solutions for ' +
  'automation, inspection, and data capture — built for global B2B sourcing.';

/** Default social share image (absolute URL). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero-industrial-automation.png`;

/** Default Open Graph type. */
export const DEFAULT_OG_TYPE = 'website';

/** Twitter Card type + handle (handle stays blank until an account exists). */
export const TWITTER_CARD = 'summary_large_image';
export const TWITTER_HANDLE = '';

/** Default robots directive for indexable pages. */
export const DEFAULT_ROBOTS = 'index, follow';

/** Organization JSON-LD (schema.org) emitted site-wide. */
export const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/gyutron-logo.svg`,
  sameAs: [] as string[],
} as const;

/** Bundled defaults, for callers that prefer one import. */
export const seo = {
  siteName: SITE_NAME,
  siteUrl: SITE_URL,
  defaultLocale: DEFAULT_LOCALE,
  supportedLocales: SUPPORTED_LOCALES,
  defaultTitle: DEFAULT_TITLE,
  titleTemplate: TITLE_TEMPLATE,
  defaultDescription: DEFAULT_DESCRIPTION,
  defaultOgImage: DEFAULT_OG_IMAGE,
  defaultOgType: DEFAULT_OG_TYPE,
  twitterCard: TWITTER_CARD,
  twitterHandle: TWITTER_HANDLE,
  defaultRobots: DEFAULT_ROBOTS,
  organization: ORGANIZATION,
} as const;
