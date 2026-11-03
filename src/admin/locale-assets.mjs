import { CORE_EXTRA_LOCALES } from './core-extra-locales.mjs';
import { QUOTE_EXTRA_LOCALES } from './quote-extra-locales.mjs';

const scriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
/** Public static translations contain no business records or identity data. */
export const ADMIN_LOCALE_CLIENT = `export const CORE_EXTRA_LOCALES=${scriptJson(CORE_EXTRA_LOCALES)};\nexport const QUOTE_EXTRA_LOCALES=${scriptJson(QUOTE_EXTRA_LOCALES)};\n`;
