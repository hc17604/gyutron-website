// Build-time site search index (per locale). Consumed by the `search-index.json` endpoints,
// fetched once on the client by nav-search.js. Static — no backend.
// Records: { t: title, u: url (localized), k: kind/type label, d: extra searchable text }.
import { localizeUrl, type Locale } from '../i18n';
import { getCatalog } from '../data/products';
import { NEWS } from '../data/news';

export type SearchRecord = { t: string; u: string; k: string; d: string; i?: string; c?: 1 };

const CAT_LABEL: Record<Locale, string> = { en: 'Product category', de: 'Produktkategorie', ja: '製品カテゴリ' };
const NEWS_LABEL: Record<Locale, string> = { en: 'News', de: 'Nachrichten', ja: 'ニュース' };
/** Ensure an image path is absolute from the public root (product data uses relative paths). */
const img = (s?: string): string => (s ? (s[0] === '/' ? s : '/' + s) : '');

// Curated non-product pages (homepage sections are reachable from the home page; legal pages omitted
// as low search value). URLs are localized in buildSearchIndex().
const PAGES: Record<Locale, SearchRecord[]> = {
  en: [
    { t: 'Automated Vision Inspection', u: '/automated-vision-inspection.html', k: 'Solution', d: 'Turnkey automated optical inspection cells and machine-vision integration for production lines.', i: '/product-vision-cell.png', c: 1 },
    { t: 'Contact Sales', u: '/contact-sales.html', k: 'Contact', d: 'Talk to the GYUTRON team about products, pilots, integration, and quotes.' },
    { t: 'Support', u: '/support.html', k: 'Support', d: 'Documentation, warranty, shipping and delivery, and technical support.' },
    { t: 'FAQ', u: '/support/faq.html', k: 'Support', d: 'Frequently asked questions about products, ordering, and support.' },
    { t: 'Warranty', u: '/support/warranty.html', k: 'Support', d: 'Product warranty terms and coverage.' },
    { t: 'Shipping & Delivery', u: '/support/shipping-delivery.html', k: 'Support', d: 'Shipping options, lead times, and delivery information.' },
  ],
  de: [
    { t: 'Automatisierte Bildverarbeitungs-Inspektion', u: '/automated-vision-inspection.html', k: 'Lösung', d: 'Schlüsselfertige automatisierte optische Prüfzellen und Machine-Vision-Integration für Produktionslinien.', i: '/product-vision-cell.png', c: 1 },
    { t: 'Vertrieb kontaktieren', u: '/contact-sales.html', k: 'Kontakt', d: 'Sprechen Sie mit dem GYUTRON-Team über Produkte, Pilotprojekte, Integration und Angebote.' },
    { t: 'Support', u: '/support.html', k: 'Support', d: 'Dokumentation, Garantie, Versand und Lieferung sowie technischer Support.' },
    { t: 'FAQ', u: '/support/faq.html', k: 'Support', d: 'Häufig gestellte Fragen zu Produkten, Bestellung und Support.' },
    { t: 'Garantie', u: '/support/warranty.html', k: 'Support', d: 'Garantiebedingungen und Abdeckung der Produkte.' },
    { t: 'Versand & Lieferung', u: '/support/shipping-delivery.html', k: 'Support', d: 'Versandoptionen, Lieferzeiten und Lieferinformationen.' },
  ],
  ja: [
    { t: '自動外観検査', u: '/automated-vision-inspection.html', k: 'ソリューション', d: '生産ライン向けのターンキー自動光学検査セルとマシンビジョン統合。', i: '/product-vision-cell.png', c: 1 },
    { t: '営業へのお問い合わせ', u: '/contact-sales.html', k: 'お問い合わせ', d: '製品・実証・統合・お見積もりについて GYUTRON チームにご相談ください。' },
    { t: 'サポート', u: '/support.html', k: 'サポート', d: 'ドキュメント、保証、配送・お届け、技術サポート。' },
    { t: 'よくある質問', u: '/support/faq.html', k: 'サポート', d: '製品・ご注文・サポートに関するよくある質問。' },
    { t: '保証', u: '/support/warranty.html', k: 'サポート', d: '製品の保証条件と適用範囲。' },
    { t: '配送・お届け', u: '/support/shipping-delivery.html', k: 'サポート', d: '配送オプション、リードタイム、お届け情報。' },
  ],
};

export function buildSearchIndex(locale: Locale): SearchRecord[] {
  const data: any = getCatalog(locale);
  const out: SearchRecord[] = [];
  for (const p of PAGES[locale]) out.push({ ...p, u: localizeUrl(locale, p.u) });
  // News — render as cards linking to their /news/<slug> article page.
  for (const n of NEWS) {
    out.push({ t: n.title[locale], u: localizeUrl(locale, n.href || '/news.html'), k: NEWS_LABEL[locale], d: n.excerpt[locale], i: img(n.image), c: 1 });
  }
  for (const slug of Object.keys(data)) {
    const cat = data[slug];
    if (!cat || !Array.isArray(cat.products) || cat.products.length === 0) continue; // skip redirect/empty categories
    const url = localizeUrl(locale, `/${slug}.html`);
    out.push({ t: cat.title, u: url, k: CAT_LABEL[locale], d: cat.intro || cat.panelText || '', i: img(cat.heroImage), c: 1 });
    for (const prod of cat.products) {
      const kw = [prod.summary, ...(prod.tags || []), ...Object.values(prod.specs || {})].filter(Boolean).join(' ');
      out.push({ t: prod.name, u: url, k: prod.type || CAT_LABEL[locale], d: kw, i: img(prod.image), c: 1 });
    }
  }
  return out;
}
