/**
 * Solution types. Solutions are currently rendered from i18n keys by `SolutionPage.astro`;
 * `src/data/solutions.ts` describes the catalog of solution pages.
 */

export interface Solution {
  /** URL slug, e.g. "automated-vision-inspection". */
  slug: string;
  /** Canonical path, e.g. "/automated-vision-inspection.html". */
  path: string;
  /** i18n key for the solution title. */
  titleKey: string;
  /** Optional industry / application tags (i18n keys). */
  industryKey?: string;
  applicationKey?: string;
  /** Slugs of related product categories (cross-links). */
  relatedProducts?: string[];
}
