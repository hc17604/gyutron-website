/**
 * Site-level types: global config, navigation tree, company info.
 * Text is referenced by i18n key (`labelKey`) to stay translation-driven, matching the
 * site convention; use `label` only for language-neutral strings.
 */
import type { Locale } from '../i18n';

/** Centralized site constants (see `src/config/site.ts`). */
export interface SiteConfig {
  /** Canonical origin, e.g. "https://www.gyutron.com". */
  url: string;
  /** Brand name, e.g. "GYUTRON". */
  name: string;
  defaultLocale: Locale;
  locales: readonly Locale[];
}

/** A single navigation link. `labelKey` is an i18n key; `href` is a canonical path. */
export interface NavLink {
  labelKey?: string;
  /** Language-neutral label, when not translated (rare). */
  label?: string;
  href?: string;
  /** Optional nested links (mega-menu submenu / footer column). */
  children?: NavLink[];
  /** Optional background image for mega-menu panels. */
  image?: string;
}

/** A labelled group of links (mega-menu column or footer column). */
export interface NavGroup {
  labelKey?: string;
  label?: string;
  links: NavLink[];
}

/** A top-level navigation entry (e.g. Products, Solutions). */
export interface NavItem {
  labelKey?: string;
  label?: string;
  href?: string;
  /** Mega-menu contents, when this item opens a panel. */
  groups?: NavGroup[];
}

export interface SocialLink {
  /** Platform id, e.g. "linkedin". */
  platform: string;
  label: string;
  /** Empty string = placeholder (icon shown, not yet linked). */
  href: string;
}

/** One company office (label + address are i18n keys; rendered by CompanyAddresses). */
export interface Office {
  labelKey: string;
  addrKey: string;
}

/** Language-neutral company facts (see `src/data/company.ts`). */
export interface CompanyInfo {
  name: string;
  email: string;
  whatsapp: string;
  shopUrl: string;
  offices: Office[];
  socials: SocialLink[];
}
