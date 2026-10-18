/** Curated homepage entry points into the existing catalog, in display order.
 * Images are slot-owned exports; see asset-workbench/home-products/README.md.
 * Keep copy brief; detailed specifications belong on the category pages.
 */
type HomeProduct = {
  category: string; labelKey: string; image: string; width: number; height: number;
  featured?: boolean; tagKey?: string;
  secondary?: { image: string; width: number; height: number };
};
export const HOME_PRODUCTS: readonly HomeProduct[] = [
  { category: 'area-scan-cameras', labelKey: 'home.products.cameras', image: '/home-products/area-scan-cameras.webp', width: 640, height: 512 },
  { category: 'smart-vision-sensors', labelKey: 'home.products.3d', image: '/home-products/smart-vision-sensors.webp', width: 640, height: 427 },
  { category: 'barcode-scanners', labelKey: 'home.products.scanners', image: '/home-products/barcode-scanners.webp', width: 1000, height: 1000, featured: true, tagKey: 'home.products.scanners.tag' },
  { category: 'code-reading-cameras', labelKey: 'home.products.readers', image: '/home-products/code-reading-cameras.webp', width: 1000, height: 800, featured: true, tagKey: 'home.products.readers.tag', secondary: { image: '/home-products/code-reading-cameras-secondary.webp', width: 1000, height: 667 } },
  { category: 'android-pda', labelKey: 'home.products.pda', image: '/home-products/android-pda.webp', width: 427, height: 640 },
  { category: 'robot-workcells', labelKey: 'home.products.robots', image: '/home-products/robot-workcells.webp', width: 640, height: 512 },
] as const;
