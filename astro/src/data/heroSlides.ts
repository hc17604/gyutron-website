/* ============================================================================
 * heroSlides.ts — Hero 分层轮播的「结构 + 图片 + 动画参数」(不含文案)
 * ----------------------------------------------------------------------------
 * 文案与逻辑/图片分离:这里只放与语言无关的东西,文案用 i18n key(en/de/ja.json),
 * 组件渲染时用 t(locale, key) 解析。
 *
 * ▸ 新增一张幻灯片:在 HERO_SLIDES 数组加一项(id 唯一);文案 key 来自 i18n;
 *   图片放 /public 下用绝对路径;visuals 每张是独立入场图层。
 * ▸ 新增一个图层:文字层的入场节奏由 HeroSlider.astro 顶部 SEQ 统一控制;
 *   图片层在这里加 {src,pos,dir,delay,dur}。
 * ▸ 调节奏:改 HeroSlider.astro 顶部 SEQ / HOLD / FADE / 各 visual 的 delay。
 *
 * dir: 入场方向 'right'|'left'|'up'|'down'|'scale'(决定 from 位移/缩放)
 * pos: CSS 定位类后缀(hero-slider.css 里 .hsl-img--<pos> 定义具体位置/尺寸)
 * ========================================================================== */
export interface HeroTag { icon: string; key?: string; text?: string; }
export interface HeroVisual { src: string; pos: string; dir: 'right' | 'left' | 'up' | 'down' | 'scale'; delay: number; dur: number; }
export interface HeroSlide {
  id: string;
  accent: string;                 // 该片强调色(kicker/激活点/特性图标)
  bg: string;                     // 全屏背景图(深色场景)
  kickerKey: string;
  titleKey: string;
  subKey: string;
  ctaKey: string;  ctaHref: string;     // href 以 '#' 开头=同页锚点,否则按 locale 前缀
  cta2Key?: string; cta2Href?: string;
  tags: HeroTag[];
  cardKey?: string; cardSubKey?: string; // 右侧产品图上的小标签卡
  visuals: HeroVisual[];
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 's1',
    accent: '#18b6c9',
    bg: '/hero-industrial-automation.png',
    kickerKey: 'main.055', titleKey: 'main.336', subKey: 'main.337',
    ctaKey: 'main.338', ctaHref: '/automated-vision-inspection.html',
    cta2Key: 'main.339', cta2Href: '/area-scan-cameras.html',
    tags: [
      { icon: 'fa-solid fa-wave-square', text: '2D / 3D' },
      { icon: 'fa-solid fa-barcode', key: 'main.421' },
      { icon: 'fa-solid fa-robot', key: 'main.340' },
    ],
    cardKey: 'main.422', cardSubKey: 'main.341',
    visuals: [
      { src: '/product-vision-cell.png', pos: 'main', dir: 'right', delay: 1.7, dur: 0.9 },
      { src: '/product-smart-camera-detail.png', pos: 'acc1', dir: 'up', delay: 2.05, dur: 0.8 },
    ],
  },
  {
    id: 's2',
    accent: '#2d7ff9',
    bg: '/mega-industrial-products.png',
    kickerKey: 'main.342', titleKey: 'main.342', subKey: 'main.343',
    ctaKey: 'main.338', ctaHref: '/android-pda.html',
    cta2Key: 'main.011', cta2Href: '/rfid-handhelds.html',
    tags: [
      { icon: 'fa-solid fa-barcode', key: 'main.423' },
      { icon: 'fa-solid fa-wifi', text: 'RFID / NFC' },
      { icon: 'fa-brands fa-android', key: 'main.424' },
    ],
    cardKey: 'main.425', cardSubKey: 'main.344',
    visuals: [
      { src: '/product-intelligent-hardware.png', pos: 'main', dir: 'right', delay: 1.7, dur: 0.9 },
      { src: '/product-hero-rfid-handhelds-matrix.png', pos: 'acc1', dir: 'up', delay: 2.05, dur: 0.8 },
    ],
  },
  {
    id: 's3',
    accent: '#16a34a',
    bg: '/cta-industrial-control.png',
    kickerKey: 'main.426', titleKey: 'main.345', subKey: 'main.346',
    ctaKey: 'main.347', ctaHref: '#products',
    cta2Key: 'main.348', cta2Href: '#solutions',
    tags: [
      { icon: 'fa-solid fa-industry', key: 'main.427' },
      { icon: 'fa-solid fa-microchip', key: 'main.428' },
      { icon: 'fa-solid fa-circle-nodes', key: 'main.429' },
    ],
    cardKey: 'main.430', cardSubKey: 'main.349',
    visuals: [
      { src: '/hero-industrial-automation.png', pos: 'main', dir: 'right', delay: 1.7, dur: 0.9 },
      { src: '/product-vision-cell.png', pos: 'acc1', dir: 'scale', delay: 2.05, dur: 0.8 },
    ],
  },
];
