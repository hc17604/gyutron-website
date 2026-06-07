/**
 * Newsroom types. A NewsItem is locale-aware content (Record<Locale,string>, like FAQ) so an editor
 * adds a post in ONE file with all three languages. Data lives in `src/data/news.ts`; the homepage
 * "Latest from GYUTRON" section renders the latest few. A future `/news/` index + article pages can
 * consume the same data (and a CMS adapter later — see lib/cms).
 */
import type { Locale } from '../i18n';

export interface NewsItem {
  /** Stable id. */
  id: string;
  /** URL slug (for a future /news/<slug> article page). */
  slug: string;
  /** ISO date 'YYYY-MM-DD' (used for sorting + display). */
  date: string;
  /** Short category label, localized (e.g. Products / Company / OEM). */
  category: Record<Locale, string>;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  /** Public image path (e.g. "/product-hero-...png"); omit/'' → a placeholder block renders. */
  image?: string;
  /** Article URL. OMIT until the /news article page exists (so no dead links are rendered). */
  href?: string;
}
