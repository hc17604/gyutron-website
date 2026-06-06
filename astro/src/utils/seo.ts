/** SEO URL helpers — one place to build absolute / canonical URLs from the site origin. */
import { SITE_URL } from '../config/site';
import { localizeUrl, type Locale } from '../i18n';

/** Absolute URL for a root-relative path: '/x.html' → 'https://www.gyutron.com/x.html'. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Canonical (locale-prefixed) absolute URL for a page path. */
export function canonicalUrl(locale: Locale, path: string): string {
  return absoluteUrl(localizeUrl(locale, path));
}
