/**
 * i18n configuration façade. Re-exports the runtime locale config from `src/i18n` so
 * consumers can `import { locales } from '../config/i18n'` without reaching into the i18n
 * implementation. The single source of truth stays `src/i18n/index.ts`.
 */
export {
  locales,
  defaultLocale,
  localeLabel,
  localeShort,
  htmlLang,
  ogLocale,
  langAria,
  type Locale,
} from '../i18n';
