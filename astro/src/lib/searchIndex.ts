// Build-time site search index (per locale). Consumed by the `search-index.json` endpoints,
// fetched once on the client by nav-search.js. Static — no backend.
// Records: { t: title, u: url (localized), k: kind/type label, d: extra searchable text }.
import { localizeUrl, t, type Locale } from '../i18n';
import { getCatalog } from '../data/products';
import { NEWS } from '../data/news';
import { SOLUTIONS } from '../data/solutions';

// c:1 → render as an image card. f:1 → render as a full-width "feature" long card pinned above the
// product grid (categories / solutions / news — i.e. the non-product, image-bearing results).
export type SearchRecord = { t: string; u: string; k: string; d: string; i?: string; c?: 1; f?: 1 };

const CAT_LABEL: Record<Locale, string> = { en: 'Product category', de: 'Produktkategorie', ja: '製品カテゴリ' };
const NEWS_LABEL: Record<Locale, string> = { en: 'News', de: 'Nachrichten', ja: 'ニュース' };
const SOL_LABEL: Record<Locale, string> = { en: 'Solution', de: 'Lösung', ja: 'ソリューション' };
/** Ensure an image path is absolute from the public root (product data uses relative paths). */
const img = (s?: string): string => (s ? (s[0] === '/' ? s : '/' + s) : '');

// Curated non-product pages (homepage sections are reachable from the home page; legal pages omitted
// as low search value). URLs are localized in buildSearchIndex().
const PAGES: Record<Locale, SearchRecord[]> = {
  en: [
    { t: 'Contact Sales', u: '/contact-sales.html', k: 'Contact', d: 'Talk to the GYUTRON team about products, pilots, integration, and quotes.' },
    { t: 'Request a Quote', u: '/request-quote.html', k: 'Contact', d: 'Request pricing and engineering recommendations for your application.' },
    { t: 'Support', u: '/support.html', k: 'Support', d: 'Documentation, warranty, shipping and delivery, and technical support.' },
    { t: 'Contact Support', u: '/support/contact.html', k: 'Support', d: 'Open a technical support request for your GYUTRON hardware.' },
    { t: 'Download Request', u: '/resources/download-request.html', k: 'Resources', d: 'Request datasheets, manuals, certificates, and application notes.' },
    { t: 'FAQ', u: '/support/faq.html', k: 'Support', d: 'Frequently asked questions about products, ordering, and support.' },
    { t: 'Warranty', u: '/support/warranty.html', k: 'Support', d: 'Product warranty terms and coverage.' },
    { t: 'Shipping & Delivery', u: '/support/shipping-delivery.html', k: 'Support', d: 'Shipping options, lead times, and delivery information.' },
  ],
  de: [
    { t: 'Vertrieb kontaktieren', u: '/contact-sales.html', k: 'Kontakt', d: 'Sprechen Sie mit dem GYUTRON-Team über Produkte, Pilotprojekte, Integration und Angebote.' },
    { t: 'Angebot anfordern', u: '/request-quote.html', k: 'Kontakt', d: 'Fordern Sie Preise und technische Empfehlungen für Ihre Anwendung an.' },
    { t: 'Support', u: '/support.html', k: 'Support', d: 'Dokumentation, Garantie, Versand und Lieferung sowie technischer Support.' },
    { t: 'Support kontaktieren', u: '/support/contact.html', k: 'Support', d: 'Stellen Sie eine technische Support-Anfrage zu Ihrer GYUTRON-Hardware.' },
    { t: 'Download anfordern', u: '/resources/download-request.html', k: 'Ressourcen', d: 'Fordern Sie Datenblätter, Handbücher, Zertifikate und Application Notes an.' },
    { t: 'FAQ', u: '/support/faq.html', k: 'Support', d: 'Häufig gestellte Fragen zu Produkten, Bestellung und Support.' },
    { t: 'Garantie', u: '/support/warranty.html', k: 'Support', d: 'Garantiebedingungen und Abdeckung der Produkte.' },
    { t: 'Versand & Lieferung', u: '/support/shipping-delivery.html', k: 'Support', d: 'Versandoptionen, Lieferzeiten und Lieferinformationen.' },
  ],
  ja: [
    { t: '営業へのお問い合わせ', u: '/contact-sales.html', k: 'お問い合わせ', d: '製品・実証・統合・お見積もりについて GYUTRON チームにご相談ください。' },
    { t: 'お見積もり依頼', u: '/request-quote.html', k: 'お問い合わせ', d: '用途に応じた価格と技術提案をご依頼いただけます。' },
    { t: 'サポート', u: '/support.html', k: 'サポート', d: 'ドキュメント、保証、配送・お届け、技術サポート。' },
    { t: 'サポートへのお問い合わせ', u: '/support/contact.html', k: 'サポート', d: 'GYUTRON ハードウェアの技術サポートを依頼できます。' },
    { t: '資料ダウンロード申請', u: '/resources/download-request.html', k: 'リソース', d: 'データシート・マニュアル・認証書・アプリケーションノートを請求できます。' },
    { t: 'よくある質問', u: '/support/faq.html', k: 'サポート', d: '製品・ご注文・サポートに関するよくある質問。' },
    { t: '保証', u: '/support/warranty.html', k: 'サポート', d: '製品の保証条件と適用範囲。' },
    { t: '配送・お届け', u: '/support/shipping-delivery.html', k: 'サポート', d: '配送オプション、リードタイム、お届け情報。' },
  ],
};

export function buildSearchIndex(locale: Locale): SearchRecord[] {
  const data: any = getCatalog(locale);
  const out: SearchRecord[] = [];
  // Text-only curated pages (support/contact) stay rows.
  for (const p of PAGES[locale]) out.push({ ...p, u: localizeUrl(locale, p.u), ...(p.i ? ({ f: 1 } as const) : {}) });
  // Solutions — derived from the registry so every solution page (incl. the new ones) is searchable
  // and stays in sync with the nav. Rendered as feature long-cards.
  for (const sol of SOLUTIONS) {
    out.push({
      t: t(locale, sol.breadcrumbKey || sol.titleKey),
      u: localizeUrl(locale, sol.path),
      k: SOL_LABEL[locale],
      d: sol.descKey ? t(locale, sol.descKey) : '',
      i: img(sol.heroImage || '/product-vision-cell.png'),
      c: 1,
      f: 1,
    });
  }
  // News — render as feature long-cards linking to their /news/<slug> article page.
  for (const n of NEWS) {
    out.push({ t: n.title[locale], u: localizeUrl(locale, n.href || '/news.html'), k: NEWS_LABEL[locale], d: n.excerpt[locale], i: img(n.image), c: 1, f: 1 });
  }
  for (const slug of Object.keys(data)) {
    const cat = data[slug];
    if (!cat || !Array.isArray(cat.products) || cat.products.length === 0) continue; // skip redirect/empty categories
    const url = localizeUrl(locale, `/${slug}.html`);
    out.push({ t: cat.title, u: url, k: CAT_LABEL[locale], d: cat.intro || cat.panelText || '', i: img(cat.heroImage), c: 1, f: 1 });
    for (const prod of cat.products) {
      const kw = [prod.summary, ...(prod.tags || []), ...Object.values(prod.specs || {})].filter(Boolean).join(' ');
      out.push({ t: prod.name, u: url, k: prod.type || CAT_LABEL[locale], d: kw, i: img(prod.image), c: 1 });
    }
  }
  return out;
}
