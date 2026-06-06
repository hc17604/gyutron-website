/**
 * Support-center page registry (paths + nav/title i18n keys). Mirrors the support and
 * legal links in `Footer.astro`. Use this to render the support hub / footer support
 * column from data instead of hardcoding the list.
 */
import type { SupportPageMeta } from '../types/support';

export const SUPPORT_PAGES: SupportPageMeta[] = [
  { slug: 'faq', path: '/support/faq.html', titleKey: 'fnav.faq' },
  { slug: 'contact', path: '/support.html', titleKey: 'fnav.contactSupport' },
  { slug: 'warranty', path: '/support/warranty.html', titleKey: 'fnav.warranty' },
  { slug: 'shipping-delivery', path: '/support/shipping-delivery.html', titleKey: 'fnav.shipping' },
  { slug: 'privacy-policy', path: '/privacy-policy.html', titleKey: 'fnav.privacy', legal: true },
  { slug: 'terms-and-conditions', path: '/terms-and-conditions.html', titleKey: 'fnav.terms', legal: true },
];

export function getSupportPage(slug: string): SupportPageMeta | undefined {
  return SUPPORT_PAGES.find((p) => p.slug === slug);
}
