/**
 * Newsroom content. Each entry is locale-aware (en/de/ja). The homepage shows the latest few via
 * getLatestNews(); a future `/news/` index/article pages can reuse this same source.
 *
 * ⚠️ SEED content (factual GYUTRON updates) to get the section live — extend/replace with real posts.
 * To add a post: prepend a NewsItem with a newer `date`. Set `href` only once its /news article page
 * exists (otherwise leave it off so no dead link renders). Images are optional (placeholder if blank).
 * See docs/CONTENT_GUIDE.md "Add a news post".
 */
import type { Locale } from '../i18n';
import type { NewsItem } from '../types/news';

export const NEWS: NewsItem[] = [
  {
    id: 'news-900-series',
    slug: '900-series-launch',
    date: '2026-05-20',
    category: { en: 'Products', de: 'Produkte', ja: '製品' },
    title: {
      en: 'New 900-series: smart cameras, 3D and edge controllers',
      de: 'Neue 900er-Serie: Smart-Kameras, 3D und Edge-Controller',
      ja: '900 シリーズ:スマートカメラ・3D・エッジコントローラを追加',
    },
    excerpt: {
      en: 'The catalog adds the 900-series machine-vision cameras, 3D profiling and edge controllers for higher-throughput inspection cells.',
      de: 'Der Katalog erhält die 900er-Serie mit Machine-Vision-Kameras, 3D-Profilierung und Edge-Controllern für leistungsfähigere Prüfzellen.',
      ja: '高スループットの検査セル向けに、900 シリーズのマシンビジョンカメラ・3D プロファイリング・エッジコントローラを追加しました。',
    },
    image: '/product-hero-area-scan-cameras-matrix.png',
  },
  {
    id: 'news-trilingual',
    slug: 'site-en-de-ja',
    date: '2026-04-15',
    category: { en: 'Company', de: 'Unternehmen', ja: '会社' },
    title: {
      en: 'gyutron.com is now available in English, German and Japanese',
      de: 'gyutron.com jetzt auf Englisch, Deutsch und Japanisch verfügbar',
      ja: 'gyutron.com が英語・ドイツ語・日本語に対応しました',
    },
    excerpt: {
      en: 'The full product catalog, solutions and support are now localized across three languages for our global customers.',
      de: 'Der vollständige Produktkatalog, die Lösungen und der Support sind nun in drei Sprachen für unsere globalen Kunden lokalisiert.',
      ja: '製品カタログ・ソリューション・サポートの全体を 3 言語にローカライズし、グローバルのお客様に対応します。',
    },
    image: '/nav-resources-overview.png',
  },
  {
    id: 'news-oem-program',
    slug: 'oem-odm-program',
    date: '2026-03-10',
    category: { en: 'OEM / ODM', de: 'OEM / ODM', ja: 'OEM / ODM' },
    title: {
      en: 'OEM / ODM program open for qualified volume projects',
      de: 'OEM-/ODM-Programm für qualifizierte Serienprojekte geöffnet',
      ja: 'OEM / ODM プログラムを量産プロジェクト向けに開始',
    },
    excerpt: {
      en: 'Custom configurations, firmware, housings, connectors and private labeling are available for qualified volume programs.',
      de: 'Kundenspezifische Konfigurationen, Firmware, Gehäuse, Steckverbinder und Private Labeling für qualifizierte Serienprogramme.',
      ja: '量産プログラム向けに、カスタム構成・ファームウェア・筐体・コネクタ・プライベートラベルに対応します。',
    },
    image: '/nav-company-engineering-lab.png',
  },
];

/** The latest `n` news items, newest first (by date). */
export function getLatestNews(n = 3): NewsItem[] {
  return [...NEWS].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, n);
}
