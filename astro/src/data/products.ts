/**
 * Typed accessor over the per-locale product catalogs. The data files
 * `products.{en,de,ja}.js` are kept SEPARATE on purpose — they drive build-time per-locale
 * pages and `tools/i18n-audit.py`. This module does NOT merge them; it just gives typed,
 * locale-aware access so consumers (and a future CMS adapter) don't reach into the raw files.
 */
import type { Locale } from '../i18n';
import type { ProductCatalog, ProductCategory, Product } from '../types/product';
import { GYUTRON_PRODUCTS as EN, CATEGORY_GROUPS as EN_GROUPS } from './products.en.js';
import { GYUTRON_PRODUCTS as DE, CATEGORY_GROUPS as DE_GROUPS } from './products.de.js';
import { GYUTRON_PRODUCTS as JA, CATEGORY_GROUPS as JA_GROUPS } from './products.ja.js';

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

/** Per-locale CATEGORY_GROUPS (nav-group key → ordered category slugs). */
const CATEGORY_GROUPS_BY_LOCALE: Record<Locale, Record<string, string[]>> = {
  en: EN_GROUPS as unknown as Record<string, string[]>,
  de: DE_GROUPS as unknown as Record<string, string[]>,
  ja: JA_GROUPS as unknown as Record<string, string[]>,
};

/** The category-group ordering map for a locale (the product page's category nav uses it). */
export function getCategoryGroups(locale: Locale): Record<string, string[]> {
  return CATEGORY_GROUPS_BY_LOCALE[locale];
}

/**
 * Curated product options for the Contact Sales form's <select> — a SUBSET (product
 * families), NOT every product. Each links a real category slug to its existing nav-label
 * i18n key, so the visible option text is unchanged while the list lives in one place and
 * stays tied to the catalog. The "Select one" placeholder and the trailing "OEM / ODM
 * Cooperation" option are rendered in ContactSales.astro (they are not catalog categories).
 */
export const CONTACT_PRODUCT_OPTIONS: { category: string; labelKey: string }[] = [
  { category: 'android-pda', labelKey: 'main.007' },
  { category: 'proximity-sensors', labelKey: 'main.017' },
  { category: 'area-scan-cameras', labelKey: 'main.025' },
  { category: 'dimensional-gauges', labelKey: 'main.034' },
  { category: 'robot-workcells', labelKey: 'main.045' },
  { category: 'edge-controllers', labelKey: 'main.047' },
];
