/**
 * Support-center types: the support page registry and FAQ data model.
 */
import type { Locale } from '../i18n';

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
  /** Localized category heading. */
  title: Record<Locale, string>;
}

/**
 * A single FAQ item, locale-aware. `answer` is inline HTML (it may contain localized
 * `<a>` links), so it is rendered with `set:html` in `FaqList.astro`. Data lives in
 * `src/data/faq.ts` (extracted verbatim from the former per-locale `support/faq.astro`).
 */
export interface FaqItem {
  id: string;
  /** Category id this item belongs to (see FaqCategory). */
  category: string;
  /** Localized question (plain text). */
  question: Record<Locale, string>;
  /** Localized answer as inline HTML. */
  answer: Record<Locale, string>;
}
