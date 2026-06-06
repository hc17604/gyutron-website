/**
 * Canonical navigation model. The header mega-menu and footer columns are currently
 * authored as markup in `Header.astro` / `Footer.astro`; this file is the single data
 * source they should be rewired to read from (incrementally — see docs/COMPONENTS.md).
 *
 * Links reference i18n keys (`labelKey`) where the existing markup does. `FOOTER_NAV`
 * mirrors `Footer.astro` exactly. `MAIN_NAV` lists the top-level header items; the product
 * submenus are derived from the product catalog (`src/data/products.ts`) — wiring TODO.
 */
import type { NavGroup, NavItem } from '../types/site';

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
    labelKey: 'fnav.support', // Support
    links: [
      { labelKey: 'fnav.faq', href: '/support/faq.html' },
      { labelKey: 'fnav.contactSupport', href: '/support.html' },
      { labelKey: 'fnav.warranty', href: '/support/warranty.html' },
      { labelKey: 'fnav.shipping', href: '/support/shipping-delivery.html' },
      { labelKey: 'fnav.privacy', href: '/privacy-policy.html' },
      { labelKey: 'fnav.terms', href: '/terms-and-conditions.html' },
    ],
  },
  {
    labelKey: 'main.182', // Company
    links: [
      { labelKey: 'main.183', href: '/about' },
      { labelKey: 'main.462', href: '/certifications' },
      { labelKey: 'main.420', href: '/downloads' },
      { labelKey: 'fnav.contact', href: '/contact-sales.html' },
    ],
  },
];

/**
 * Top-level header items. Labels are English placeholders pending a label→i18n-key mapping
 * (do NOT invent keys; map them when this is wired into Header.astro). The Products groups
 * come from the product catalog; Support/Company mirror FOOTER_NAV.
 */
export const MAIN_NAV: NavItem[] = [
  { label: 'Products', href: '/' }, // opens the products mega-menu (categories from product catalog)
  { label: 'Solutions', href: '/automated-vision-inspection.html' },
  { label: 'Industries' },
  { label: 'Resources' },
  { label: 'Company', href: '/about' },
  { label: 'Support', href: '/support.html' },
];
