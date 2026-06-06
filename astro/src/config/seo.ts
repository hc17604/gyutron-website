/**
 * SEO defaults. Per-page title/description still come from the `seo.*` i18n keys; these
 * are fallbacks and the values needed to close the known SEO gaps (Twitter Card, og:image,
 * JSON-LD). Adopted by `src/components/seo/SeoHead.astro` — see docs/SEO.md.
 */
import { SITE_NAME, SITE_URL } from './site';

/** Title template for pages that don't supply a full title. */
export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/** Fallback meta description. */
export const DEFAULT_DESCRIPTION =
  'GYUTRON supplies industrial intelligent hardware and machine-vision solutions for ' +
  'automation, inspection, and data capture — built for global B2B sourcing.';

/** Default social share image (absolute URL). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero-industrial-automation.png`;

/** Twitter handle for `twitter:site` (placeholder — set when an account exists). */
export const TWITTER_HANDLE = '';

/** Organization JSON-LD, for emitting `<script type="application/ld+json">`. */
export const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/gyutron-logo.svg`,
  sameAs: [] as string[],
} as const;
