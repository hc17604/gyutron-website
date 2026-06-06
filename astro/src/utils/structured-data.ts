/**
 * JSON-LD (schema.org) builders. Pure functions returning plain objects to feed
 * `SeoHead`'s `structuredData` prop (object or array). No commerce fields — Products carry
 * only brand / category / description / image (no Offer / price / availability / rating /
 * review), which suits an industrial B2B catalog with no on-page pricing.
 */
import type { Locale } from '../i18n';
import { SITE_NAME } from '../config/site';
import { ORGANIZATION } from '../config/seo';
import { absoluteUrl, canonicalUrl } from './seo';

/** Localized "Home" label for breadcrumb roots (matches SupportPage's visible breadcrumb). */
export const HOME_LABEL: Record<Locale, string> = { en: 'Home', de: 'Startseite', ja: 'ホーム' };

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/** The site-wide Organization node (from config/seo). */
export function createOrganizationJsonLd() {
  return ORGANIZATION;
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** Breadcrumb that starts at the localized Home, then appends the given trail. */
export function breadcrumbFromHome(locale: Locale, trail: BreadcrumbItem[]) {
  return createBreadcrumbJsonLd([{ name: HOME_LABEL[locale], url: canonicalUrl(locale, '/') }, ...trail]);
}

export interface ProductInput {
  name: string;
  description?: string;
  /** Root-relative or absolute image path; normalized to an absolute URL. */
  image?: string;
  category?: string;
}

/** A Product node (no Offer/price/availability/rating — none exist on this site). */
export function createProductJsonLd(p: ProductInput) {
  return {
    '@type': 'Product',
    name: p.name,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(p.category ? { category: p.category } : {}),
    ...(p.description ? { description: p.description } : {}),
    ...(p.image ? { image: absoluteUrl(p.image) } : {}),
  };
}

export interface CollectionInput {
  name: string;
  description?: string;
  url: string;
  products: ProductInput[];
}

/** A CollectionPage with an ItemList of Products — for a product-category page. */
export function createCollectionPageJsonLd(c: CollectionInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: c.name,
    url: c.url,
    ...(c.description ? { description: c.description } : {}),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: c.products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: createProductJsonLd(p),
      })),
    },
  };
}
