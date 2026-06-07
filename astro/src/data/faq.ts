/**
 * FAQ content — data-driven and locale-aware. EXTRACTED VERBATIM from the former per-locale
 * `src/pages/[locale]/support/faq.astro` pages (en/de/ja) so the rendered FAQ is byte-for-byte the
 * same content. `answer` is inline HTML (contains localized <a> links) and is rendered via
 * `set:html` in `components/support/FaqList.astro`. To add/edit a FAQ entry, edit this file
 * (all three locales) — see docs/CONTENT_GUIDE.md.
 */
import type { FaqCategory, FaqItem } from '../types/support';

export const FAQ_CATEGORIES: FaqCategory[] = [
  { id: "products", title: { en: "Products &amp; Compatibility", de: "Produkte &amp; Kompatibilität", ja: "製品と互換性" } },
  { id: "samples", title: { en: "Samples &amp; Quotation", de: "Muster &amp; Angebot", ja: "サンプルと見積もり" } },
  { id: "shipping", title: { en: "Shipping &amp; Lead Time", de: "Versand &amp; Lieferzeit", ja: "配送とリードタイム" } },
  { id: "warranty", title: { en: "Warranty &amp; After-sales", de: "Garantie &amp; After-Sales", ja: "保証とアフターサービス" } },
  { id: "docs", title: { en: "Documentation &amp; Integration", de: "Dokumentation &amp; Integration", ja: "ドキュメントと統合" } },
];

