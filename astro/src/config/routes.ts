/**
 * Canonical page paths (en, no locale prefix). Combine with `localizeUrl(locale, path)`
 * from `src/i18n` for the localized URL. Product category pages are dynamic — use
 * `categoryPath(slug)`.
 */
export const ROUTES = {
  home: '/',
  contact: '/contact-sales.html',
  solution: '/automated-vision-inspection.html',
  support: '/support.html',
  faq: '/support/faq.html',
  warranty: '/support/warranty.html',
  shipping: '/support/shipping-delivery.html',
  privacy: '/privacy-policy.html',
  terms: '/terms-and-conditions.html',
} as const;

export type RouteKey = keyof typeof ROUTES;

/** Path for a product category page, e.g. categoryPath('barcode-scanners'). */
export function categoryPath(slug: string): string {
  return `/${slug}.html`;
}
