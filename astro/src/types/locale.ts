/**
 * Locale types. The runtime list/labels live in `src/i18n/index.ts` (single source);
 * this file only re-exports the type and describes locale metadata.
 */
import type { Locale } from '../i18n';

export type { Locale };

/** Display metadata for one locale (label, html lang, og locale). */
export interface LocaleInfo {
  code: Locale;
  /** Autonym shown in the language switcher, e.g. "Deutsch". */
  label: string;
  /** Short code shown in compact UI, e.g. "DE". */
  short: string;
  /** `<html lang>` value. */
  htmlLang: string;
  /** Open Graph locale, e.g. "de_DE". */
  ogLocale: string;
}
