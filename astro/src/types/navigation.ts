/**
 * Header mega-menu navigation model.
 *
 * This is the data contract behind the desktop Header (`components/navigation/*`) and,
 * transitively, the mobile drawer (`public/mobile-navigation.js` clones the rendered
 * desktop DOM by CSS selector). The shape mirrors the *exact* DOM the header emits — it is
 * deliberately faithful to the real markup rather than "tidy", because the rendered class
 * names, nesting, and order are a hard contract (see docs/COMPONENTS.md "Header navigation").
 *
 * Concretely, one `.mega-menu` panel contains:
 *   [optional] `.mega-feature` hero link  →  `MegaFeature`
 *   `.mega-links` whose flat children are, in order:
 *     `.mega-section-label` + the `.mega-link-group`s that follow it  →  `MegaMenuSection`
 *     [optional] trailing bare `<a>` (no `.mega-link` class, no submenu)  →  `extraLinks`
 *
 * Text is referenced by i18n key (`*Key`) exactly where the markup uses `t(locale, …)`.
 * A handful of labels are language-neutral literals in the markup (e.g. "FAQ"); those use
 * `titleText` instead of `titleKey`. Do NOT translate model names (GY-*) or invent keys.
 */

/** Full = standard wide panel; compact = `.mega-compact` (narrower, no hero feature). */
export type MegaMenuVariant = 'standard' | 'compact';

/** A single submenu (tertiary) link: `<a href><strong>…</strong><span>…</span></a>`. */
export interface MegaSubmenuLink {
  href: string;
  /** i18n key for the bold label. Mutually exclusive with `titleText`. */
  titleKey?: string;
  /** Language-neutral bold label (e.g. "FAQ"), when the markup hard-codes it. */
  titleText?: string;
  /** i18n key for the muted description span. Omit for a title-only link (e.g. industry coverage chips). */
  descKey?: string;
}

/** The flyout panel under a `.mega-link` (`.submenu`, optionally `.submenu--intro`). */
export interface MegaSubmenu {
  /** `.submenu--intro` variant: a single intro link, no tertiary list. */
  intro?: boolean;
  /** Background image path for `--submenu-image` (keep any `?v=` cache-buster). */
  image: string;
  /** Optional i18n key for a short intro/blurb paragraph rendered under the banner (full width). */
  blurbKey?: string;
  links: MegaSubmenuLink[];
}

/** The primary `.mega-link` anchor of a `.mega-link-group`. */
export interface MegaLink {
  href: string;
  titleKey: string;
  descKey: string;
}

/** One `.mega-link-group`: a primary `.mega-link` plus its `.submenu`. */
export interface MegaLinkGroup {
  link: MegaLink;
  submenu: MegaSubmenu;
}

/** A `.mega-section-label` and the `.mega-link-group`s rendered after it. */
export interface MegaMenuSection {
  labelKey: string;
  groups: MegaLinkGroup[];
}

/** The optional `.mega-feature` hero link (standard panels only). */
export interface MegaFeature {
  /** Second class after `mega-feature`, e.g. `mega-feature-products`. */
  modifier: string;
  href: string;
  titleKey: string;
  descKey: string;
}

/** One `.mega-menu` panel. */
export interface MegaMenu {
  variant: MegaMenuVariant;
  /** Background image path for `--menu-overview-image` (keep any `?v=` cache-buster). */
  overviewImage: string;
  feature?: MegaFeature;
  sections: MegaMenuSection[];
  /**
   * Trailing bare `<a>` children of `.mega-links` that are NOT in a section/group and have
   * no submenu (currently just one, under Solutions). Rendered after all sections.
   */
  extraLinks?: MegaLink[];
}

/** A top-level header entry: the `.nav-trigger` plus its `.mega-menu`. */
export interface HeaderNavItem {
  /** `.nav-trigger` href (canonical path; localized at render time). */
  triggerHref: string;
  /** i18n key for the trigger label. */
  labelKey: string;
  menu: MegaMenu;
}
