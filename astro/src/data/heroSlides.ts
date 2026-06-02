/* ============================================================================
 * heroSlides.ts — Hero 三屏配置(三种不同版式 layout,参照 thinklucid 三张图)
 * ----------------------------------------------------------------------------
 *  s1 'solutions' 行业解决方案:左文案 + 右行业应用照片拼贴(汽车/3C/半导体/物流)
 *  s2 'matrix'    产品矩阵:居中标题 + 四大产品族矩阵图清单
 *  s3 'product'   单品聚焦:左单品大图 + 右型号/规格/标签(GY-A80 Ultra)
 * ----------------------------------------------------------------------------
 *  文案:'solutions'/'matrix' 走 i18n key(t(locale,key),全部复用已翻译键);
 *        'product' 在组件里按 locale 读 products.{locale}.js(自带三语)。
 *  图片:绝对路径(/public 下)。动画节奏在 HeroSlider.astro 顶部 SEQ。
 * ========================================================================== */
export type HeroLayout = 'solutions' | 'matrix' | 'product';
export interface HeroIndustry { img: string; labelKey: string; }
export interface HeroFamily { cat: string; img: string; }
export interface HeroSlide {
  id: string;
  layout: HeroLayout;
  accent: string;          // 强调色(统一品牌紫)
  bg: string;              // 全屏深色背景图
  kickerKey?: string;
  titleKey?: string;
  subKey?: string;
  ctaKey?: string;  ctaHref?: string;
  cta2Key?: string; cta2Href?: string;
  industries?: HeroIndustry[];   // layout='solutions'
  families?: HeroFamily[];       // layout='matrix'(cat = products.* 的品类 key,取其 eyebrow 作族名)
  productCat?: string;           // layout='product'
  productName?: string;          // layout='product'(精确型号名,locale 无关)
  productImg?: string;           // layout='product'
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 's1',
    layout: 'solutions',
    accent: 'var(--purple-500)',
    bg: '/hero-industrial-automation.png',
    kickerKey: 'main.051',          // Solutions
    titleKey: 'home.tc.heading',    // Built for the way your industry works
    subKey: 'home.tc.sub',          // One hardware platform, tuned to each production environment.
    ctaKey: 'main.348', ctaHref: '#solutions',               // View Solutions
    cta2Key: 'home.tc.cta', cta2Href: '/contact-sales.html', // Talk to our team
    industries: [
      { img: '/nav-industry-automotive-ev.png',  labelKey: 'home.tc.auto.label' },      // 汽车 & EV
      { img: '/nav-industry-electronics-smt.png', labelKey: 'home.tc.elec.label' },      // 3C 电子
      { img: '/nav-industry-semiconductor.png',   labelKey: 'hero.s1.semi' },            // 半导体
      { img: '/nav-industry-logistics-rfid.png',  labelKey: 'home.tc.logistics.label' }, // 物流
    ],
  },
  {
    id: 's2',
    layout: 'matrix',
    accent: 'var(--purple-500)',
    bg: '/cta-industrial-control.png',
    kickerKey: 'main.004',          // Products
    titleKey: 'main.350',           // Hardware that sees, senses, scans, measures, and acts.
    subKey: 'main.351',             // portfolio 描述
    ctaKey: 'main.347', ctaHref: '#products',                // Explore Products
    families: [
      { cat: 'android-pda',        img: '/product-hero-android-pda-matrix.png' },        // Rugged PDA & Data Capture
      { cat: 'area-scan-cameras',  img: '/product-hero-area-scan-cameras-matrix.png' },  // Machine Vision Systems
      { cat: 'proximity-sensors',  img: '/product-hero-proximity-sensors-matrix.png' },  // Sensing & I/O
      { cat: 'dimensional-gauges', img: '/product-hero-dimensional-gauges-matrix.png' }, // Quality & Test Instruments
    ],
  },
  {
    id: 's3',
    layout: 'product',
    accent: 'var(--purple-500)',
    bg: '/mega-industrial-products.png',
    productCat: 'android-pda',
    productName: 'GY-A80 Ultra',
    productImg: '/product-images/gy-a80-ultra.png',
    ctaKey: 'main.338', ctaHref: '/android-pda.html',        // Learn More
  },
];
