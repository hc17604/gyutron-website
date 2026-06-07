/**
 * CMS adapter contract. The local adapter (`local-cms.ts`) delegates to `src/data`; a future
 * headless CMS (Sanity, Strapi, Directus, Payload…) implements this SAME interface so pages
 * never change. Return types are the in-repo data-model types so callers stay type-safe.
 */
import type { Locale } from '../../i18n';
import type { ProductCatalog, ProductCategory } from '../../types/product';
import type { Solution } from '../../types/solution';
import type { FaqItem } from '../../types/support';

/**
 * Minimal page-content record. Page bodies live in `.astro` components (not the data layer),
 * so the local adapter returns the localized `title` with an empty `body`; a real CMS would
 * populate `body`.
 */
export interface PageContent {
  slug: string;
  title: string;
  body: string;
}

export interface CmsAdapter {
  /** Localized page metadata for a known support/solution slug, else null. */
  getPageContent(slug: string, locale: Locale): Promise<PageContent | null>;
  /** The full product catalog (category slug → category) for a locale. */
  getProducts(locale: Locale): Promise<ProductCatalog>;
  /** One product category by slug, or null if unknown. */
  getProductBySlug(slug: string, locale: Locale): Promise<ProductCategory | null>;
  /** All solution entries (data model; copy is i18n-key-driven). */
  getSolutions(locale: Locale): Promise<Solution[]>;
  /** One solution by slug, or null if unknown. */
  getSolutionBySlug(slug: string, locale: Locale): Promise<Solution | null>;
  /** All FAQ items (locale-aware records; locale selected at render time). */
  getFAQItems(locale: Locale): Promise<FaqItem[]>;
}
