/**
 * Site asset registry — a single, documented index of the SITE-LEVEL shared images so a
 * maintainer can find an image, know its purpose, and see where it is used.
 *
 * SCOPE (deliberately curated, not every file in public/):
 *  - Brand marks (logos), the default social-share image, payment marks, homepage hero
 *    backgrounds, and the homepage hero industry collage.
 *
 * NOT duplicated here (already owned by their own data layer — edit there):
 *  - Per-product & per-category images  -> src/data/products.{en,de,ja}.js  (`image`, `heroImage`)
 *  - Mega-menu panel images             -> src/data/header-navigation.ts
 *  - Hero slide art (cutouts/products)  -> src/data/heroSlides.ts
 *
 * WIRING: this registry is intentionally NOT yet wired into consumers (SeoHead / structured-data
 * / Header / product data still use their inline paths). It is additive and deploy-neutral; a
 * consumer can adopt it incrementally via getImage(id) without changing rendered output.
 *
 * ── ALT AUDIT (2026-06-07) ────────────────────────────────────────────────────────────────
 * A scan of the built dist/ found 17 images with empty alt — ALL are homepage-hero decorative
 * layers (industry collage, product grid, product spotlight) whose parent carries
 * aria-hidden="true"; this is intentional and correct (they are decorative, marked
 * `decorative: true` below where indexed). Content images (logo, product images) carry proper
 * alt. No GENUINELY-missing alt was found. TODO (future, when an image is rendered as content
 * rather than background/decorative): supply localized alt at that point.
 */
import type { Locale } from '../i18n';
import type { SiteImage } from '../types/asset';

/** Locale-invariant alt (proper noun / brand mark — same text in every locale). */
const inv = (s: string): Record<Locale, string> => ({ en: s, de: s, ja: s });
/** Decorative image — intentionally empty alt in every locale. */
const EMPTY: Record<Locale, string> = { en: '', de: '', ja: '' };

export const SITE_IMAGES: SiteImage[] = [
  // ── Brand marks ─────────────────────────────────────────────────────────────
  {
    id: 'logo-header',
    src: '/gyutron-logo-purple.png',
    alt: inv('GYUTRON'),
    usage: ['Header.astro brand link'],
    owner: 'brand',
  },
  {
    id: 'logo-schema',
    src: '/gyutron-logo.svg',
    alt: inv('GYUTRON'),
    usage: ['Organization JSON-LD logo (config/seo.ts ORGANIZATION.logo, absolute URL)'],
    owner: 'brand',
  },
  {
    id: 'logo-light',
    src: '/gyutron-logo-light.svg',
    alt: inv('GYUTRON'),
    usage: ['available — not currently referenced in src/'],
    owner: 'brand',
  },

  // ── SEO / social share ──────────────────────────────────────────────────────
  {
    id: 'og-default',
    src: '/hero-industrial-automation.png',
    alt: EMPTY, // og:image is a meta tag (no rendered alt); also the slide-1 background
    usage: ['default og:image (config/seo.ts DEFAULT_OG_IMAGE)', 'homepage hero slide 1 background'],
    owner: 'seo',
    decorative: true,
  },

  // ── Homepage hero backgrounds (decorative) ──────────────────────────────────
  {
    id: 'hero-bg-grid',
    src: '/cta-industrial-control.png',
    alt: EMPTY,
    usage: ['homepage hero slide 2 (grid) background — heroSlides.ts'],
    owner: 'brand',
    decorative: true,
  },
  {
    id: 'hero-bg-product',
    src: '/mega-industrial-products.png',
    alt: EMPTY,
    usage: ['homepage hero slide 3 (product) background — heroSlides.ts'],
    owner: 'brand',
    decorative: true,
  },

  // ── Homepage hero industry collage (decorative in hero; captions via i18n) ───
  // These four also appear in the Header "Industries" mega-menu (owned by header-navigation.ts).
  {
    id: 'industry-automotive-ev',
    src: '/nav-industry-automotive-ev.png',
    alt: EMPTY,
    usage: ['homepage hero slide 1 collage (decorative; caption via i18n home.tc.auto.label)', 'header mega-menu (Industries)'],
    owner: 'brand',
    decorative: true,
  },
  {
    id: 'industry-electronics-smt',
    src: '/nav-industry-electronics-smt.png',
    alt: EMPTY,
    usage: ['homepage hero slide 1 collage (decorative; caption via i18n home.tc.elec.label)', 'header mega-menu (Industries)'],
    owner: 'brand',
    decorative: true,
  },
  {
    id: 'industry-semiconductor',
    src: '/nav-industry-semiconductor.png',
    alt: EMPTY,
    usage: ['homepage hero slide 1 collage (decorative; caption via i18n hero.s1.semi)', 'header mega-menu (Industries)'],
    owner: 'brand',
    decorative: true,
  },
  {
    id: 'industry-logistics-rfid',
    src: '/nav-industry-logistics-rfid.png',
    alt: EMPTY,
    usage: ['homepage hero slide 1 collage (decorative; caption via i18n home.tc.logistics.label)', 'header mega-menu (Industries)'],
    owner: 'brand',
    decorative: true,
  },

  // ── Payment marks (Footer) ──────────────────────────────────────────────────
  { id: 'pay-visa', src: '/images/payment/visa.svg', alt: inv('Visa'), usage: ['Footer PaymentMethods.astro'], width: 37, height: 24, owner: 'brand' },
  { id: 'pay-mastercard', src: '/images/payment/mastercard.svg', alt: inv('Mastercard'), usage: ['Footer PaymentMethods.astro'], width: 37, height: 24, owner: 'brand' },
  { id: 'pay-amex', src: '/images/payment/amex.svg', alt: inv('American Express'), usage: ['Footer PaymentMethods.astro'], width: 37, height: 24, owner: 'brand' },
  { id: 'pay-unionpay', src: '/images/payment/unionpay.svg', alt: inv('UnionPay'), usage: ['Footer PaymentMethods.astro'], width: 37, height: 24, owner: 'brand' },
  { id: 'pay-paypal', src: '/images/payment/paypal.svg', alt: inv('PayPal'), usage: ['Footer PaymentMethods.astro'], width: 37, height: 24, owner: 'brand' },
];

/** Look up a registered site image by id, or undefined. */
export function getImage(id: string): SiteImage | undefined {
  return SITE_IMAGES.find((img) => img.id === id);
}
