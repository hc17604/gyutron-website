/* ============================================================================
 * heroSlides.ts — Hero 三屏配置(三种不同版式 layout)
 * ----------------------------------------------------------------------------
 *  s1 'solutions' 品牌能力总览:左文案(能力覆盖) + 右行业应用照片拼贴
 *  s2 'grid'      产品全家福:左文案 + 右产品抠图网格(每条产品线挑几款,FARSET 风)
 *  s3 'product'   单品聚焦:左单品抠图大图(透明,浮在深色上) + 右型号/规格/标签
 * ----------------------------------------------------------------------------
 *  文案:'solutions'/'grid' 走 i18n key;'product' 按 locale 读 products.{locale}.js。
 *  图片:绝对路径(/public 下);产品抠图在 /product-cutouts/(透明 PNG)。
 *  动画节奏在 HeroSlider.astro 顶部 SEQ / li()。
 * ========================================================================== */
export type HeroLayout = 'solutions' | 'grid' | 'product';
export interface HeroIndustry { img: string; labelKey: string; }
export interface HeroSlide {
  id: string;
  layout: HeroLayout;
  accent: string;
  bg: string;
  kickerKey?: string;
  titleKey?: string;
  subKey?: string;
  ctaKey?: string;  ctaHref?: string;
  cta2Key?: string; cta2Href?: string;
  industries?: HeroIndustry[];   // layout='solutions'
  products?: string[];           // layout='grid'(产品抠图绝对路径)
  productCat?: string;           // layout='product'
  productName?: string;
  productImg?: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    // ① 品牌能力总览(概述整体能力覆盖,非单一解决方案)
    id: 's1',
    layout: 'solutions',
    accent: 'var(--purple-500)',
    bg: '/hero-industrial-automation.png',
    kickerKey: 'main.265',          // Manufacturing Intelligence
    titleKey: 'main.350',           // Hardware that sees, senses, scans, measures, and acts.
    subKey: 'main.351',             // From handheld terminals to smart cameras and inspection modules…
    ctaKey: 'main.347', ctaHref: '#products',                 // Explore Products
    cta2Key: 'home.tc.cta', cta2Href: '/contact-sales.html',  // Talk to our team
    industries: [
      { img: '/nav-industry-automotive-ev.png',  labelKey: 'home.tc.auto.label' },      // 汽车 & EV
      { img: '/nav-industry-electronics-smt.png', labelKey: 'home.tc.elec.label' },      // 3C 电子
      { img: '/nav-industry-semiconductor.png',   labelKey: 'hero.s1.semi' },            // 半导体
      { img: '/nav-industry-logistics-rfid.png',  labelKey: 'home.tc.logistics.label' }, // 物流
    ],
  },
  {
    // ② 产品全家福网格(每条产品线挑几款抠图,FARSET 模板)
    id: 's2',
    layout: 'grid',
    accent: 'var(--purple-500)',
    bg: '/cta-industrial-control.png',
    kickerKey: 'main.004',          // Products
    titleKey: 'hero.s2.title',      // One platform. Every job.
    subKey: 'main.363',             // Industrial intelligence for the places work actually happens.
    ctaKey: 'main.347', ctaHref: '#products',                 // Explore Products
    products: [
      '/product-cutouts/gy-a80-ultra.png',     // PDA(数据采集)
      '/product-cutouts/gy-r70-longrange.png', // RFID 手持
      '/product-cutouts/gy-s360-xr.png',       // 条码扫描枪
      '/product-cutouts/gy-a60-max.png',       // PDA 大屏
      '/product-cutouts/gy-v380-pro.png',      // 智能相机(机器视觉)
      '/product-cutouts/gy-cr390.png',         // 固定式读码器
      '/product-cutouts/gy-v3d90.png',         // 3D 相机
      '/product-cutouts/gy-px18.png',          // 光电传感器(传感/IO)
      '/product-cutouts/gy-ld40.png',          // 激光位移传感器
      '/product-cutouts/gy-safe24.png',        // 安全光幕
      '/product-cutouts/gy-mg50.png',          // 测量量规(质检)
      '/product-cutouts/gy-vm200.png',         // 影像测量仪
    ],
  },
  {
    // ③ 单品聚焦 — GY-A80 Ultra(抠图透明,放大,浮在深色上)
    id: 's3',
    layout: 'product',
    accent: 'var(--purple-500)',
    bg: '/mega-industrial-products.png',
    productCat: 'android-pda',
    productName: 'GY-A80 Ultra',
    productImg: '/product-cutouts/gy-a80-ultra.png',
    ctaKey: 'main.338', ctaHref: '/android-pda.html',         // Learn More
  },
];
