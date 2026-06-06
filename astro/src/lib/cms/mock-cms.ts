/**
 * Placeholder CMS. The site currently renders from local data (`src/data` + `src/i18n`),
 * so these return empty/placeholder results. TODO: delegate to `src/data` (products,
 * solutions, faq) so a future CMS can swap in behind the same interface.
 */
import type { CmsAdapter, PageContent } from './types';

export const mockCms: CmsAdapter = {
  async getPageContent(slug: string): Promise<PageContent | null> {
    return { slug, title: '', body: '' };
  },
  async getProducts(): Promise<unknown[]> {
    return [];
  },
  async getProductBySlug(): Promise<unknown | null> {
    return null;
  },
  async getSolutions(): Promise<unknown[]> {
    return [];
  },
  async getSolutionBySlug(): Promise<unknown | null> {
    return null;
  },
  async getFAQItems(): Promise<unknown[]> {
    return [];
  },
};
