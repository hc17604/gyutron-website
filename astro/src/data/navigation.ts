/**
 * Navigation models for the footer and the (top-level) header.
 *
 * `FOOTER_NAV` mirrors `Footer.astro` exactly and drives it. `MAIN_NAV` is the top-level
 * header projection, DERIVED from `HEADER_NAV` (src/data/header-navigation.ts) — the full
 * header mega-menu data source that `components/navigation/*` render from. Links reference
 * i18n keys (`labelKey`); hrefs are canonical paths localized at render time.
 */
import type { NavGroup, NavItem } from '../types/site';
import { HEADER_NAV } from './header-navigation';

/** Footer columns — exact mirror of Footer.astro. */
export const FOOTER_NAV: NavGroup[] = [
  {
    labelKey: 'main.004', // Products
    links: [
      { labelKey: 'main.332', href: '/android-pda.html' },
      { labelKey: 'main.333', href: '/proximity-sensors.html' },
      { labelKey: 'main.334', href: '/area-scan-cameras.html' },
      { labelKey: 'main.419', href: '/dimensional-gauges.html' },
    ],
  },
  {
    labelKey: 'main.051', // Solutions
    links: [
      { labelKey: 'main.055', href: '/automated-vision-inspection.html' },
      { labelKey: 'main.264', href: '/solutions/electronics-manufacturing' },
      { labelKey: 'fnav.robotics', href: '/solutions/robotics-automation' },
    ],
  },
  {
    // Support quick-links. Downloads + Certifications live here (the top nav has the granular doc /
    // compliance items, but no single "Downloads" or "Certifications" link).
    labelKey: 'fnav.support', // Support
    links: [
      { labelKey: 'fnav.contactSupport', href: '/support.html' },
      { labelKey: 'fnav.faq', href: '/support/faq.html' },
      { labelKey: 'main.420', href: '/index.html#resources' },   // Downloads (/downloads page not built yet -> homepage anchor, no 404)
      { labelKey: 'main.462', href: '/index.html#platform' },    // Certifications (/certifications page not built yet -> homepage anchor, no 404)
      { labelKey: 'fnav.warranty', href: '/support/warranty.html' },
      { labelKey: 'fnav.shipping', href: '/support/shipping-delivery.html' },
      { labelKey: 'fnav.privacy', href: '/privacy-policy.html' },
      { labelKey: 'fnav.terms', href: '/terms-and-conditions.html' },
    ],
  },
  {
    // Company is footer-only now (Option B demoted it from the top nav); this column is its home.
    // Kept lean (5 links) so it doesn't outgrow the others — Certifications/Downloads are reachable
    // from the Support / Resources nav, so they don't need a footer slot here.
    labelKey: 'main.182', // Company
    links: [
      { labelKey: 'main.183', href: '/about' },                  // About GYUTRON
      { labelKey: 'main.403', href: '/about' },                  // Careers
      { labelKey: 'main.401', href: '/news.html' },              // Newsroom
      { labelKey: 'main.172', href: '/contact-sales.html' },     // Partner Programs (ex-Customers)
      { labelKey: 'fnav.contact', href: '/contact-sales.html' }, // Contact
    ],
  },
];

/**
 * Top-level header nav — the 6 mega-menu triggers. DERIVED from `HEADER_NAV` so there is a
 * single source of truth: the desktop Header and the mobile drawer both render from
 * `HEADER_NAV` (triggers + full mega-menu panels); this projection exposes just the
 * top-level label/href pairs for any consumer that needs them. Edit the nav in
 * `header-navigation.ts`, not here.
 */
export const MAIN_NAV: NavItem[] = HEADER_NAV.map((item) => ({
  labelKey: item.labelKey,
  href: item.triggerHref,
}));
