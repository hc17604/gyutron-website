/**
 * Local content adapter (CMS provider = 'local', the default).
 *
 * Delegates the CMS facade to the in-repo data layer (`src/data` + `src/i18n`) so pages can
 * read content through `lib/cms` today and a future headless CMS (Sanity / Strapi / Directus /
 * Payload) can swap in behind the SAME `CmsAdapter` interface without touching any page.
 * Pure / read-only: no side effects, no network, no secrets.
 *
 * Note: page BODIES live in `.astro` components, not the data layer, so `getPageContent`
 * resolves the localized TITLE (from the support/solution registries) and leaves `body` empty;
 * a real CMS adapter would populate `body`.
 */
import { t, type Locale } from '../../i18n';
import type { ProductCatalog, ProductCategory } from '../../types/product';
import type { Solution } from '../../types/solution';
import type { FaqItem } from '../../types/support';
import type { CmsAdapter, PageContent } from './types';
import { getCatalog, getCategory } from '../../data/products';
import { SOLUTIONS, getSolution } from '../../data/solutions';
import { FAQ_ITEMS } from '../../data/faq';
import { getSupportPage } from '../../data/support';

export const localCms: CmsAdapter = {
  async getPageContent(slug: string, locale: Locale): Promise<PageContent | null> {
    const support = getSupportPage(slug);
    if (support) return { slug, title: t(locale, support.titleKey), body: '' };
    const solution = getSolution(slug);
    if (solution) return { slug, title: t(locale, solution.titleKey), body: '' };
    return null;
  },

  async getProducts(locale: Locale): Promise<ProductCatalog> {
    return getCatalog(locale);
  },

  async getProductBySlug(slug: string, locale: Locale): Promise<ProductCategory | null> {
    return getCategory(locale, slug) ?? null;
  },

  // SOLUTIONS is a locale-independent data model (copy is i18n-key-driven); `locale` is
  // accepted for interface parity and a future per-locale CMS backend.
  async getSolutions(_locale: Locale): Promise<Solution[]> {
    return SOLUTIONS;
  },

  async getSolutionBySlug(slug: string, _locale: Locale): Promise<Solution | null> {
    return getSolution(slug) ?? null;
  },

  // FaqItem records carry all locales; the active locale is selected at render time.
  async getFAQItems(_locale: Locale): Promise<FaqItem[]> {
    return FAQ_ITEMS;
  },
};
