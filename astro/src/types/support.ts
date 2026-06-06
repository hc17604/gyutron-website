/**
 * Support-center types: the support page registry and FAQ data model.
 */

/** Metadata for one support/legal page (FAQ, warranty, shipping, privacy, terms…). */
export interface SupportPageMeta {
  /** URL slug, e.g. "faq". */
  slug: string;
  /** Canonical path, e.g. "/support/faq.html". */
  path: string;
  /** i18n key for the nav/title label. */
  titleKey: string;
  /** True for legal pages (privacy/terms) vs. operational support pages. */
  legal?: boolean;
}

/** A FAQ category groups related questions, e.g. "Products & Compatibility". */
export interface FaqCategory {
  id: string;
  /** i18n key, or plain label for the category heading. */
  titleKey?: string;
  title?: string;
}

/**
 * A single FAQ item. The question/answer currently live as hardcoded markup in the
 * `support/faq.astro` pages; the data-driven target stores them either as i18n keys
 * (`questionKey`/`answerKey`) or inline reference text — see `src/data/faq.ts`.
 */
export interface FaqItem {
  id: string;
  /** Category id this item belongs to (see FaqCategory). */
  category: string;
  questionKey?: string;
  answerKey?: string;
  /** Reference English text (used until per-locale keys are populated). */
  question?: string;
  answer?: string;
}
