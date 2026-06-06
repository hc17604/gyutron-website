/**
 * Centralized site constants. This is the single source for the canonical origin and
 * brand name — import from here instead of hardcoding the URL/name in components.
 * (Locale list/default come from `src/i18n`, the single source for i18n.)
 */
import type { SiteConfig } from '../types/site';
import { locales, defaultLocale } from '../i18n';

/** Canonical origin (matches `site:` in astro.config.mjs and the canonical/hreflang URLs). */
export const SITE_URL = 'https://www.gyutron.com';

/** Brand name. */
export const SITE_NAME = 'GYUTRON';

export const site: SiteConfig = {
  url: SITE_URL,
  name: SITE_NAME,
  defaultLocale,
  locales,
};
