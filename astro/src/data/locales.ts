/** Locale list + display metadata, derived from the i18n single source (`src/i18n`). */
import { locales, defaultLocale, localeLabel, localeShort, htmlLang, ogLocale, type Locale } from '../i18n';
import type { LocaleInfo } from '../types/locale';

export { locales, defaultLocale };
export type { Locale };

export const LOCALES: LocaleInfo[] = locales.map((code) => ({
  code,
  label: localeLabel[code],
  short: localeShort[code],
  htmlLang: htmlLang[code],
  ogLocale: ogLocale[code],
}));
