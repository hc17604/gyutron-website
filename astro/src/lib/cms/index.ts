/**
 * CMS entry point. Selects an adapter by `integrations.cms.provider`. Today only the local
 * adapter exists (provider 'local', the default), which delegates to `src/data`. To add a real
 * headless CMS: implement a new adapter against `CmsAdapter`, add a `case` below, and set the
 * `CMS_PROVIDER` env var. Pages should read content through these functions, never a CMS SDK.
 */
import type { Locale } from '../../i18n';
import { integrations } from '../../config/integrations';
import { localCms } from './local-cms';
import type { CmsAdapter } from './types';

function getAdapter(): CmsAdapter {
  switch (integrations.cms.provider) {
    // case 'sanity': return sanityCms;   // TODO: implement sanity-cms.ts, then set CMS_PROVIDER=sanity
    case 'local':
    default:
      return localCms;
  }
}

const cms = getAdapter();

export const getPageContent = (slug: string, locale: Locale) => cms.getPageContent(slug, locale);
export const getProducts = (locale: Locale) => cms.getProducts(locale);
export const getProductBySlug = (slug: string, locale: Locale) => cms.getProductBySlug(slug, locale);
export const getSolutions = (locale: Locale) => cms.getSolutions(locale);
export const getSolutionBySlug = (slug: string, locale: Locale) => cms.getSolutionBySlug(slug, locale);
export const getFAQItems = (locale: Locale) => cms.getFAQItems(locale);
export type { PageContent, CmsAdapter } from './types';
