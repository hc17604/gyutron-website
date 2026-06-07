/**
 * Solution pages registry. Each entry is an i18n-key-driven, render-ready Solution (see
 * `types/solution.ts`); `SolutionPage.astro` renders the page from this model, and the sitemap
 * derives solution URLs from `solutionPaths()`. To add a solution, add an entry here + its
 * `seo.<slug>.title`/`.desc` i18n keys + the `pages/<slug>.astro` (+ de/ + ja/) wrappers + a nav
 * link. See docs/SOLUTIONS_GUIDE.md.
 *
 * Today one live solution (automated-vision-inspection), modeled faithfully from the existing page.
 */
import type { Solution } from '../types/solution';

export const SOLUTIONS: Solution[] = [
  {
    slug: 'automated-vision-inspection',
    path: '/automated-vision-inspection.html',
    titleKey: 'seo.automated-vision-inspection.title',
    descKey: 'seo.automated-vision-inspection.desc',
    breadcrumbKey: 'main.055',
    relatedProducts: ['area-scan-cameras', 'code-reading-cameras', 'smart-vision-sensors'],
    hero: {
      eyebrowKey: 'main.269',
      titleKey: 'main.055',
      descKey: 'main.270',
      panel: { labelKey: 'main.271', valueKey: 'main.408', descKey: 'main.272' },
    },
    tabs: [
      { href: '#capabilities', labelKey: 'main.273' },
      { href: '#architecture', labelKey: 'main.274' },
      { href: '#workflow', labelKey: 'main.275' },
      { href: '#deployment', labelKey: 'main.276' },
    ],
    sections: [
      {
        id: 'capabilities',
        kind: 'capability',
        eyebrowKey: 'main.277',
        titleKey: 'main.278',
        introKey: 'main.279',
        cards: [
          { icon: 'fa-solid fa-camera-retro', titleKey: 'main.057', descKey: 'main.280' },
          { icon: 'fa-solid fa-barcode', titleKey: 'main.030', descKey: 'main.281' },
          { icon: 'fa-solid fa-ruler-combined', titleKey: 'main.061', descKey: 'main.282' },
          { icon: 'fa-solid fa-robot', titleKey: 'main.063', descKey: 'main.283' },
        ],
      },
      {
        id: 'architecture',
        variant: 'dark',
        kind: 'architecture',
        eyebrowKey: 'main.284',
        titleKey: 'main.285',
        introKey: 'main.286',
        visualAriaKey: 'main.287',
        cards: [
          { titleKey: 'main.288', descKey: 'main.289' },
          { titleKey: 'main.290', descKey: 'main.291' },
          { titleKey: 'main.292', descKey: 'main.293' },
          { titleKey: 'main.294', descKey: 'main.295' },
        ],
      },
      {
        id: 'workflow',
        variant: 'alt',
        kind: 'workflow',
        eyebrowKey: 'main.296',
        titleKey: 'main.297',
        introKey: 'main.298',
        cards: [
          { icon: 'fa-solid fa-list-check', titleKey: 'main.299', descKey: 'main.300' },
          { icon: 'fa-solid fa-sitemap', titleKey: 'main.409', descKey: 'main.301' },
          { icon: 'fa-solid fa-chart-line', titleKey: 'main.302', descKey: 'main.303' },
        ],
      },
    ],
    cta: {
      id: 'deployment',
      titleKey: 'main.304',
      descKey: 'main.305',
      buttonKey: 'main.256',
      href: '/contact-sales.html',
    },
  },
];

/** One solution by slug, or undefined. */
export function getSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}

/** Canonical (en) paths of all solution pages — used by the sitemap. */
export function solutionPaths(): string[] {
  return SOLUTIONS.map((s) => s.path);
}
