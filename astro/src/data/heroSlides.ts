export type HeroLayout = 'solutions' | 'grid' | 'product';

export interface HeroIndustry {
  img: string;
  labelKey: string;
}

export interface HeroSlide {
  id: string;
  layout: HeroLayout;
  accent: string;
  bg: string;
  kickerKey?: string;
  titleKey?: string;
  subKey?: string;
  ctaKey?: string;
  ctaHref?: string;
  cta2Key?: string;
  cta2Href?: string;
  industries?: HeroIndustry[];
  products?: string[];
  productCat?: string;
  productName?: string;
  productImg?: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 's1',
    layout: 'solutions',
    accent: 'var(--purple-500)',
    bg: '/hero-industrial-automation.png',
    kickerKey: 'main.265',
    titleKey: 'main.350',
    subKey: 'main.351',
    ctaKey: 'main.347',
    ctaHref: '#products',
    cta2Key: 'home.tc.cta',
    cta2Href: '/contact-sales.html',
    industries: [
      { img: '/nav-industry-automotive-ev.png', labelKey: 'home.tc.auto.label' },
      { img: '/nav-industry-electronics-smt.png', labelKey: 'home.tc.elec.label' },
      { img: '/nav-industry-semiconductor.png', labelKey: 'hero.s1.semi' },
      { img: '/nav-industry-logistics-rfid.png', labelKey: 'home.tc.logistics.label' },
    ],
  },
  {
    // Keep these as independent sellable product images, not one baked image.
    // To replace a future launch product, change only the matching path below.
    id: 's2',
    layout: 'grid',
    accent: 'var(--purple-500)',
    bg: '/cta-industrial-control.png',
    kickerKey: 'main.004',
    titleKey: 'hero.s2.title',
    subKey: 'main.363',
    ctaKey: 'main.347',
    ctaHref: '#products',
    products: [
      '/product-cutouts/generated/gy-a90-touch.png',
      '/product-cutouts/generated/gy-r90-falcon.png',
      '/product-cutouts/generated/gy-s900-xr.png',
      '/product-cutouts/generated/gy-cr900-matrix.png',
      '/product-cutouts/generated/gy-v900-pro.png',
      '/product-cutouts/generated/gy-v3d900.png',
      '/product-cutouts/generated/gy-px90.png',
      '/product-cutouts/generated/gy-ld90.png',
      '/product-cutouts/generated/gy-safe90.png',
      '/product-cutouts/generated/gy-mg90.png',
      '/product-cutouts/generated/gy-vm900.png',
      '/product-cutouts/generated/gy-net90.png',
    ],
  },
  {
    id: 's3',
    layout: 'product',
    accent: 'var(--purple-500)',
    bg: '/mega-industrial-products.png',
    productCat: 'android-pda',
    productName: 'GY-A90 Touch',
    productImg: '/product-cutouts/generated/gy-a90-touch.png',
    ctaKey: 'main.338',
    ctaHref: '/android-pda.html',
  },
];
