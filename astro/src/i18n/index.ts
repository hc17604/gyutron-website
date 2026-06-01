import en from './en.json';
import de from './de.json';
import ja from './ja.json';

export const locales = ['en', 'de', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const dicts: Record<Locale, Record<string, string>> = { en, de, ja };

/**
 * Look up a translation by semantic key. Throws on a missing key so the build
 * fails loudly instead of silently shipping English (mirrors build_i18n --check).
 * Translations are reused verbatim from the previous pipeline's audited dictionary.
 */
export function t(locale: Locale, key: string): string {
  const value = dicts[locale]?.[key];
  if (value === undefined) {
    throw new Error(`[i18n] missing key "${key}" for locale "${locale}"`);
  }
  return value;
}

/** Locale-prefixed absolute URL. en: /path · de: /de/path · ja: /ja/path */
export function localizeUrl(locale: Locale, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return locale === defaultLocale ? p : `/${locale}${p}`;
}

/** The same page under every locale, for the language switcher. */
export function localeAlternates(path: string): { locale: Locale; url: string; label: string; short: string; current: boolean }[] {
  return locales.map((l) => ({ locale: l, url: localizeUrl(l, path), label: localeLabel[l], short: localeShort[l], current: false }));
}

export const ogLocale: Record<Locale, string> = { en: 'en_US', de: 'de_DE', ja: 'ja_JP' };
export const htmlLang: Record<Locale, string> = { en: 'en', de: 'de', ja: 'ja' };
export const localeLabel: Record<Locale, string> = { en: 'English', de: 'Deutsch', ja: '日本語' };
export const localeShort: Record<Locale, string> = { en: 'EN', de: 'DE', ja: 'JA' };

/** aria labels for the language switcher, per active locale (from the legacy LANGUAGE_ARIA). */
export const langAria: Record<Locale, { selector: string; options: string }> = {
  en: { selector: 'Language and region selector', options: 'Language options' },
  de: { selector: 'Sprache und Region auswählen', options: 'Sprachoptionen' },
  ja: { selector: '言語と地域を選択', options: '言語オプション' },
};
