import { CORE_EXTRA_LOCALES } from './core-extra-locales.mjs';
import { QUOTE_EXTRA_LOCALES } from './quote-extra-locales.mjs';
import { EXTENSION_CORE } from './extension-locales.mjs';
import { WORKBENCH_ERRORS } from './extension-errors.mjs';

const scriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
/** Public static translations contain no business records or identity data. */
const core=Object.fromEntries(['en','zh','de','ja'].map(lang=>[lang,{...CORE_EXTRA_LOCALES[lang],...EXTENSION_CORE[lang]}]));
export const ADMIN_LOCALE_CLIENT = `export const CORE_EXTRA_LOCALES=${scriptJson(core)};\nexport const QUOTE_EXTRA_LOCALES=${scriptJson(QUOTE_EXTRA_LOCALES)};\nexport const WORKBENCH_ERRORS=${scriptJson(WORKBENCH_ERRORS)};\n`;
