/**
 * Newsroom content. Each entry is locale-aware (en/de/ja). The homepage shows the latest few via
 * getLatestNews(); the /news index lists all of them; /news/<slug> article pages render one via
 * getNews(slug). A future CMS adapter can back this same source.
 *
 * ⚠️ SEED content (factual GYUTRON updates) — extend/replace with real posts. To add a post: prepend a
 * NewsItem with a newer `date`, set `href` to /news/<slug>.html, and add a `body` (optional; the article
 * falls back to the excerpt). Images optional (placeholder if blank). See docs/CONTENT_GUIDE.md.
 */
import type { Locale } from '../i18n';
import type { NewsItem } from '../types/news';

export const NEWS: NewsItem[] = [
  {
    id: 'news-900-series',
    slug: '900-series-launch',
    date: '2026-05-20',
    category: { en: 'Products', de: 'Produkte', ja: '製品' },
    href: '/news/900-series-launch.html',
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
    body: {
      en: 'The GYUTRON 900-series adds new machine-vision cameras, a 3D profiling unit and compact edge controllers to the catalog, aimed at higher-throughput inspection cells. They integrate over the same standard industrial interfaces as the rest of the range, so they drop into existing GYUTRON vision setups. Contact our sales-engineering team to scope a configuration for your line.',
      de: 'Die GYUTRON 900er-Serie ergänzt den Katalog um neue Machine-Vision-Kameras, eine 3D-Profiliereinheit und kompakte Edge-Controller für leistungsfähigere Prüfzellen. Sie nutzen dieselben gängigen industriellen Schnittstellen wie die übrige Reihe und fügen sich in bestehende GYUTRON-Vision-Aufbauten ein. Sprechen Sie mit unserem Vertriebs-Engineering, um eine Konfiguration für Ihre Linie abzustimmen.',
      ja: 'GYUTRON 900 シリーズは、高スループットの検査セル向けに、新しいマシンビジョンカメラ・3D プロファイリング機・コンパクトなエッジコントローラをカタログに追加しました。既存シリーズと同じ標準的な産業インターフェースに対応し、現行の GYUTRON ビジョン構成にそのまま組み込めます。ラインに合わせた構成は当社のセールスエンジニアリングにご相談ください。',
    },
    image: '/product-hero-area-scan-cameras-matrix.png',
  },
  {
    id: 'news-trilingual',
    slug: 'site-en-de-ja',
    date: '2026-04-15',
    category: { en: 'Company', de: 'Unternehmen', ja: '会社' },
    href: '/news/site-en-de-ja.html',
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
    body: {
      en: 'gyutron.com is now fully available in English, German and Japanese — the complete product catalog, solutions and support are localized for our global B2B customers. Use the language switch in the site header to change language on any page; the same page is preserved across languages.',
      de: 'gyutron.com ist jetzt vollständig auf Englisch, Deutsch und Japanisch verfügbar — der komplette Produktkatalog, die Lösungen und der Support sind für unsere globalen B2B-Kunden lokalisiert. Über die Sprachumschaltung in der Kopfzeile wechseln Sie auf jeder Seite die Sprache; die jeweilige Seite bleibt dabei erhalten.',
      ja: 'gyutron.com は英語・ドイツ語・日本語に完全対応しました——製品カタログ・ソリューション・サポートの全体を、グローバルの B2B のお客様向けにローカライズしています。ヘッダーの言語切り替えで各ページの言語を変更でき、同じページが言語間で保持されます。',
    },
    image: '/nav-resources-overview.png',
  },
  {
    id: 'news-oem-program',
    slug: 'oem-odm-program',
    date: '2026-03-10',
    category: { en: 'OEM / ODM', de: 'OEM / ODM', ja: 'OEM / ODM' },
    href: '/news/oem-odm-program.html',
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
    body: {
      en: 'GYUTRON’s OEM / ODM program is open for qualified volume projects: custom configurations, firmware, housings, connectors and private labeling on our hardware platform. Your specification, our manufacturing. Share your requirements and target quantity through Contact Sales to scope a program.',
      de: 'Das OEM-/ODM-Programm von GYUTRON ist für qualifizierte Serienprojekte geöffnet: kundenspezifische Konfigurationen, Firmware, Gehäuse, Steckverbinder und Private Labeling auf unserer Hardware-Plattform. Ihre Spezifikation, unsere Fertigung. Teilen Sie Anforderungen und Zielmenge über „Vertrieb kontaktieren“ mit, um ein Programm abzustimmen.',
      ja: 'GYUTRON の OEM / ODM プログラムを量産プロジェクト向けに開始しました。当社のハードウェアプラットフォーム上で、カスタム構成・ファームウェア・筐体・コネクタ・プライベートラベルに対応します。お客様の仕様を、当社の製造で。要件と目標数量を「営業へのお問い合わせ」からお知らせいただければ、プログラムを検討します。',
    },
    image: '/nav-company-engineering-lab.png',
  },
];

/** The latest `n` news items, newest first (by date). */
export function getLatestNews(n = 3): NewsItem[] {
  return [...NEWS].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, n);
}

/** One news item by slug, or undefined. */
export function getNews(slug: string): NewsItem | undefined {
  return NEWS.find((n) => n.slug === slug);
}
