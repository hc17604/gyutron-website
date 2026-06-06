/**
 * Solution pages. Currently one live solution (rendered from i18n keys by
 * `SolutionPage.astro`); structured here for future expansion (Vision Inspection,
 * Vision-Guided Robotics, Warehouse Automation, Factory Automation, …).
 */
import type { Solution } from '../types/solution';

export const SOLUTIONS: Solution[] = [
  {
    slug: 'automated-vision-inspection',
    path: '/automated-vision-inspection.html',
    titleKey: 'seo.automated-vision-inspection.title',
    relatedProducts: ['area-scan-cameras', 'code-reading-cameras', 'smart-vision-sensors'],
  },
];

export function getSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}
