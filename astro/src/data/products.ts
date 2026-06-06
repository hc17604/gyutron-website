/**
 * Typed accessor over the per-locale product catalogs. The data files
 * `products.{en,de,ja}.js` are kept SEPARATE on purpose — they drive build-time per-locale
 * pages and `tools/i18n-audit.py`. This module does NOT merge them; it just gives typed,
 * locale-aware access so consumers (and a future CMS adapter) don't reach into the raw files.
 */
import type { Locale } from '../i18n';
import type { ProductCatalog, ProductCategory, Product } from '../types/product';
import { GYUTRON_PRODUCTS as EN } from './products.en.js';
import { GYUTRON_PRODUCTS as DE } from './products.de.js';
import { GYUTRON_PRODUCTS as JA } from './products.ja.js';

const CATALOGS: Record<Locale, ProductCatalog> = {
  en: EN as unknown as ProductCatalog,
  de: DE as unknown as ProductCatalog,
  ja: JA as unknown as ProductCatalog,
};

/** The whole catalog for a locale. */
export function getCatalog(locale: Locale): ProductCatalog {
  return CATALOGS[locale];
}

/** One category, or undefined if the slug is unknown. */
export function getCategory(locale: Locale, slug: string): ProductCategory | undefined {
  return CATALOGS[locale][slug];
}

/** All category slugs (locale-independent — the route set comes from en). */
export function getCategorySlugs(): string[] {
  return Object.keys(EN as unknown as ProductCatalog);
}

/** The products in a category (empty array for redirect/unknown categories). */
export function getProducts(locale: Locale, slug: string): Product[] {
  return getCategory(locale, slug)?.products ?? [];
}
