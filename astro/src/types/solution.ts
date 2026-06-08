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

/** A quantified KPI shown in the hero strip. value/label are plain (technical/numeric) strings —
 * specs/units read the same across locales, so they intentionally bypass the i18n dictionaries. */
export interface SolutionKpi {
  value: string;
  label: string;
}

export interface SolutionHero {
  eyebrowKey: string;
  /** Hero title — also the page <h1>. */
  titleKey: string;
  descKey: string;
  panel: { labelKey: string; valueKey: string; descKey: string };
  /** Optional quantified KPI strip (competitor-standard: lead with numbers). Plain strings. */
  kpis?: SolutionKpi[];
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

/** One captured-image sample in the "Sample results" gallery (the real-image proof competitors lead
 * with — ViTrox's Good/Dented/Crack, OPT's Original/Result). `image` omitted → a schematic placeholder
 * cell renders so the gallery reads correctly until a real capture is dropped in (Codex/user). */
export interface SolutionShot {
  image?: string;
  captionKey: string;
  /** Small corner tag, e.g. "Good" / "Defect" / "Result" (i18n key). */
  tagKey?: string;
}

export interface SolutionGallery {
  eyebrowKey: string;
  titleKey: string;
  introKey: string;
  shots: SolutionShot[];
}

/** A compact case card in the "Representative deployments" showcase row (industry + result + image). */
export interface SolutionCaseCard {
  image?: string;
  /** Industry / segment tag, e.g. "Electronics / SMT" (i18n key). */
  tagKey: string;
  /** Result-led headline (i18n key). */
  titleKey: string;
  /** Optional hard outcome line, e.g. "≥99.5% catch · 100% inline" (i18n key). */
  metricKey?: string;
}

export interface SolutionCases {
  eyebrowKey: string;
  titleKey: string;
  introKey: string;
  items: SolutionCaseCard[];
}

/** A concrete deployed example (named industry + challenge/result) — proof, not generic copy. */
export interface SolutionCaseStudy {
  eyebrowKey: string;
  titleKey: string;
  /** Optional photo (placeholder if omitted). */
  image?: string;
  /** Challenge / Approach / Result rows (label + value i18n keys). */
  points: { labelKey: string; valueKey: string }[];
  quoteKey?: string;
  attributionKey?: string;
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
  /** Slugs of related product categories. Rendered as the "Products used in this solution" grid
   * (cross-links to the category pages with their images) — set on a solution to show that section. */
  relatedProducts?: string[];
  /** Optional placeholder background images (paths under public/). Fall back to the CSS defaults.
   * `heroImage` = the hero band; `archImage` = the architecture-visual block. Codex swaps these later. */
  heroImage?: string;
  archImage?: string;
  /** Page content (i18n-key driven, render-ready). Optional → a solution can be meta-only. */
  hero?: SolutionHero;
  tabs?: SolutionTab[];
  /** "Sample results" captured-image gallery (real-image proof). Renders after the hero. */
  gallery?: SolutionGallery;
  sections?: SolutionSection[];
  /** "Representative deployments" showcase — a row of compact case cards (concrete proof). */
  cases?: SolutionCases;
  /** A named deployed case study (concrete proof). Renders before "Products used". */
  caseStudy?: SolutionCaseStudy;
  cta?: SolutionCta;
}
