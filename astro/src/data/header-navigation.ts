/**
 * Header mega-menu data — the single source of truth for the desktop Header and the mobile
 * drawer (which clones the rendered desktop DOM). Edit links/sections/submenus HERE; the
 * render components in `components/navigation/` are stable and should not need changes.
 *
 * Shape: see `src/types/navigation.ts`. Adding entries:
 *   - new top-level item  → add a `HeaderNavItem` (triggerHref + labelKey + menu).
 *   - new mega section     → push a `{ labelKey, groups: [] }` onto `menu.sections`.
 *   - new product/category → push a `{ link, submenu }` group onto a section.
 *   - new submenu link     → push `{ href, titleKey, descKey }` onto `submenu.links`.
 * Every `*Key` must exist in src/i18n/{en,de,ja}.json (build throws on a missing key).
 * Keep image paths (incl. any `?v=` cache-buster) and never translate model names (GY-*).
 *
 * GENERATED once from the legacy Header.astro markup, then hand-maintained. Verified
 * byte-structure-identical to the old header across en/de/ja (see HANDOFF.md / docs).
 */
import type { HeaderNavItem } from '../types/navigation';
import { SOLUTIONS } from './solutions';
import { INDUSTRIES } from './industries';

// Solutions mega-menu groups derived from the solutions registry so the top nav always lists EVERY
// solution page and auto-syncs as solutions are added/removed. Each group = one solution; its submenu
// links to that solution's key in-page sections (samples shown only when the solution has a gallery).
const solutionGroups = SOLUTIONS.map((s) => {
  // Each solution's flyout is built from ITS OWN data so the third level is differentiated, not the
  // same generic anchors on every solution: a short intro blurb (hero desc) + that solution's actual
  // capability list (3–5 specific items). Fills the panel and reads as a real solution overview.
  // up to 4 of the solution's OWN capabilities (verbatim from the page data, not invented) — 2×2 keeps
  // the flyout balanced and from overflowing the panel.
  const caps = (s.sections?.find((sec) => sec.kind === 'capability')?.cards ?? []).slice(0, 4);
  return {
    link: { href: s.path, titleKey: s.breadcrumbKey!, descKey: s.sections?.[0]?.titleKey ?? s.descKey! },
    submenu: {
      image: s.heroImage ?? '/product-vision-cell.png',
      blurbKey: s.hero?.descKey ?? s.descKey!,
      links: caps.map((c) => ({ href: `${s.path}#capabilities`, titleKey: c.titleKey, descKey: c.descKey })),
    },
  };
});

// Industries mega-menu groups derived from the industries registry so the top nav always lists EVERY
// industry and auto-syncs as industries are added/removed/reordered. Each group = one industry; its
// flyout is a soft info panel (.submenu--solution, blurbKey set) = a one-line intro plus the areas that
// industry COVERS, rendered as non-clickable title-only cap boxes (no per-item description). The
// dedicated per-industry page is a later step, so the coverage previews the scope rather than links out.
// The mega-link itself points at `ind.path` (a homepage anchor until the industry page exists).
const industryGroups = INDUSTRIES.map((ind) => ({
  link: { href: ind.path, titleKey: ind.labelKey, descKey: ind.taglineKey },
  submenu: {
    image: ind.image,
    blurbKey: ind.introKey,
    detailKey: ind.detailKey,
    links: ind.coverage.map((c) => ({ href: ind.path, titleKey: c.labelKey })),
  },
}));

