/**
 * CMS entry point. Selects an adapter by `integrations.cms.provider` (only 'local'/mock
 * today). Pages should read content through these functions, never a CMS SDK directly.
 */
import { integrations } from '../../config/integrations';
import { mockCms } from './mock-cms';
import type { CmsAdapter } from './types';

function getAdapter(): CmsAdapter {
  switch (integrations.cms.provider) {
    // case 'sanity': return sanityCms; // TODO
    default:
      return mockCms;
  }
}

const cms = getAdapter();

export const getPageContent = (slug: string, locale: string) => cms.getPageContent(slug, locale);
export const getProducts = (locale: string) => cms.getProducts(locale);
export const getProductBySlug = (slug: string, locale: string) => cms.getProductBySlug(slug, locale);
export const getSolutions = (locale: string) => cms.getSolutions(locale);
export const getSolutionBySlug = (slug: string, locale: string) => cms.getSolutionBySlug(slug, locale);
export const getFAQItems = (locale: string) => cms.getFAQItems(locale);
export type { PageContent, CmsAdapter } from './types';
