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
  productScales?: number[];
  categoryKeys?: string[];
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
    subKey: 'hero.s2.sub',
    ctaKey: 'main.347',
    ctaHref: '#products',
    categoryKeys: ['hero.s2.cat1', 'hero.s2.cat2', 'hero.s2.cat3', 'hero.s2.cat4'],
    products: [
      '/product-library/transparent/gy-a90-touch.png',
      '/product-library/transparent/gy-a92k-keytouch.png',
      '/product-library/transparent/gy-s900-xr.png',
      '/product-library/transparent/gy-cr900-matrix.png',
      '/product-library/transparent/gy-v900-pro.png',
      '/product-library/transparent/gy-v3d900.png',
      '/product-library/transparent/gy-vm900.png',
      '/product-library/transparent/gy-net90.png',
      '/product-library/transparent/gy-px90.png',
      '/product-library/transparent/gy-ld90.png',
      '/product-library/transparent/gy-safe90.png',
      '/product-library/transparent/gy-mg90.png',
    ],
    productScales: [1.06, 1.08, 1, 0.82, 0.84, 0.98, 0.86, 0.86, 1.08, 1.08, 1.08, 1.02],
  },
  {
    id: 's3',
    layout: 'product',
    accent: 'var(--purple-500)',
    bg: '/mega-industrial-products.png',
    productCat: 'dimensional-gauges',
    productName: 'GY-VM900',
    productImg: '/product-library/transparent/gy-vm900.png',
    ctaKey: 'main.338',
    ctaHref: '/dimensional-gauges.html',
  },
];