export const FAQ_ITEMS: FaqItem[] = [
  { id: "products-0", category: "products",
    question: { en: "What products does GYUTRON provide?", de: "Welche Produkte bietet GYUTRON an?", ja: "GYUTRON はどのような製品を提供していますか？" },
    answer: { en: "GYUTRON supplies industrial intelligent hardware: machine-vision and code-reading cameras, smart vision sensors, proximity and environmental sensors, rugged Android PDAs and RFID handhelds, barcode scanners, dimensional gauges and measurement instruments, plus related automation components — for manufacturers and system integrators worldwide.", de: "GYUTRON liefert industrielle intelligente Hardware: Machine-Vision- und Code-Lese-Kameras, Smart-Vision-Sensoren, Näherungs- und Umweltsensoren, robuste Android-PDAs und RFID-Handgeräte, Barcode-Scanner, Maßprüfgeräte und Messinstrumente sowie zugehörige Automatisierungskomponenten — für Hersteller und Systemintegratoren weltweit.", ja: "GYUTRON は産業用インテリジェントハードウェアを提供します：マシンビジョン・コード読み取りカメラ、スマートビジョンセンサー、近接・環境センサー、堅牢な Android PDA・RFID ハンディ端末、バーコードスキャナー、寸法ゲージ・測定機器、および関連する自動化コンポーネント——世界中のメーカーやシステムインテグレーター向けです。" } },
  { id: "products-1", category: "products",
    question: { en: "Can GYUTRON help match products to my application?", de: "Hilft GYUTRON bei der Produktauswahl für meine Anwendung?", ja: "用途に合った製品選定を手伝ってもらえますか？" },
    answer: { en: "Yes. Share your application, operating environment, target throughput and interface requirements with our sales-engineering team and we will recommend a suitable configuration rather than just a part number.", de: "Ja. Teilen Sie uns Ihre Anwendung, Einsatzumgebung, den angestrebten Durchsatz und die Schnittstellenanforderungen mit, und unser Vertriebs-Engineering empfiehlt eine passende Konfiguration statt nur einer Artikelnummer.", ja: "はい。用途、使用環境、目標スループット、インターフェース要件をお知らせいただければ、当社のセールスエンジニアリングが単なる型番ではなく最適な構成をご提案します。" } },
  { id: "products-2", category: "products",
    question: { en: "Do you support OEM or ODM projects?", de: "Unterstützen Sie OEM- oder ODM-Projekte?", ja: "OEM / ODM プロジェクトに対応していますか？" },
    answer: { en: "Yes. For qualified volume programs we support custom configurations, firmware, housings, connectors and private labeling. Share your specification and target quantity to scope a solution.", de: "Ja. Für qualifizierte Serienprogramme unterstützen wir kundenspezifische Konfigurationen, Firmware, Gehäuse, Steckverbinder und Private Labeling. Teilen Sie uns Ihre Spezifikation und Zielmenge mit, um eine Lösung abzustimmen.", ja: "はい。量産プログラムでは、カスタム構成、ファームウェア、筐体、コネクタ、プライベートラベルに対応します。仕様と目標数量をお知らせいただければ、ソリューションを検討します。" } },
  { id: "products-3", category: "products",
    question: { en: "Are your products suitable for industrial environments?", de: "Sind Ihre Produkte für industrielle Umgebungen geeignet?", ja: "産業環境に適していますか？" },
    answer: { en: "Our hardware is designed for industrial use, with IP-rated housings on applicable models and ratings stated per product. Confirm the specific environmental and ingress rating for your conditions on the product datasheet or with our team.", de: "Unsere Hardware ist für den industriellen Einsatz ausgelegt, mit IP-geschützten Gehäusen bei entsprechenden Modellen und den jeweils angegebenen Schutzarten. Die genaue Umgebungs- und Schutzart für Ihre Bedingungen entnehmen Sie dem Datenblatt oder erfragen Sie bei unserem Team.", ja: "当社のハードウェアは産業用途向けに設計されており、該当モデルには IP 保護等級の筐体を採用し、製品ごとに等級を明記しています。お客様の条件に対する具体的な環境・防塵防水等級は、製品データシートまたは当社までご確認ください。" } },
  { id: "samples-0", category: "samples",
    question: { en: "Can I request samples or evaluation units?", de: "Kann ich Muster oder Evaluierungsgeräte anfordern?", ja: "サンプルや評価機を依頼できますか？" },
    answer: { en: "Evaluation units are available for qualified projects. Tell us about your application, interface and expected volume through <a href=\"/contact-sales.html\">Contact Sales</a> and we will advise on availability.", de: "Evaluierungsgeräte sind für qualifizierte Projekte verfügbar. Beschreiben Sie Ihre Anwendung, Schnittstelle und erwartete Menge über <a href=\"/de/contact-sales.html\">Vertrieb kontaktieren</a>, und wir informieren Sie über die Verfügbarkeit.", ja: "評価機は適格なプロジェクト向けにご用意できます。用途・インターフェース・想定数量を<a href=\"/ja/contact-sales.html\">営業に問い合わせ</a>からお知らせいただければ、提供可否をご案内します。" } },
  { id: "samples-1", category: "samples",
    question: { en: "How do I request a quotation?", de: "Wie fordere ich ein Angebot an?", ja: "見積もりはどのように依頼しますか？" },
    answer: { en: "Send the product model(s), quantity and target date through <a href=\"/contact-sales.html\">Contact Sales</a> and our team will prepare a quotation.", de: "Senden Sie das/die Produktmodell(e), die Menge und den Wunschtermin über <a href=\"/de/contact-sales.html\">Vertrieb kontaktieren</a>, und unser Team erstellt ein Angebot.", ja: "製品型番・数量・希望納期を<a href=\"/ja/contact-sales.html\">営業に問い合わせ</a>からお送りいただければ、当社チームが見積もりを作成します。" } },
  { id: "samples-2", category: "samples",
    question: { en: "What information should I provide for a quote?", de: "Welche Angaben benötige ich für ein Angebot?", ja: "見積もりに必要な情報は何ですか？" },
    answer: { en: "Product model or application description, quantity, required interface/configuration, target delivery date and destination country/region. The more detail you provide, the more accurate the quotation.", de: "Produktmodell oder Anwendungsbeschreibung, Menge, benötigte Schnittstelle/Konfiguration, Wunschliefertermin und Zielland/-region. Je mehr Details, desto genauer das Angebot.", ja: "製品型番または用途の説明、数量、必要なインターフェース/構成、希望納期、仕向け国/地域です。詳細が多いほど、より正確な見積もりが可能です。" } },
  { id: "samples-3", category: "samples",
    question: { en: "Is there a minimum order quantity?", de: "Gibt es eine Mindestbestellmenge?", ja: "最低発注数量はありますか？" },
    answer: { en: "Minimums depend on the product line and configuration and are confirmed in the applicable quotation. We work with both pilot/evaluation volumes and series production.", de: "Mindestmengen hängen von Produktlinie und Konfiguration ab und werden im jeweiligen Angebot bestätigt. Wir bedienen sowohl Pilot-/Evaluierungsmengen als auch die Serienfertigung.", ja: "最低数量は製品ラインと構成により異なり、各見積もりで確定します。パイロット/評価数量から量産まで対応します。" } },
  { id: "shipping-0", category: "shipping",
    question: { en: "Do you ship internationally?", de: "Liefern Sie international?", ja: "海外発送に対応していますか？" },
    answer: { en: "Yes — we ship worldwide. Shipments are arranged from Hong Kong, Shenzhen or supplier warehouses depending on product availability and project requirements. See <a href=\"/support/shipping-delivery.html\">Shipping &amp; Delivery</a>.", de: "Ja — weltweit. Sendungen werden je nach Produktverfügbarkeit und Projektanforderung aus Hongkong, Shenzhen oder Lieferantenlagern arrangiert. Siehe <a href=\"/de/support/shipping-delivery.html\">Versand &amp; Lieferung</a>.", ja: "はい——世界中へ発送します。製品の在庫状況やプロジェクト要件に応じて、香港・深圳・サプライヤー倉庫から手配します。<a href=\"/ja/support/shipping-delivery.html\">配送・お届け</a>をご覧ください。" } },
  { id: "shipping-1", category: "shipping",
    question: { en: "What is the typical lead time?", de: "Wie lang ist die typische Lieferzeit?", ja: "標準的なリードタイムはどのくらいですか？" },
    answer: { en: "In-stock items are dispatched promptly; configured or made-to-order items depend on options and quantity. Confirmed lead times are provided with each quotation.", de: "Lagerartikel werden zügig versandt; konfigurierte oder auftragsbezogene Artikel je nach Optionen und Menge. Bestätigte Lieferzeiten erhalten Sie mit jedem Angebot.", ja: "在庫品は速やかに発送し、構成品・受注生産品はオプションと数量により異なります。確定リードタイムは各見積もりで提示します。" } },
  { id: "shipping-2", category: "shipping",
    question: { en: "Which Incoterms do you support?", de: "Welche Incoterms unterstützen Sie?", ja: "どの Incoterms に対応していますか？" },
    answer: { en: "International shipments are arranged under agreed Incoterms such as EXW, FOB or DAP, confirmed on the order. For larger orders we can coordinate with your nominated freight forwarder.", de: "Internationale Sendungen werden zu vereinbarten Incoterms wie EXW, FOB oder DAP abgewickelt und im Auftrag bestätigt. Bei größeren Aufträgen koordinieren wir mit Ihrem benannten Spediteur.", ja: "国際輸送は EXW、FOB、DAP など合意した Incoterms で手配し、注文時に確定します。大口注文ではお客様指定のフォワーダーと連携できます。" } },
  { id: "shipping-3", category: "shipping",
    question: { en: "Can you arrange partial shipments?", de: "Sind Teillieferungen möglich?", ja: "分割出荷は可能ですか？" },
    answer: { en: "Yes. For multi-line orders we can ship available items first rather than holding the entire order for one line, as agreed on the order.", de: "Ja. Bei Aufträgen mit mehreren Positionen können verfügbare Artikel vorab versandt werden, statt den gesamten Auftrag wegen einer Position zurückzuhalten — nach Vereinbarung im Auftrag.", ja: "はい。複数明細の注文では、1 明細のために全体を保留せず、入手可能な品目を先行して出荷できます（注文時の取り決めによります）。" } },
  { id: "warranty-0", category: "warranty",
    question: { en: "What warranty does GYUTRON provide?", de: "Welche Garantie bietet GYUTRON?", ja: "GYUTRON はどのような保証を提供していますか？" },
    answer: { en: "GYUTRON hardware carries a limited warranty against defects in materials and workmanship. Coverage may vary by product category and project agreement; the applicable terms are confirmed in your quotation, order confirmation or written agreement. See the <a href=\"/support/warranty.html\">Warranty</a> page.", de: "GYUTRON-Hardware hat eine begrenzte Garantie gegen Material- und Verarbeitungsfehler. Der Umfang kann je nach Produktkategorie und Projektvereinbarung variieren; maßgeblich sind das jeweilige Angebot, die Auftragsbestätigung oder die schriftliche Vereinbarung. Siehe <a href=\"/de/support/warranty.html\">Garantie</a>.", ja: "GYUTRON のハードウェアには、材料および製造上の欠陥に対する限定保証が付帯します。範囲は製品カテゴリやプロジェクト合意により異なる場合があり、適用される条件は見積もり・注文確認書・書面による合意で確定します。<a href=\"/ja/support/warranty.html\">保証</a>ページをご覧ください。" } },
  { id: "warranty-1", category: "warranty",
    question: { en: "What is not covered under warranty?", de: "Was ist von der Garantie ausgeschlossen?", ja: "保証の対象外は何ですか？" },
    answer: { en: "Typical exclusions include misuse, improper installation, operation outside published specifications, unauthorized modification or repair, accidental or liquid damage beyond the rated protection, and consumable or wear parts. See the <a href=\"/support/warranty.html\">Warranty</a> page for details.", de: "Typische Ausschlüsse sind Missbrauch, unsachgemäße Installation, Betrieb außerhalb der veröffentlichten Spezifikationen, unbefugte Änderung oder Reparatur, Unfall- oder Flüssigkeitsschäden über die Schutzart hinaus sowie Verbrauchs- und Verschleißteile. Details auf der <a href=\"/de/support/warranty.html\">Garantie</a>-Seite.", ja: "一般的な対象外には、誤用、不適切な設置、公表仕様外での使用、無断の改造・修理、定格保護を超える事故・液体による損傷、消耗・摩耗部品が含まれます。詳細は<a href=\"/ja/support/warranty.html\">保証</a>ページをご覧ください。" } },
  { id: "warranty-2", category: "warranty",
    question: { en: "How do I request after-sales support?", de: "Wie fordere ich After-Sales-Support an?", ja: "アフターサービスはどのように依頼しますか？" },
    answer: { en: "Start by <a href=\"/support.html\">contacting support</a> with the product model, serial number and a description of the issue. Eligible cases are handled through our RMA process.", de: "Beginnen Sie damit, den <a href=\"/de/support.html\">Support zu kontaktieren</a> — mit Produktmodell, Seriennummer und einer Beschreibung des Problems. Berechtigte Fälle werden über unseren RMA-Prozess abgewickelt.", ja: "まず製品型番・シリアル番号・問題の説明を添えて<a href=\"/ja/support.html\">サポートへお問い合わせ</a>ください。対象となる案件は RMA プロセスで対応します。" } },
  { id: "warranty-3", category: "warranty",
    question: { en: "Do you provide repair or replacement service?", de: "Bieten Sie Reparatur- oder Austauschservice?", ja: "修理または交換サービスはありますか？" },
    answer: { en: "Yes. In-warranty defects are repaired or replaced at GYUTRON's discretion; paid repair and service are available for out-of-warranty units.", de: "Ja. Mängel innerhalb der Garantie werden nach Wahl von GYUTRON repariert oder ersetzt; für Geräte außerhalb der Garantie sind kostenpflichtige Reparatur und Service verfügbar.", ja: "はい。保証期間内の欠陥は GYUTRON の裁量で修理または交換します。保証期間外の機器については有償での修理・サービスをご利用いただけます。" } },
  { id: "docs-0", category: "docs",
    question: { en: "Can you provide datasheets and technical documents?", de: "Stellen Sie Datenblätter und technische Unterlagen bereit?", ja: "データシートや技術文書を提供してもらえますか？" },
    answer: { en: "Yes. Datasheets, manuals and technical documentation are available from your sales engineer or <a href=\"mailto:info@gyutron.com\">info@gyutron.com</a>. A self-service Downloads area is being expanded.", de: "Ja. Datenblätter, Handbücher und technische Dokumentation erhalten Sie von Ihrem Vertriebsingenieur oder unter <a href=\"mailto:info@gyutron.com\">info@gyutron.com</a>. Ein Self-Service-Downloadbereich wird ausgebaut.", ja: "はい。データシート、マニュアル、技術文書は、担当のセールスエンジニアまたは <a href=\"mailto:info@gyutron.com\">info@gyutron.com</a> から入手できます。セルフサービスのダウンロード領域も拡充中です。" } },
  { id: "docs-1", category: "docs",
    question: { en: "Do your products support SDKs or integration guides?", de: "Unterstützen Ihre Produkte SDKs oder Integrationsleitfäden?", ja: "製品は SDK や統合ガイドに対応していますか？" },
    answer: { en: "Yes. We provide the SDKs, drivers and integration guidance required to bring a device into your platform, line or host application.", de: "Ja. Wir stellen die für die Integration erforderlichen SDKs, Treiber und Integrationshinweise bereit, um ein Gerät in Ihre Plattform, Linie oder Host-Anwendung zu bringen.", ja: "はい。デバイスをお客様のプラットフォーム、ライン、ホストアプリケーションに組み込むために必要な SDK、ドライバ、統合ガイダンスを提供します。" } },
  { id: "docs-2", category: "docs",
    question: { en: "Can GYUTRON support system integrators?", de: "Unterstützt GYUTRON Systemintegratoren?", ja: "GYUTRON はシステムインテグレーターを支援できますか？" },
    answer: { en: "Yes. We work with system integrators and machine builders and can support specification, sample evaluation and integration for project-based deployments.", de: "Ja. Wir arbeiten mit Systemintegratoren und Maschinenbauern zusammen und unterstützen Spezifikation, Musterbewertung und Integration für projektbezogene Implementierungen.", ja: "はい。システムインテグレーターや機械メーカーと協業し、プロジェクトベースの導入における仕様策定、サンプル評価、統合を支援します。" } },
  { id: "docs-3", category: "docs",
    question: { en: "Can you help evaluate a machine-vision or automation project?", de: "Können Sie ein Machine-Vision- oder Automatisierungsprojekt bewerten?", ja: "マシンビジョンや自動化プロジェクトの評価を手伝えますか？" },
    answer: { en: "Yes. Our application engineers can help assess feasibility, recommend hardware and define an integration approach for vision-inspection, identification and automation projects.", de: "Ja. Unsere Applikationsingenieure unterstützen bei Machbarkeitsbewertung, Hardware-Empfehlung und Definition des Integrationsansatzes für Bildverarbeitungs-, Identifikations- und Automatisierungsprojekte.", ja: "はい。当社のアプリケーションエンジニアが、外観検査・識別・自動化プロジェクトの実現性評価、ハードウェアの推奨、統合方針の策定を支援します。" } },
];

/** Items belonging to a category, in declaration order. */
export function faqByCategory(categoryId: string): FaqItem[] {
  return FAQ_ITEMS.filter((item) => item.category === categoryId);
}
