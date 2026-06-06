/**
 * CMS adapter contract. A future headless CMS (Sanity, Strapi, Directus…) implements this.
 * Return types are intentionally loose (`unknown[]`) for now; tighten to the `src/data`
 * model types when the data layer is wired in.
 */
export interface PageContent {
  slug: string;
  title: string;
  body: string;
}

export interface CmsAdapter {
  getPageContent(slug: string, locale: string): Promise<PageContent | null>;
  getProducts(locale: string): Promise<unknown[]>;
  getProductBySlug(slug: string, locale: string): Promise<unknown | null>;
  getSolutions(locale: string): Promise<unknown[]>;
  getSolutionBySlug(slug: string, locale: string): Promise<unknown | null>;
  getFAQItems(locale: string): Promise<unknown[]>;
}
