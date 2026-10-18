/** Curated homepage entry points into the existing catalog, in display order.
 * Images are slot-owned exports; see asset-workbench/home-products/README.md.
 * Keep copy brief; detailed specifications belong on the category pages.
 */
type HomeProduct = {
  category: string; labelKey: string; image: string; width: number; height: number;
  layout?: 'feature' | 'readers' | 'controllers'; imageScale?: number;
  secondary?: { image: string; width: number; height: number; imageScale?: number };
};
export const HOME_PRODUCTS: readonly HomeProduct[] = [
  { category: 'area-scan-cameras', labelKey: 'home.products.cameras', image: '/home-products/area-scan-cameras.webp', width: 640, height: 512, imageScale: 1.3 },
  { category: 'smart-vision-sensors', labelKey: 'home.products.3d', image: '/home-products/smart-vision-sensors.webp', width: 640, height: 427, imageScale: 1.2 },
  { category: 'barcode-scanners', labelKey: 'home.products.scanners', image: '/home-products/barcode-scanners.webp', width: 1000, height: 1000, layout: 'feature' },
  { category: 'vision-lighting', labelKey: 'home.products.lighting', image: '/home-products/vision-lighting.webp', width: 640, height: 512, imageScale: 1.2 },
  { category: 'proximity-sensors', labelKey: 'home.products.sensors', image: '/home-products/industrial-sensors.webp', width: 640, height: 640 },
  { category: 'code-reading-cameras', labelKey: 'home.products.readers', image: '/home-products/code-reading-cameras.webp', width: 1000, height: 800, layout: 'readers', imageScale: 1.3, secondary: { image: '/home-products/code-reading-cameras-secondary.webp', width: 1000, height: 667, imageScale: 1.45 } },
  { category: 'android-pda', labelKey: 'home.products.pda', image: '/home-products/android-pda.webp', width: 427, height: 640, imageScale: 1.08 },
  { category: 'robot-workcells', labelKey: 'home.products.robots', image: '/home-products/robot-workcells.webp', width: 640, height: 512, imageScale: 1.02 },
  { category: 'edge-controllers', labelKey: 'home.products.controllers', image: '/home-products/edge-controllers.webp', width: 900, height: 720, layout: 'controllers', imageScale: 1.12, secondary: { image: '/home-products/edge-controllers-secondary.webp', width: 755, height: 900, imageScale: 1.2 } },
] as const;