export const HEADER_NAV: HeaderNavItem[] = [
  {
    triggerHref: '/index.html#products',
    labelKey: 'main.004',
    menu: {
      variant: 'standard',
      overviewImage: '/mega-industrial-products.png',
      feature: { modifier: 'mega-feature-products', href: '/index.html#products', titleKey: 'main.005', descKey: 'main.006' },
      sections: [
        {
          labelKey: 'main.393',
          groups: [
            {
              link: { href: '/android-pda.html', titleKey: 'main.007', descKey: 'main.008' },
              submenu: {
                image: '/product-intelligent-hardware.png',
                links: [
                  { href: '/android-pda.html', titleKey: 'main.009', descKey: 'main.010' },
                  { href: '/rfid-handhelds.html', titleKey: 'main.011', descKey: 'main.012' },
                  { href: '/barcode-scanners.html', titleKey: 'main.013', descKey: 'main.014' },
                  { href: '/request-specification.html', titleKey: 'main.015', descKey: 'main.016' },
                ],
              },
            },
            {
              link: { href: '/proximity-sensors.html', titleKey: 'main.017', descKey: 'main.018' },
              submenu: {
                image: '/product-hero-industrial-sensors-matrix.png',
                links: [
                  { href: '/proximity-sensors.html', titleKey: 'main.019', descKey: 'main.020' },
                  { href: '/laser-measurement.html', titleKey: 'main.021', descKey: 'main.022' },
                  { href: '/environmental-sensing.html', titleKey: 'main.023', descKey: 'main.024' },
                ],
              },
            },
            {
              link: { href: '/area-scan-cameras.html', titleKey: 'main.025', descKey: 'main.026' },
              submenu: {
                image: '/product-smart-camera-detail.png',
                links: [
                  { href: '/area-scan-cameras.html', titleKey: 'main.027', descKey: 'main.028' },
                  { href: '/smart-vision-sensors.html', titleKey: 'main.394', descKey: 'main.029' },
                  { href: '/code-reading-cameras.html', titleKey: 'main.030', descKey: 'main.031' },
                  { href: '/vision-lighting.html', titleKey: 'main.032', descKey: 'main.033' },
                ],
              },
            },
            {
              link: { href: '/dimensional-gauges.html', titleKey: 'main.034', descKey: 'main.035' },
              submenu: {
                image: '/product-hero-inspection-instruments-matrix.png',
                links: [
                  { href: '/dimensional-gauges.html', titleKey: 'main.036', descKey: 'main.037' },
                  { href: '/surface-inspection.html', titleKey: 'main.038', descKey: 'main.039' },
                  { href: '/portable-testers.html', titleKey: 'main.040', descKey: 'main.041' },
                  { href: '/calibration-tools.html', titleKey: 'main.042', descKey: 'main.043' },
                ],
              },
            },
          ],
        },
        {
          labelKey: 'main.044',
          groups: [
            {
              link: { href: '/robot-workcells.html', titleKey: 'main.045', descKey: 'main.046' },
              submenu: {
                intro: true,
                image: '/product-menu-robot-workcells-stage.png',
                links: [
                  { href: '/robot-workcells.html', titleKey: 'main.045', descKey: 'main.046' },
                ],
              },
            },
            {
              link: { href: '/edge-controllers.html', titleKey: 'main.047', descKey: 'main.048' },
              submenu: {
                intro: true,
                image: '/product-menu-edge-controllers-stage.png',
                links: [
                  { href: '/edge-controllers.html', titleKey: 'main.047', descKey: 'main.048' },
                ],
              },
            },
            {
              link: { href: '/accessories.html', titleKey: 'main.049', descKey: 'main.050' },
              submenu: {
                intro: true,
                image: '/product-menu-accessories-stage.png',
                links: [
                  { href: '/accessories.html', titleKey: 'main.049', descKey: 'main.050' },
                ],
              },
            },
          ],
        },
      ],
    },
  },
  {
    triggerHref: '/automated-vision-inspection.html',
    labelKey: 'main.051',
    menu: {
      variant: 'standard',
      overviewImage: '/product-vision-cell.png',
      feature: { modifier: 'mega-feature-solutions', href: '/automated-vision-inspection.html', titleKey: 'main.052', descKey: 'main.053' },
      sections: [
        { labelKey: 'main.054', groups: solutionGroups },
      ],
      extraLinks: [
        { href: '/index.html#resources', titleKey: 'main.101', descKey: 'main.102' },
      ],
    },
  },
  {
    triggerHref: '/index.html#solutions',
    labelKey: 'main.103',
    menu: {
      variant: 'compact',
      overviewImage: '/nav-industries-overview.png?v=20260525-hd2',
      sections: [
        { labelKey: 'ind.section.label', groups: industryGroups },
      ],
    },
  },
  {
    // SUPPORT — owner-facing service + downloads/docs (Option B). Built by recombining the existing
    // service/training keys (ex-"Customers") with the documentation/help keys (ex-"Resources").
    triggerHref: '/support.html',
    labelKey: 'fnav.support',
    menu: {
      variant: 'compact',
      overviewImage: '/nav-customers-overview.png?v=20260525-hd2',
      sections: [
        {
          labelKey: 'fnav.support',
          groups: [
            {
              link: { href: '/contact-sales.html', titleKey: 'main.152', descKey: 'main.153' },
              submenu: {
                image: '/nav-customer-lifecycle-support.png?v=20260525-hd2',
                links: [
                  { href: '/contact-sales.html', titleKey: 'main.154', descKey: 'main.155' },
                  { href: '/contact-sales.html', titleKey: 'main.156', descKey: 'main.157' },
                  { href: '/contact-sales.html', titleKey: 'main.158', descKey: 'main.159' },
                  { href: '/index.html#products', titleKey: 'main.160', descKey: 'main.161' },
                ],
              },
            },
            {
              link: { href: '/index.html#resources', titleKey: 'main.229', descKey: 'main.230' },
              submenu: {
                image: '/nav-resources-technical-library.png?v=20260525-hd2',
                links: [
                  { href: '/index.html#resources', titleKey: 'main.231', descKey: 'main.232' },
                  { href: '/index.html#resources', titleKey: 'main.406', descKey: 'main.233' },
                  { href: '/index.html#resources', titleKey: 'main.234', descKey: 'main.235' },
                  { href: '/index.html#resources', titleKey: 'main.407', descKey: 'main.236' },
                ],
              },
            },
            {
              link: { href: '/index.html#resources', titleKey: 'main.162', descKey: 'main.163' },
              submenu: {
                image: '/nav-customer-training.png?v=20260525-hd2',
                links: [
                  { href: '/index.html#resources', titleKey: 'main.164', descKey: 'main.165' },
                  { href: '/index.html#resources', titleKey: 'main.166', descKey: 'main.167' },
                  { href: '/index.html#resources', titleKey: 'main.168', descKey: 'main.169' },
                  { href: '/index.html#resources', titleKey: 'main.170', descKey: 'main.171' },
                ],
              },
            },
            {
              link: { href: '/support.html', titleKey: 'main.247', descKey: 'main.248' },
              submenu: {
                image: '/contact-sales-hero.png',
                links: [
                  { href: '/support/faq.html', titleText: 'FAQ', descKey: 'main.249' },
                  { href: '/support.html', titleKey: 'main.254', descKey: 'main.255' },
                  { href: '/contact-sales.html', titleKey: 'main.250', descKey: 'main.251' },
                  { href: '/index.html#resources', titleKey: 'main.252', descKey: 'main.253' },
                ],
              },
            },
          ],
        },
      ],
    },
  },
  {
    // RESOURCES — top-of-funnel learning + pre-sales decision tools (Option B). Company was demoted to
    // the footer; the old "Customer Success" pre-sales group lives here as "Plan Your Project".
    triggerHref: '/index.html#resources',
    labelKey: 'main.220',
    menu: {
      variant: 'compact',
      overviewImage: '/nav-resources-overview.png?v=20260525-hd2',
      sections: [
        {
          labelKey: 'main.220',
          groups: [
            {
              link: { href: '/index.html#resources', titleKey: 'main.221', descKey: 'main.222' },
              submenu: {
                image: '/nav-resources-technical-library.png?v=20260525-hd2',
                links: [
                  { href: '/index.html#resources', titleKey: 'main.223', descKey: 'main.224' },
                  { href: '/index.html#resources', titleKey: 'main.225', descKey: 'main.226' },
                  { href: '/index.html#resources', titleKey: 'main.404', descKey: 'main.227' },
                  { href: '/index.html#resources', titleKey: 'main.405', descKey: 'main.228' },
                ],
              },
            },
            {
              link: { href: '/index.html#resources', titleKey: 'main.237', descKey: 'main.238' },
              submenu: {
                image: '/governance-documentation.png',
                links: [
                  { href: '/index.html#products', titleKey: 'main.239', descKey: 'main.240' },
                  { href: '/contact-sales.html', titleKey: 'main.241', descKey: 'main.242' },
                  { href: '/contact-sales.html', titleKey: 'main.243', descKey: 'main.244' },
                  { href: '/index.html#resources', titleKey: 'main.245', descKey: 'main.246' },
                ],
              },
            },
            {
              link: { href: '/contact-sales.html', titleKey: 'main.142', descKey: 'main.143' },
              submenu: {
                image: '/nav-customer-pilot-lab.png?v=20260525-hd2',
                links: [
                  { href: '/contact-sales.html', titleKey: 'main.144', descKey: 'main.145' },
                  { href: '/contact-sales.html', titleKey: 'main.146', descKey: 'main.147' },
                  { href: '/contact-sales.html', titleKey: 'main.148', descKey: 'main.149' },
                  { href: '/contact-sales.html', titleKey: 'main.150', descKey: 'main.151' },
                ],
              },
            },
          ],
        },
      ],
    },
  },
];
