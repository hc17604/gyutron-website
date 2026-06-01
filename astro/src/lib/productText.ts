import type { Locale } from '../i18n';

/**
 * Product card summary. EN uses the real product.summary. de/ja reproduce the
 * legacy generator's generated summary (it ignored product.summary and built a
 * localized blurb from the category + tags) — keeps de/ja free of residual English
 * until/if real per-product summary translations are authored.
 */
export function productSummary(locale: Locale, product: any, cat: any): string {
  if (locale === 'en') return product.summary;
  const hasTags = product.tags && product.tags.length;
  if (locale === 'de') {
    const tags = hasTags ? ` Wichtige Optionen: ${product.tags.join(', ')}.` : '';
    return `Professionelle Modellvariante für ${cat.title}. Ausgelegt für industrielle Beschaffung, Pilotierung und Systemintegration.${tags}`;
  }
  const tags = hasTags ? ` 主なオプション: ${product.tags.join('、')}。` : '';
  return `${cat.title}向けの業務用モデルです。産業用途での調達、評価、システム統合を前提に構成されています。${tags}`;
}
