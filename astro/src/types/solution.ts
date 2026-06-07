/**
 * Solution types. A Solution is a render-ready, i18n-KEY-driven data model (the site convention
 * is to reference i18n keys, not inline translated strings — keeps `src/i18n/*` the single source
 * of truth). `src/data/solutions.ts` is the registry; `SolutionPage.astro` renders from it.
 *
 * Backward-compatible: the original meta fields (`slug`, `path`, `titleKey`, `relatedProducts`)
 * are retained; the content fields (`hero`/`tabs`/`sections`/`cta`) are optional so a future
 * solution can start as meta-only.
 */

/** A card inside a solution section. */
export interface SolutionCard {
  /** Font Awesome icon class, e.g. "fa-solid fa-camera-retro". Omitted for architecture cards. */
  icon?: string;
  titleKey: string;
  descKey: string;
}

/** Card layout/markup kind for a section. */
export type SolutionSectionKind = 'capability' | 'architecture' | 'workflow';

export interface SolutionSection {
  /** Anchor id, e.g. "capabilities". */
  id: string;
  /** Extra class on `.solution-section` ("dark" | "alt"); omit for none. */
  variant?: 'dark' | 'alt';
  /** Controls the inner card markup. */
  kind: SolutionSectionKind;
  eyebrowKey: string;
  titleKey: string;
  introKey: string;
  /** Only for kind 'architecture': aria-label key for the `.architecture-visual` block. */
  visualAriaKey?: string;
  cards: SolutionCard[];
}

/** In-page section tab (anchor link). */
export interface SolutionTab {
  /** In-page anchor, e.g. "#capabilities". */
  href: string;
  labelKey: string;
}

export interface SolutionHero {
  eyebrowKey: string;
  /** Hero title — also the page <h1>. */
  titleKey: string;
  descKey: string;
  panel: { labelKey: string; valueKey: string; descKey: string };
}

export interface SolutionCta {
  /** Anchor id for the CTA section, e.g. "deployment". */
  id: string;
  titleKey: string;
  descKey: string;
  buttonKey: string;
  /** Canonical (en) href, localized at render via localizeUrl. */
  href: string;
}

export interface Solution {
  /** URL slug, e.g. "automated-vision-inspection". */
  slug: string;
  /** Canonical (en) path, e.g. "/automated-vision-inspection.html". */
  path: string;
  /** i18n key for the SEO <title>. */
  titleKey: string;
  /** i18n key for the SEO meta description. */
  descKey?: string;
  /** i18n key for the breadcrumb / nav label. */
  breadcrumbKey?: string;
  /** Optional industry / application tags (i18n keys). */
  industryKey?: string;
  applicationKey?: string;
  /** Slugs of related product categories (cross-links / future use). */
  relatedProducts?: string[];
  /** Page content (i18n-key driven, render-ready). Optional → a solution can be meta-only. */
  hero?: SolutionHero;
  tabs?: SolutionTab[];
  sections?: SolutionSection[];
  cta?: SolutionCta;
}
