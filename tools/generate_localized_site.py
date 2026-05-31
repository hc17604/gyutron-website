#!/usr/bin/env python3
"""Generate static localized main-site pages from the English source pages."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PAGE_FILES = [
    "index.html",
    "contact-sales.html",
    "automated-vision-inspection.html",
    "android-pda.html",
    "rfid-handhelds.html",
    "barcode-scanners.html",
    "request-specification.html",
    "proximity-sensors.html",
    "industrial-sensors.html",
    "laser-measurement.html",
    "environmental-sensing.html",
    "area-scan-cameras.html",
    "smart-cameras.html",
    "smart-vision-sensors.html",
    "code-reading-cameras.html",
    "vision-lighting.html",
    "inspection-instruments.html",
    "dimensional-gauges.html",
    "surface-inspection.html",
    "portable-testers.html",
    "calibration-tools.html",
]


LOCALES = {
    "de": {
        "html_lang": "de",
        "label": "Deutsch",
        "short": "DE",
        "og_locale": "de_DE",
        "title": "GYUTRON | Industrielle Bildverarbeitung, Sensorik und Automatisierungshardware",
        "description": "GYUTRON bietet industrielle intelligente Hardware, Machine-Vision-Systeme, Sensoren, robuste PDA-Terminals, Prüfgeräte und vernetzte Automatisierungslösungen für moderne Fertigungs- und Logistikteams.",
        "replacements": {
            "Robotics, vision, sensors, and rugged computing for industrial teams": "Robotik, Bildverarbeitung, Sensorik und robuste Computertechnik für Industrieteams",
            "Official Store": "Offizieller Store",
            "Products": "Produkte",
            "Solutions": "Lösungen",
            "Industries": "Branchen",
            "Customers": "Kunden",
            "Company": "Unternehmen",
            "Resources": "Ressourcen",
            "Contact Sales": "Vertrieb kontaktieren",
            "Contact</span>": "Kontakt</span>",
            "Learn More": "Mehr erfahren",
            "Browse Cameras": "Kameras ansehen",
            "Explore Products": "Produkte entdecken",
            "View Solutions": "Lösungen ansehen",
            "Request quote": "Angebot anfordern",
            "Compare spec": "Spezifikation vergleichen",
            "Request Quote": "Angebot anfordern",
            "Compare Spec": "Spezifikation vergleichen",
            "Industrial Product Portfolio": "Industrielles Produktportfolio",
            "Rugged PDA Terminals": "Robuste PDA-Terminals",
            "Android PDA": "Android-PDA",
            "RFID Handhelds": "RFID-Handhelds",
            "Barcode Scanners": "Barcode-Scanner",
            "Request Specification": "Spezifikation anfordern",
            "Sensing &amp; I/O": "Sensorik &amp; I/O",
            "Machine Vision Systems": "Machine-Vision-Systeme",
            "Quality &amp; Test Instruments": "Qualitäts- &amp; Prüfgeräte",
            "More Products": "Weitere Produkte",
            "Integrated Industrial Solutions": "Integrierte industrielle Lösungen",
            "Solution Platforms": "Lösungsplattformen",
            "Automated Vision Inspection": "Automatisierte Bildprüfung",
            "Electronics &amp; Semiconductor Manufacturing": "Elektronik- &amp; Halbleiterfertigung",
            "Integrated Industrial Embedded Systems": "Integrierte industrielle Embedded-Systeme",
            "Manufacturing Intelligence &amp; Traceability": "Fertigungsintelligenz &amp; Rückverfolgbarkeit",
            "Warehouse &amp; Field Operations": "Lager- &amp; Feldeinsätze",
            "OEM / ODM Solution Programs": "OEM-/ODM-Lösungsprogramme",
            "Industrial Vision Systems": "Industrielle Bildverarbeitungssysteme",
            "Inline quality decisions with smart cameras, lighting, code reading, dimensional checks, and robot guidance configured as one inspection layer.": "Qualitätsentscheidungen direkt in der Linie mit Smart-Kameras, Beleuchtung, Codeprüfung, Maßkontrolle und Roboterführung als integrierte Prüfebene.",
            "Rugged Data Capture": "Robuste Datenerfassung",
            "Connected Factory Hardware": "Vernetzte Fabrikhardware",
            "Hardware that sees, senses, scans, measures, and acts.": "Hardware, die sieht, erfasst, scannt, misst und handelt.",
            "Industrial intelligence for the places work actually happens.": "Industrial Intelligence für die Orte, an denen Arbeit tatsächlich stattfindet.",
            "Device data becomes operational intelligence.": "Gerätedaten werden zu operativer Intelligenz.",
            "Responsible automation for safer, leaner operations.": "Verantwortungsvolle Automatisierung für sicherere und schlankere Abläufe.",
            "Portfolio": "Portfolio",
            "Type": "Typ",
            "Core capability": "Kernfunktion",
            "Rugged rating": "Robustheit",
            "product image": "Produktbild",
            "Industrial data capture": "Industrielle Datenerfassung",
            "Project-based": "Projektabhängig"
            ,
            "6 models": "6 Modelle",
            "4 models": "4 Modelle",
            "7 models": "7 Modelle",
            "5 models": "5 Modelle",
            "3 models": "3 Modelle",
            "Rugged Android handhelds for warehouse, manufacturing, field service, and line-side data capture.": "Robuste Android-Handhelds für Lager, Fertigung, Field Service und liniennahe Datenerfassung.",
            "Android UHF RFID terminals for inventory, asset tracking, inbound logistics, retail stock rooms, and production traceability.": "Android-UHF-RFID-Terminals für Inventur, Asset Tracking, Inbound-Logistik, Lagerbereiche und Produktionsrückverfolgbarkeit.",
            "Industrial handheld barcode scanners for 1D, 2D, DPM, long-range, and wireless scan workflows.": "Industrielle Handheld-Barcode-Scanner für 1D-, 2D-, DPM-, Long-Range- und Wireless-Scan-Workflows.",
            "Predefined configuration paths for buyers who want GYUTRON to match PDA, scanner, RFID, accessories, and software requirements.": "Vordefinierte Konfigurationspfade für Käufer, die PDA, Scanner, RFID, Zubehör und Softwareanforderungen abstimmen möchten.",
            "Industrial sensing, measurement, safety, and IO hardware for machine builders and factory automation teams.": "Industrielle Sensorik-, Mess-, Sicherheits- und I/O-Hardware für Maschinenbauer und Fabrikautomationsteams.",
            "Embedded smart cameras, fixed code readers, line-scan systems, 3D vision, controllers, and lighting accessories.": "Embedded Smart-Kameras, feste Codeleser, Line-Scan-Systeme, 3D-Vision, Controller und Beleuchtungszubehör.",
            "Portable and inline measurement instruments for dimensional checks, surface review, code grading, and quality documentation.": "Portable und inlinefähige Messgeräte für Maßprüfung, Oberflächenbewertung, Code-Grading und Qualitätsdokumentation.",
            "Photoelectric, inductive, fiber, ultrasonic, and safety sensing for part presence, fixtures, conveyors, and guarded stations.": "Photoelektrische, induktive, Faser-, Ultraschall- und Sicherheitssensorik für Teileanwesenheit, Vorrichtungen, Fördertechnik und abgesicherte Stationen.",
            "Non-contact laser and ultrasonic distance products for position checks, gap confirmation, level sensing, and machine feedback.": "Berührungslose Laser- und Ultraschall-Distanzprodukte für Positionsprüfung, Spaltbestätigung, Füllstandserfassung und Maschinenfeedback.",
            "Pressure, temperature, humidity, vibration, and sensor-network products for uptime visibility and process stability.": "Druck-, Temperatur-, Feuchte-, Vibrations- und Sensornetzwerkprodukte für Uptime-Transparenz und Prozessstabilität.",
            "2D smart cameras for full-frame inspection, assembly verification, metrology, guidance, and AI-assisted checks.": "2D-Smart-Kameras für Vollbildprüfung, Montageverifikation, Messtechnik, Führung und KI-gestützte Kontrollen.",
            "Vision controllers, 3D profile cameras, and line-scan systems for larger inspection cells and higher-complexity applications.": "Vision-Controller, 3D-Profilkameras und Line-Scan-Systeme für größere Prüfzellen und komplexere Anwendungen.",
            "Fixed and handheld image-based readers for barcode, QR, Data Matrix, DPM, and regulated traceability workflows.": "Stationäre und mobile bildbasierte Leser für Barcode, QR, Data Matrix, DPM und regulierte Rückverfolgbarkeits-Workflows.",
            "White-light machine vision illumination accessories for stable imaging without color distortion or purple lighting effects.": "Weißlicht-Beleuchtungszubehör für stabile Machine-Vision-Bilder ohne Farbverfälschung oder violette Lichteffekte.",
            "Measurement tools for geometry, alignment, height, gap, profile, and production tolerance checks.": "Messwerkzeuge für Geometrie, Ausrichtung, Höhe, Spalt, Profil und Produktionstoleranzen.",
            "Dedicated surface-quality instruments for roughness, gloss, coating thickness, and visible finish checks.": "Spezialisierte Oberflächenqualitätsgeräte für Rauheit, Glanz, Schichtdicke und sichtbare Finish-Prüfungen.",
            "Handheld electrical, thermal, and signal testers for maintenance teams and field quality checks.": "Handheld-Tester für elektrische, thermische und signalbezogene Prüfungen durch Wartungs- und Qualitätsteams.",
            "Calibration and verification accessories for machine vision, metrology, code quality, and measurement lifecycle documentation.": "Kalibrier- und Verifizierungszubehör für Machine Vision, Messtechnik, Codequalität und dokumentierte Messmittelpflege.",
            "Touch, keypad, scan handle, cold chain, and long-life battery options.": "Touch-, Tastatur-, Scan-Griff-, Kühlketten- und Langzeitakku-Optionen.",
            "Built-in, long-range, 5G, and ergonomic RFID options.": "Integrierte, Long-Range-, 5G- und ergonomische RFID-Optionen.",
            "Wired, wireless, cold-chain, long-range, wearable, presentation, and dock-door scan options.": "Kabelgebundene, kabellose, Kühlketten-, Long-Range-, Wearable-, Präsentations- und Tor-Scan-Optionen.",
            "Use these as starting points for quotation, samples, or OEM / ODM discussion.": "Nutzen Sie diese Optionen als Ausgangspunkt für Angebote, Muster oder OEM-/ODM-Abstimmungen.",
            "Presence detection, distance measurement, process monitoring, safety, and IO-Link connectivity.": "Anwesenheitserkennung, Distanzmessung, Prozessüberwachung, Sicherheit und IO-Link-Konnektivität.",
            "2D inspection, AI tools, line-scan, 3D profiling, code reading, and vision-control options.": "2D-Prüfung, KI-Tools, Line-Scan, 3D-Profiling, Codelesen und Vision-Control-Optionen.",
            "Dimensional, optical, surface, code-verification, and handheld electrical test instruments.": "Maß-, optische, Oberflächen-, Code-Verifikations- und portable elektrische Prüfgeräte."
        },
    },
    "ja": {
        "html_lang": "ja",
        "label": "日本語",
        "short": "JA",
        "og_locale": "ja_JP",
        "title": "GYUTRON | 産業用画像処理・センサー・データ収集・自動化ハードウェア",
        "description": "GYUTRONは、現代の製造、物流、現場業務向けに産業用カメラ、堅牢なデータ収集端末、センサー、検査機器、自動化ソリューションを提供します。",
        "replacements": {
            "Robotics, vision, sensors, and rugged computing for industrial teams": "産業チーム向けのロボティクス、画像処理、センサー、堅牢コンピューティング",
            "Official Store": "公式ストア",
            "Support Center": "サポートセンター",
            "Products": "製品",
            "Solutions": "ソリューション",
            "Industries": "業界",
            "Customers": "顧客",
            "Company": "会社情報",
            "Resources": "リソース",
            "Contact Sales": "営業に問い合わせ",
            "Contact</span>": "問い合わせ</span>",
            "Learn More": "詳しく見る",
            "Browse Cameras": "カメラを見る",
            "Explore Products": "製品を見る",
            "View Solutions": "ソリューションを見る",
            "Request quote": "見積依頼",
            "Compare spec": "仕様を比較",
            "Request Quote": "見積依頼",
            "Compare Spec": "仕様を比較",
            "Industrial Product Portfolio": "産業用製品ポートフォリオ",
            "Rugged PDA Terminals": "堅牢PDA端末",
            "Android PDA": "Android PDA",
            "RFID Handhelds": "RFIDハンドヘルド",
            "Barcode Scanners": "バーコードスキャナー",
            "Request Specification": "仕様相談",
            "Sensing &amp; I/O": "センシング &amp; I/O",
            "Machine Vision Systems": "マシンビジョンシステム",
            "Quality &amp; Test Instruments": "品質・試験機器",
            "More Products": "その他の製品",
            "Integrated Industrial Solutions": "統合型産業ソリューション",
            "Solution Platforms": "ソリューション基盤",
            "Automated Vision Inspection": "自動画像検査",
            "Electronics &amp; Semiconductor Manufacturing": "電子・半導体製造",
            "Integrated Industrial Embedded Systems": "産業用組込みシステム",
            "Manufacturing Intelligence &amp; Traceability": "製造インテリジェンス &amp; トレーサビリティ",
            "Warehouse &amp; Field Operations": "倉庫・現場業務",
            "OEM / ODM Solution Programs": "OEM / ODM ソリューションプログラム",
            "Industrial Vision Systems": "産業用画像処理システム",
            "Inline quality decisions with smart cameras, lighting, code reading, dimensional checks, and robot guidance configured as one inspection layer.": "スマートカメラ、照明、コード読み取り、寸法確認、ロボットガイダンスを一体化し、ライン上で品質判断を行います。",
            "Rugged Data Capture": "堅牢なデータ収集",
            "Connected Factory Hardware": "つながる工場ハードウェア",
            "Hardware that sees, senses, scans, measures, and acts.": "見る、検知する、読み取る、測る、動かすためのハードウェア。",
            "Industrial intelligence for the places work actually happens.": "現場で機能する産業インテリジェンス。",
            "Device data becomes operational intelligence.": "デバイスデータを運用インテリジェンスへ。",
            "Responsible automation for safer, leaner operations.": "より安全で無駄の少ない運用のための責任ある自動化。",
            "Portfolio": "ポートフォリオ",
            "Type": "タイプ",
            "Core capability": "主な機能",
            "Rugged rating": "堅牢性",
            "product image": "製品画像",
            "Industrial data capture": "産業用データ収集",
            "Project-based": "案件別"
            ,
            "6 models": "6モデル",
            "4 models": "4モデル",
            "7 models": "7モデル",
            "5 models": "5モデル",
            "3 models": "3モデル",
            "Rugged Android handhelds for warehouse, manufacturing, field service, and line-side data capture.": "倉庫、製造、フィールドサービス、ラインサイドのデータ収集に対応する堅牢なAndroidハンドヘルド。",
            "Android UHF RFID terminals for inventory, asset tracking, inbound logistics, retail stock rooms, and production traceability.": "在庫管理、資産追跡、入荷物流、ストックルーム、製造トレーサビリティ向けのAndroid UHF RFID端末。",
            "Industrial handheld barcode scanners for 1D, 2D, DPM, long-range, and wireless scan workflows.": "1D、2D、DPM、長距離、ワイヤレスのスキャン業務に対応する産業用ハンドヘルドバーコードスキャナー。",
            "Predefined configuration paths for buyers who want GYUTRON to match PDA, scanner, RFID, accessories, and software requirements.": "PDA、スキャナー、RFID、アクセサリ、ソフトウェア要件をGYUTRONとすり合わせたい購買担当者向けの構成パス。",
            "Industrial sensing, measurement, safety, and IO hardware for machine builders and factory automation teams.": "機械メーカーと工場自動化チーム向けの産業用センシング、計測、安全、I/Oハードウェア。",
            "Embedded smart cameras, fixed code readers, line-scan systems, 3D vision, controllers, and lighting accessories.": "組込みスマートカメラ、固定式コードリーダー、ラインスキャン、3Dビジョン、コントローラー、照明アクセサリ。",
            "Portable and inline measurement instruments for dimensional checks, surface review, code grading, and quality documentation.": "寸法確認、表面評価、コードグレーディング、品質記録に対応するポータブルおよびインライン計測機器。",
            "Photoelectric, inductive, fiber, ultrasonic, and safety sensing for part presence, fixtures, conveyors, and guarded stations.": "部品有無、治具、コンベア、安全エリア向けの光電、近接、ファイバー、超音波、安全センサー。",
            "Non-contact laser and ultrasonic distance products for position checks, gap confirmation, level sensing, and machine feedback.": "位置確認、ギャップ確認、レベル検知、機械フィードバック向けの非接触レーザー・超音波距離製品。",
            "Pressure, temperature, humidity, vibration, and sensor-network products for uptime visibility and process stability.": "稼働状況の可視化とプロセス安定化に向けた圧力、温度、湿度、振動、センサーネットワーク製品。",
            "2D smart cameras for full-frame inspection, assembly verification, metrology, guidance, and AI-assisted checks.": "フルフレーム検査、組立確認、計測、ガイダンス、AI支援検査に対応する2Dスマートカメラ。",
            "Vision controllers, 3D profile cameras, and line-scan systems for larger inspection cells and higher-complexity applications.": "大型検査セルや複雑な用途向けのビジョンコントローラー、3Dプロファイルカメラ、ラインスキャンシステム。",
            "Fixed and handheld image-based readers for barcode, QR, Data Matrix, DPM, and regulated traceability workflows.": "バーコード、QR、Data Matrix、DPM、規制対応トレーサビリティ向けの固定式・ハンドヘルド画像リーダー。",
            "White-light machine vision illumination accessories for stable imaging without color distortion or purple lighting effects.": "色ずれや紫色照明感を抑え、安定した画像取得を支える白色マシンビジョン照明アクセサリ。",
            "Measurement tools for geometry, alignment, height, gap, profile, and production tolerance checks.": "形状、位置合わせ、高さ、ギャップ、プロファイル、生産公差確認のための計測ツール。",
            "Dedicated surface-quality instruments for roughness, gloss, coating thickness, and visible finish checks.": "粗さ、光沢、膜厚、外観仕上げ確認に対応する専用の表面品質機器。",
            "Handheld electrical, thermal, and signal testers for maintenance teams and field quality checks.": "保全チームと現場品質確認向けの電気、熱、信号用ハンドヘルドテスター。",
            "Calibration and verification accessories for machine vision, metrology, code quality, and measurement lifecycle documentation.": "マシンビジョン、計測、コード品質、測定ライフサイクル記録向けの校正・検証アクセサリ。",
            "Touch, keypad, scan handle, cold chain, and long-life battery options.": "タッチ、キーパッド、スキャングリップ、コールドチェーン、長時間バッテリーの選択肢。",
            "Built-in, long-range, 5G, and ergonomic RFID options.": "内蔵型、長距離、5G、エルゴノミックRFIDの選択肢。",
            "Wired, wireless, cold-chain, long-range, wearable, presentation, and dock-door scan options.": "有線、無線、コールドチェーン、長距離、ウェアラブル、プレゼンテーション、ドックドア向けスキャンの選択肢。",
            "Use these as starting points for quotation, samples, or OEM / ODM discussion.": "見積、サンプル、OEM / ODM相談の出発点として利用できます。",
            "Presence detection, distance measurement, process monitoring, safety, and IO-Link connectivity.": "有無検知、距離測定、プロセス監視、安全、IO-Link接続。",
            "2D inspection, AI tools, line-scan, 3D profiling, code reading, and vision-control options.": "2D検査、AIツール、ラインスキャン、3Dプロファイル、コード読み取り、ビジョン制御の選択肢。",
            "Dimensional, optical, surface, code-verification, and handheld electrical test instruments.": "寸法、光学、表面、コード検証、ハンドヘルド電気試験機器。"
        },
    },
}


POLISH_REPLACEMENTS = {
    "de": {
        "Product Line": "Produktlinie",
        "Model Comparison": "Modellvergleich",
        "Fast shortlist for industrial buying teams.": "Schnelle Vorauswahl für technische Einkaufsteams.",
        "Need a sample, quotation, or OEM version?": "Benötigen Sie ein Muster, ein Angebot oder eine OEM-Version?",
        "Send your application, environment, scan distance, network requirement, and target quantity. GYUTRON will recommend a hardware stack and pilot path.": "Senden Sie Anwendung, Einsatzumgebung, Scanabstand, Netzwerkvorgaben und Zielmenge. GYUTRON empfiehlt darauf abgestimmt Hardware-Stack und Pilotpfad.",
        "Industrial intelligent hardware for mobile data capture, RFID, machine vision, sensing, and connected automation.": "Industrielle intelligente Hardware für mobile Datenerfassung, RFID, Machine Vision, Sensorik und vernetzte Automatisierung.",
        "Electronics Manufacturing": "Elektronikfertigung",
        "Manufacturing Intelligence": "Fertigungsintelligenz",
        "<h4>Contact</h4>": "<h4>Kontakt</h4>",
        "All rights reserved.": "Alle Rechte vorbehalten.",
        "Automation / Vision / Innovation": "Automatisierung / Bildverarbeitung / Innovation",
        "Rugged handheld terminals for barcode, NFC, inventory, and field data capture.": "Robuste Handheld-Terminals für Barcode, NFC, Inventur und mobile Datenerfassung im Feld.",
        "Share your use case and get recommended device, accessory, and integration options.": "Beschreiben Sie Ihren Anwendungsfall und erhalten Sie passende Empfehlungen für Gerät, Zubehör und Integration.",
        "Presence &amp; Object Detection": "Anwesenheits- &amp; Objekterkennung",
        "Photoelectric, inductive, fiber, ultrasonic, and safety sensing for factory detection tasks.": "Lichtschranken-, induktive, Faser-, Ultraschall- und Sicherheitssensorik für Erkennungsaufgaben in der Fertigung.",
        "Distance &amp; Position": "Abstand &amp; Position",
        "Process &amp; Condition": "Prozess &amp; Zustand",
        "Smart cameras, code readers, 3D vision, controllers, and lighting accessories.": "Smart-Kameras, Codeleser, 3D-Vision, Controller und Beleuchtungszubehör.",
        "Code Reading &amp; Verification": "Codelesen &amp; Verifikation",
        "Fixed readers, DPM scanners, and verifiers for traceability and code quality.": "Stationäre Leser, DPM-Scanner und Verifier für Rückverfolgbarkeit und Codequalität.",
        "Vision Lighting": "Vision-Beleuchtung",
        "White-light ring, bar, and dome lighting for stable machine vision images.": "Weißlicht-Ring-, Balken- und Dome-Beleuchtung für stabile Machine-Vision-Bilder.",
        "Track pallets, tools, equipment, and production assets with rugged RFID devices.": "Paletten, Werkzeuge, Betriebsmittel und Produktionsanlagen mit robusten RFID-Geräten verfolgen.",
        "Track pallets, tools, work-in-process, containers, and returnable assets.": "Paletten, Werkzeuge, Umlaufbestände, Behälter und Mehrwegträger verfolgen.",
        "Smart cameras": "Smart-Kameras",
        "Official Store: shop.gyutron.com": "Offizieller Store: shop.gyutron.com",
        "Support Center": "Support-Center",
        "Search product": "Produkt suchen",
        "Smart &amp; Area Scan Cameras": "Smart- &amp; Area-Scan-Kameras",
        "Code Reading &amp; Traceability": "Codelesen &amp; Rückverfolgbarkeit",
        "Packaging &amp; Label Inspection": "Verpackungs- &amp; Etikettenprüfung",
        "Lighting &amp; Trigger Synchronization": "Beleuchtungs- &amp; Trigger-Synchronisation",
        "Device &amp; Fleet Management": "Geräte- &amp; Flottenmanagement",
        "Receiving &amp; Inventory": "Wareneingang &amp; Inventur",
        "Picking &amp; Dispatch": "Kommissionierung &amp; Versand",
        "Manufacturing &amp; Assembly": "Fertigung &amp; Montage",
        "Machinery &amp; Metal Parts": "Maschinenbau &amp; Metallteile",
        "Packaging &amp; Consumer Goods": "Verpackung &amp; Konsumgüter",
        "Electronics &amp; Semiconductors": "Elektronik &amp; Halbleiter",
        "Connector &amp; Cable Assemblies": "Steckverbinder- &amp; Kabelbaugruppen",
        "Logistics &amp; Field Operations": "Logistik &amp; Feldeinsätze",
        "Warehousing &amp; Distribution": "Lager &amp; Distribution",
        "Transportation &amp; Courier": "Transport &amp; Kurierdienste",
        "Utilities &amp; Field Service": "Versorger &amp; Field Service",
        "Regulated &amp; Process Industries": "Regulierte &amp; prozessbasierte Branchen",
        "Food &amp; Beverage": "Lebensmittel &amp; Getränke",
        "Pharmaceutical &amp; Medical Devices": "Pharma &amp; Medizintechnik",
        "Energy &amp; Natural Resources": "Energie &amp; Rohstoffe",
        "Cold Chain &amp; Compliance": "Kühlkette &amp; Compliance",
        "Capture lot, temperature, barcode, and inspection evidence across operations.": "Chargen, Temperatur, Barcodes und Prüfnachweise über alle Abläufe hinweg erfassen.",
        "Customer Success": "Customer Success",
        "Plan the right deployment path from first workflow review to scale-up.": "Den passenden Einführungspfad vom ersten Workflow-Review bis zur Skalierung planen.",
        "Solution Consulting": "Lösungsberatung",
        "Map line constraints, data requirements, devices, and integration priorities.": "Linienrestriktionen, Datenanforderungen, Geräte und Integrationsprioritäten erfassen.",
        "Pilot &amp; Proof of Concept": "Pilot &amp; Proof of Concept",
        "Validate inspection, scanning, and traceability before full rollout.": "Prüfung, Scanning und Rückverfolgbarkeit vor dem Rollout validieren.",
        "Deployment Planning": "Einführungsplanung",
        "Coordinate hardware, accessories, operator workflow, and acceptance criteria.": "Hardware, Zubehör, Bedienerworkflow und Abnahmekriterien koordinieren.",
        "ROI &amp; Process Review": "ROI- &amp; Prozessanalyse",
        "Estimate throughput, labor impact, defect reduction, and operational risk.": "Durchsatz, Arbeitsaufwand, Fehlerreduktion und Betriebsrisiken abschätzen.",
        "Services &amp; Lifecycle Support": "Services &amp; Lifecycle-Support",
        "Keep industrial hardware, vision systems, and mobile fleets running.": "Industrielle Hardware, Vision-Systeme und mobile Geräteflotten zuverlässig betreiben.",
        "Technical Support": "Technischer Support",
        "Help for setup, accessories, configuration, and deployment issues.": "Unterstützung bei Einrichtung, Zubehör, Konfiguration und Deployment-Fragen.",
        "Preventive Maintenance": "Präventive Wartung",
        "Support uptime with inspection plans, spares, and service readiness.": "Verfügbarkeit mit Prüfplänen, Ersatzteilen und Servicebereitschaft absichern.",
        "Repair &amp; RMA": "Reparatur &amp; RMA",
        "Coordinate device repair, replacement, warranty review, and service records.": "Reparatur, Austausch, Garantieprüfung und Serviceunterlagen koordinieren.",
        "Spare Parts &amp; Accessories": "Ersatzteile &amp; Zubehör",
        "Docking, batteries, cables, mounts, lighting, brackets, and field kits.": "Dockingstationen, Akkus, Kabel, Halterungen, Beleuchtung, Befestigungen und Field-Kits.",
        "Training &amp; Enablement": "Training &amp; Enablement",
        "Equip operators, engineers, integrators, and partners to use GYUTRON systems.": "Bediener, Ingenieure, Integratoren und Partner für den Einsatz von GYUTRON-Systemen befähigen.",
        "Operator Training": "Bedienerschulung",
        "Practical device use, scanning workflows, inspection steps, and care routines.": "Praxisnaher Geräteeinsatz, Scan-Workflows, Prüfschritte und Pflegeabläufe.",
        "Engineer Training": "Engineering-Schulung",
        "Configuration, troubleshooting, integration, and data capture practices.": "Konfiguration, Fehlersuche, Integration und Datenerfassung in der Praxis.",
        "Partner Certification": "Partnerzertifizierung",
        "Enable integrators and channels to specify, deploy, and support solutions.": "Integratoren und Vertriebspartner zur Spezifikation, Einführung und Betreuung von Lösungen befähigen.",
        "Documentation Library": "Dokumentationsbibliothek",
        "Manuals, guides, checklists, and technical notes for deployment teams.": "Handbücher, Leitfäden, Checklisten und technische Hinweise für Einführungsteams.",
        "Partner Programs": "Partnerprogramme",
        "Work with GYUTRON as an integrator, OEM, channel, or solution partner.": "Zusammenarbeit mit GYUTRON als Integrator, OEM, Vertriebskanal oder Lösungspartner.",
        "System Integrators": "Systemintegratoren",
        "Build inspection, sensing, scanning, and data capture systems around customer sites.": "Prüf-, Sensor-, Scan- und Datenerfassungssysteme für Kundenstandorte aufbauen.",
        "OEM / Machine Builders": "OEM / Maschinenbauer",
        "Embed vision, code reading, sensors, and rugged interfaces into machines.": "Vision, Codelesen, Sensorik und robuste Schnittstellen in Maschinen integrieren.",
        "Channel Partners": "Channel-Partner",
        "Deliver local specification, procurement, training, and support coverage.": "Lokale Spezifikation, Beschaffung, Schulung und Supportabdeckung bereitstellen.",
        "Customization Programs": "Individualisierungsprogramme",
        "About GYUTRON": "Über GYUTRON",
        "Industrial intelligence hardware built for factories, logistics, and field operations.": "Industrial-Intelligence-Hardware für Fertigung, Logistik und Feldeinsätze.",
        "Who We Are": "Wer wir sind",
        "GYUTRON designs rugged intelligent hardware for demanding industrial work.": "GYUTRON entwickelt robuste intelligente Hardware für anspruchsvolle Industriearbeit.",
        "Engineering Philosophy": "Engineering-Philosophie",
        "Practical systems that combine sensing, vision, mobility, and edge control.": "Praxisnahe Systeme, die Sensorik, Vision, Mobilität und Edge Control verbinden.",
        "Contact &amp; Locations": "Kontakt &amp; Standorte",
        "Reach the team for project, product, partner, and support discussions.": "Kontakt für Projekt-, Produkt-, Partner- und Supportanfragen.",
        "Global Supply &amp; Service": "Globale Lieferung &amp; Service",
        "Structured procurement, configuration, delivery, and lifecycle support planning.": "Strukturierte Planung für Beschaffung, Konfiguration, Lieferung und Lifecycle-Support.",
        "Innovation &amp; Engineering": "Innovation &amp; Engineering",
        "Vision labs, embedded systems, rugged design, and industrial integration capability.": "Vision-Labore, Embedded-Systeme, robustes Design und industrielle Integrationskompetenz.",
        "R&amp;D Capability": "F&amp;E-Kompetenz",
        "Prototype and refine industrial hardware, sensing, and machine vision concepts.": "Industrielle Hardware-, Sensorik- und Machine-Vision-Konzepte prototypisieren und verfeinern.",
        "Industrial Design": "Industriedesign",
        "Rugged housings, mounting, accessories, power, and operator ergonomics.": "Robuste Gehäuse, Montage, Zubehör, Stromversorgung und Bedienerergonomie.",
        "Embedded Software": "Embedded Software",
        "Device logic, data capture, connectivity, workflow, and edge integration.": "Gerätelogik, Datenerfassung, Konnektivität, Workflow und Edge-Integration.",
        "Vision Lab": "Vision Lab",
        "Lighting, optics, camera selection, defect studies, and inspection feasibility.": "Beleuchtung, Optik, Kameraauswahl, Fehlerstudien und Prüfbarkeit.",
        "Quality &amp; Responsibility": "Qualität &amp; Verantwortung",
        "Reliability, compliance readiness, secure data flows, and responsible automation.": "Zuverlässigkeit, Compliance-Bereitschaft, sichere Datenflüsse und verantwortungsvolle Automatisierung.",
        "Quality Management": "Qualitätsmanagement",
        "Documented controls for inspection, configuration, delivery, and service.": "Dokumentierte Kontrollen für Prüfung, Konfiguration, Lieferung und Service.",
        "Reliability Testing": "Zuverlässigkeitsprüfung",
        "Validate devices for industrial vibration, handling, power, and environmental demands.": "Geräte für industrielle Vibration, Handling, Stromversorgung und Umweltanforderungen validieren.",
        "Cybersecurity &amp; Data": "Cybersecurity &amp; Daten",
        "Support controlled device deployment and responsible operational data capture.": "Kontrollierte Gerätebereitstellung und verantwortungsvolle Betriebsdatenerfassung unterstützen.",
        "Responsible Automation": "Verantwortungsvolle Automatisierung",
        "Design automation around safety, productivity, maintainability, and operator value.": "Automatisierung auf Sicherheit, Produktivität, Wartbarkeit und Bedienernutzen ausrichten.",
        "Industrial intelligent hardware, vision, sensors, rugged PDA terminals, and connected automation systems.": "Industrielle intelligente Hardware, Bildverarbeitung, Sensorik, robuste PDA-Terminals und vernetzte Automatisierungssysteme.",
        "Industrial intelligent hardware for manufacturing, logistics, inspection, and connected operations.": "Industrielle intelligente Hardware für Fertigung, Logistik, Prüfung und vernetzte Betriebsabläufe.",
        "Fast 1D / 2D scan engines for receiving, picking, and line-side verification.": "Schnelle 1D-/2D-Scanmodule für Wareneingang, Kommissionierung und Linienverifikation.",
        "Laser displacement and ultrasonic distance sensors for gap, level, and position checks.": "Laser-Wegsensoren und Ultraschall-Distanzsensoren für Spalt-, Füllstands- und Positionsprüfungen.",
        "Pressure, temperature, humidity, vibration, and IO diagnostics for uptime visibility.": "Druck-, Temperatur-, Feuchte-, Vibrations- und I/O-Diagnostik für transparente Anlagenverfügbarkeit.",
        "Smart & Area Scan Cameras": "Smart- & Area-Scan-Kameras",
        "Controllers & 3D Vision": "Controller & 3D-Vision",
        "Vision controllers, line-scan systems, and 3D profile cameras for larger cells.": "Vision-Controller, Line-Scan-Systeme und 3D-Profilkameras für größere Prüfzellen.",
        "Measurement, surface review, code grading, calibration, and maintenance tools.": "Messung, Oberflächenprüfung, Code-Bewertung, Kalibrierung und Wartungswerkzeuge.",
        "Dimensional Gauges": "Maßprüfgeräte",
        "Measurement tools for checking geometry, alignment, and repeatable production tolerances.": "Messwerkzeuge für Geometrie, Ausrichtung und wiederholgenaue Produktionstoleranzen.",
        "Surface Inspection": "Oberflächenprüfung",
        "Detect visual defects, finish issues, scratches, and inconsistent material conditions.": "Sichtbare Fehler, Finish-Abweichungen, Kratzer und Materialunregelmäßigkeiten erkennen.",
        "Portable Testers": "Portable Tester",
        "Handheld and bench tools for maintenance teams and quality engineers.": "Hand- und Tischgeräte für Instandhaltungsteams und Qualitätsingenieure.",
        "Calibration Tools": "Kalibrierwerkzeuge",
        "Support consistent measurement, setup verification, and lifecycle documentation.": "Unterstützt konsistente Messung, Einrichtungsprüfung und Lifecycle-Dokumentation.",
        "Robot Workcells": "Roboter-Arbeitszellen",
        "Collaborative robot stations for loading, inspection, sorting, and assembly.": "Kollaborative Roboterstationen für Beladen, Prüfen, Sortieren und Montieren.",
        "Edge Controllers": "Edge-Controller",
        "Industrial computing for device orchestration and data acquisition.": "Industrielle Computertechnik für Geräteorchestrierung und Datenerfassung.",
        "Accessories": "Zubehör",
        "Docking, cables, brackets, lighting, and mounting hardware.": "Dockingstationen, Kabel, Halterungen, Beleuchtung und Montagehardware.",
        "Machine vision, embedded control, traceability, and mobile data capture packaged around factory workflows.": "Machine Vision, Embedded Control, Rückverfolgbarkeit und mobile Datenerfassung als Lösungen für konkrete Fabrikprozesse.",
        "Inline visual inspection, code verification, dimensional checks, and robotic final inspection.": "Inline-Bildprüfung, Code-Verifikation, Maßprüfung und robotergestützte Endkontrolle.",
        "2D / 3D Optical Inspection": "Optische 2D-/3D-Prüfung",
        "Use smart cameras and 3D vision to check parts, assemblies, and visible defects at production speed.": "Smart-Kameras und 3D-Vision prüfen Teile, Baugruppen und sichtbare Fehler im Produktionstakt.",
        "Code Reading & Traceability": "Codelesen & Rückverfolgbarkeit",
        "Measure key features and detect scratches, stains, cracks, or finish variation.": "Kritische Merkmale messen und Kratzer, Flecken, Risse oder Finish-Abweichungen erkennen.",
        "Robotic Final Inspection": "Robotergestützte Endprüfung",
        "Combine robot motion, cameras, lighting, and sensors for multi-side final checks.": "Roboterbewegung, Kameras, Beleuchtung und Sensoren für mehrseitige Endprüfungen kombinieren.",
        "Inspection and traceability support for compact, high-volume precision manufacturing.": "Prüf- und Rückverfolgbarkeitsunterstützung für kompakte Präzisionsfertigung mit hohem Durchsatz.",
        "SMT Line Inspection Support": "SMT-Linienprüfung",
        "Presence, polarity, solder-area, connector, and component-level checks around electronics lines.": "Anwesenheit, Polarität, Lötflächen, Steckverbinder und Bauteilebene rund um Elektroniklinien prüfen.",
        "Component Presence Verification": "Bauteil-Anwesenheitsprüfung",
        "Confirm pins, plates, terminals, labels, and fixtures before downstream processing.": "Pins, Platten, Klemmen, Etiketten und Vorrichtungen vor nachgelagerten Prozessen verifizieren.",
        "Packaging & Label Inspection": "Verpackungs- & Etikettenprüfung",
        "Validate labels, seals, cartons, serialization, and shipping identity.": "Etiketten, Siegel, Kartons, Serialisierung und Versandidentität validieren.",
        "Process Interlock": "Prozessverriegelung",
        "Use inspection results to reject, stop, or route products before defect leakage occurs.": "Prüfergebnisse nutzen, um Produkte vor Fehlerweitergabe auszuschleusen, zu stoppen oder umzuleiten.",
        "Industrial I/O & Sensor Networks": "Industrielle I/O- & Sensornetzwerke",
        "Connect presence sensors, measurement devices, safety signals, and process feedback.": "Anwesenheitssensoren, Messgeräte, Sicherheitssignale und Prozessrückmeldungen verbinden.",
        "Motion & Robot Cell Control": "Motion- & Roboterzellensteuerung",
        "Coordinate handling, inspection, sorting, and line-side automation cells.": "Handling, Prüfung, Sortierung und liniennahe Automatisierungszellen koordinieren.",
        "Lighting & Trigger Synchronization": "Beleuchtungs- & Trigger-Synchronisation",
        "Stabilize image capture with white-light illumination, triggers, and control timing.": "Bildaufnahme mit Weißlichtbeleuchtung, Triggern und Timing-Steuerung stabilisieren.",
        "Edge Data Acquisition": "Edge-Datenerfassung",
        "Collect machine events, inspection records, scans, and equipment status near the line.": "Maschinenereignisse, Prüfdaten, Scans und Anlagenstatus direkt an der Linie erfassen.",
        "Turn inspection events, device data, and scan records into operational visibility.": "Prüfereignisse, Gerätedaten und Scanprotokolle in operative Transparenz umwandeln.",
        "MES / WMS Integration": "MES-/WMS-Integration",
        "Move inspection results, scan events, and equipment records into factory systems.": "Prüfergebnisse, Scanereignisse und Anlagenprotokolle in Fabriksysteme übertragen.",
        "Quality Evidence Logging": "Qualitätsnachweis-Protokollierung",
        "Preserve image evidence, results, timestamps, and unit IDs for review and audits.": "Bildnachweise, Ergebnisse, Zeitstempel und Teile-IDs für Prüfungen und Audits sichern.",
        "Device & Fleet Management": "Geräte- & Flottenmanagement",
        "Standardize configuration, support, and updates across deployed hardware.": "Konfiguration, Support und Updates über eingesetzte Hardware hinweg standardisieren.",
        "Dashboard & Reporting": "Dashboards & Reporting",
        "Use production data to identify bottlenecks, yield shifts, and recurring quality risk.": "Produktionsdaten nutzen, um Engpässe, Yield-Verschiebungen und wiederkehrende Qualitätsrisiken zu erkennen.",
        "Receiving & Inventory": "Wareneingang & Inventur",
        "Digitize inbound checks, cycle counts, and stock accuracy workflows.": "Wareneingangsprüfungen, Zykluszählungen und Bestandsgenauigkeit digitalisieren.",
        "Picking & Dispatch": "Kommissionierung & Versand",
        "Guide warehouse teams with scan checks, task records, and shipping validation.": "Lagerteams mit Scanprüfungen, Aufgabenprotokollen und Versandvalidierung führen.",
        "Field Service Data Capture": "Datenerfassung im Field Service",
        "Capture service records, site evidence, parts usage, and return workflows in the field.": "Serviceprotokolle, Standortnachweise, Teileverbrauch und Rücklaufprozesse im Feld erfassen.",
        "Customize hardware, firmware, accessories, branding, and workflow packaging for partners.": "Hardware, Firmware, Zubehör, Branding und Workflow-Pakete für Partner anpassen.",
        "Manufacturing & Assembly": "Fertigung & Montage",
        "Vision, sensing, traceability, and rugged data capture for production lines.": "Bildverarbeitung, Sensorik, Rückverfolgbarkeit und robuste Datenerfassung für Produktionslinien.",
        "Automotive & EV": "Automotive & E-Mobilität",
        "Battery, powertrain, body, and final assembly inspection workflows.": "Prüfabläufe für Batterie, Antriebsstrang, Karosserie und Endmontage.",
        "Machinery & Metal Parts": "Maschinenbau & Metallteile",
        "Dimensional checks, surface inspection, part ID, and line-side verification.": "Maßprüfungen, Oberflächenprüfung, Teile-ID und Linienverifikation.",
        "Packaging & Consumer Goods": "Verpackung & Konsumgüter",
        "Label, seal, fill, code, carton, and end-of-line checks.": "Etiketten-, Siegel-, Füllstands-, Code-, Karton- und End-of-Line-Prüfungen.",
        "General Factory Automation": "Allgemeine Fabrikautomation",
        "Sensors, controllers, handheld terminals, and inspection cells for mixed production.": "Sensoren, Controller, Handheld-Terminals und Prüfzellen für gemischte Fertigung.",
        "Electronics & Semiconductors": "Elektronik & Halbleiter",
        "Inspection and identification for high-density precision manufacturing.": "Prüfung und Identifikation für hochdichte Präzisionsfertigung.",
        "PCB & SMT Production": "PCB- & SMT-Produktion",
        "Component presence, polarity, solder area, connector, and board-level traceability.": "Bauteilanwesenheit, Polarität, Lötbereiche, Steckverbinder und Traceability auf Leiterplattenebene.",
        "Semiconductor Packaging": "Halbleiter-Packaging",
        "Clean, precise visual checks for wafers, packages, trays, and micro features.": "Saubere, präzise Sichtprüfungen für Wafer, Packages, Trays und Mikrostrukturen.",
        "Connector & Cable Assemblies": "Steckverbinder- & Kabelbaugruppen",
        "Pin, terminal, crimp, housing, and code verification.": "Pin-, Klemmen-, Crimp-, Gehäuse- und Codeverifikation.",
        "Cleanroom Traceability": "Reinraum-Rückverfolgbarkeit",
        "Rugged identification, controlled data capture, and quality records.": "Robuste Identifikation, kontrollierte Datenerfassung und Qualitätsaufzeichnungen.",
        "Logistics & Field Operations": "Logistik & Feldeinsätze",
        "Warehousing & Distribution": "Lager & Distribution",
        "Receiving, picking, cycle counting, shipping, and location accuracy.": "Wareneingang, Kommissionierung, Zykluszählung, Versand und Standortgenauigkeit.",
        "Transportation & Courier": "Transport & Kurierdienste",
        "Parcel handoff, proof of delivery, cross-dock scanning, and route visibility.": "Paketübergabe, Liefernachweis, Cross-Dock-Scanning und Routentransparenz.",
        "Utilities & Field Service": "Versorger & Field Service",
        "Rugged data capture for inspection, maintenance, repair, and site records.": "Robuste Datenerfassung für Inspektion, Wartung, Reparatur und Standortprotokolle.",
        "Regulated & Process Industries": "Regulierte & prozessbasierte Branchen",
        "Quality evidence, inspection, code control, and compliance-ready workflows.": "Qualitätsnachweise, Prüfung, Codekontrolle und compliancefähige Workflows.",
        "Food & Beverage": "Lebensmittel & Getränke",
        "High-speed packaging, date code, fill, seal, label, and case inspection.": "Schnelle Prüfung von Verpackung, Datumscode, Füllung, Siegel, Etikett und Karton.",
        "Pharmaceutical & Medical Devices": "Pharma & Medizintechnik",
        "Clean production checks, serialization, device assembly, and label verification.": "Saubere Produktionsprüfungen, Serialisierung, Gerätemontage und Etikettenverifikation.",
        "Energy & Natural Resources": "Energie & Rohstoffe",
        "Inspection, measurement, asset visibility, and harsh-environment field records.": "Prüfung, Messung, Asset-Transparenz und Feldprotokolle für raue Umgebungen.",
        "Page ${activePage} of ${totalPages}": "Seite ${activePage} von ${totalPages}",
        "Pocketable 5-inch terminal for receiving, picking, stock counts, and line-side verification.": "Handliches 5-Zoll-Terminal für Wareneingang, Kommissionierung, Bestandszählung und Linienfreigabe.",
        "Balanced handheld computer for logistics teams that need scanning, camera capture, and fast roaming.": "Ausgewogener Handheld-Computer für Logistikteams mit Scan-, Kamera- und Roaming-Anforderungen.",
        "6-inch rugged terminal for mobile workflows with dense forms, WMS screens, and work instructions.": "Robustes 6-Zoll-Terminal für mobile Workflows mit Formularen, WMS-Masken und Arbeitsanweisungen.",
        "Physical keypad model for glove use, repetitive scan tasks, and high-throughput warehouse teams.": "Modell mit physischer Tastatur für Handschuhbedienung, wiederholte Scanaufgaben und hohe Lagerdurchsätze.",
        "Rugged handheld for freezer aisles, food logistics, pharmaceutical storage, and outdoor winter work.": "Robuster Handheld für Tiefkühlbereiche, Lebensmittellogistik, Pharmalager und Wintereinsätze im Freien.",
        "High-end field computer for utilities, yards, maintenance teams, and long-shift industrial operations.": "Hochwertiger Feldcomputer für Versorger, Außenlager, Instandhaltungsteams und lange Industrieschichten.",
        "Compact RFID terminal for retail cycle counts, light warehouse work, and asset verification.": "Kompaktes RFID-Terminal für Filialinventuren, leichte Lagerprozesse und Anlagenverifikation.",
        "Balanced pistol-grip reader for daily stock counts, pallet checks, and returns processing.": "Ausbalancierter Pistolengriff-Leser für tägliche Bestandszählungen, Palettenprüfungen und Retourenprozesse.",
        "High-power UHF handheld for warehouse aisles, dock doors, and bulk tag collection.": "Leistungsstarker UHF-Handheld für Lagergänge, Verladerampen und Massenerfassung von Tags.",
        "Connected RFID computer for field asset teams that need wide-area data sync and secure Android apps.": "Vernetzter RFID-Computer für Asset-Teams im Feld mit standortübergreifender Datensynchronisierung und sicheren Android-Apps.",
        "Compact Android PDA": "Kompaktes Android-PDA",
        "All-purpose PDA": "Universelles PDA",
        "Large-screen PDA": "PDA mit großem Display",
        "Keypad PDA": "PDA mit Tastatur",
        "Cold-chain PDA": "Kühlketten-PDA",
        "Ultra-rugged PDA": "Ultra-robustes PDA",
        "Built-in UHF PDA": "PDA mit integriertem UHF",
        "Ergonomic RFID reader": "Ergonomischer RFID-Leser",
        "Long-range RFID reader": "RFID-Leser mit großer Reichweite",
        "5G RFID terminal": "5G-RFID-Terminal",
        "Universal wired scanner": "Universeller kabelgebundener Scanner",
        "Wireless industrial scanner": "Kabelloser Industriescanner",
        "Cold-chain scanner": "Kühlketten-Scanner",
        "Extended-range scanner": "Scanner mit erweiterter Reichweite",
        "Hands-free scan station": "Freihand-Scanstation",
        "Wearable ring scanner": "Tragbarer Ringscanner",
        "Industrial dock-door scanner": "Industrieller Rampenscanner",
        "Photoelectric sensor": "Lichttaster",
        "Inductive proximity sensor": "Induktiver Näherungssensor",
        "Laser displacement sensor": "Laser-Wegsensor",
        "Internal antenna": "Interne Antenne",
        "Circular antenna": "Zirkularantenne",
        "Presentation mode": "Präsentationsmodus",
        "White LED": "Weiße LED",
        "Fast decode": "Schnelles Decoding",
        "Batch memory": "Batch-Speicher",
        "Cradle": "Ladestation",
        "Anti-condensation": "Antikondensation",
        "Glove grip": "Handschuhgriff",
        "Long range": "Große Reichweite",
        "Laser aimer": "Laserzielhilfe",
        "Warehouse": "Lager",
        "Auto trigger": "Auto-Trigger",
        "Fixture-ready": "Vorrichtungsfähig",
        "White light": "Weißlicht",
        "Wearable": "Tragbar",
        "Hands-free": "Freihand",
        "Dock door": "Verladerampe",
        "Conveyor": "Fördertechnik",
        "Ethernet": "Ethernet",
        "Inventory": "Inventur",
        "Starter kit": "Starterkit",
        "Asset tracking": "Asset Tracking",
        "Bulk count": "Massenerfassung",
        "Traceability": "Rückverfolgbarkeit",
        "Quality": "Qualität",
        "Fast setup": "Schnelle Einrichtung",
        "Flush mount": "Bündige Montage",
        "High repeatability": "Hohe Wiederholgenauigkeit",
        "Machine tools": "Werkzeugmaschinen",
        "Laser position": "Laserposition",
        "Analog output": "Analogausgang",
        "Gap check": "Spaltprüfung",
        "Tiny targets": "Kleine Zielobjekte",
        "Teach button": "Teach-Taste",
        "Cabinet health": "Schaltschrankzustand",
        "Condition data": "Zustandsdaten",
        "Level": "Füllstand",
        "Clear objects": "Transparente Objekte",
        "Dust tolerant": "Staubtolerant",
        "Machine safety": "Maschinensicherheit",
        "Alignment aid": "Ausrichthilfe",
        "Diagnostics": "Diagnose",
        "Teach setup": "Teach-Einrichtung",
        "Compact body": "Kompaktes Gehäuse",
        "Global shutter": "Global Shutter",
        "Color inspection": "Farbprüfung",
        "Label checks": "Etikettenprüfung",
        "Defects": "Fehlerbilder",
        "Mono sensor": "Monosensor",
        "Edge contrast": "Kantenkontrast",
        "PLC ready": "SPS-fähig",
        "High resolution": "Hohe Auflösung",
        "Fine detail": "Feindetails",
        "Print quality": "Druckqualität",
        "Height check": "Höhenprüfung",
        "High read rate": "Hohe Leserate",
        "Wide range": "Großer Bereich",
        "Robot cells": "Roboterzellen",
        "Rack mount": "Rackmontage",
        "Cell wiring": "Zellenverdrahtung",
        "High bandwidth": "Hohe Bandbreite",
        "Low contrast": "Niedriger Kontrast",
        "Wide field": "Großes Sichtfeld",
        "Code grading": "Code-Bewertung",
        "Inline QA": "Inline-QS",
        "Audit trail": "Audit Trail",
        "Tunnel read": "Tunnellesung",
        "Ring light": "Ringlicht",
        "Lens mount": "Objektivaufnahme",
        "Bar light": "Balkenlicht",
        "Side lighting": "Seitenlicht",
        "Low glare": "Geringe Blendung",
        "Backlight": "Durchlicht",
        "Silhouette": "Silhouette",
        "Print check": "Druckprüfung",
        "High output": "Hohe Leistung",
        "Strobe control": "Stroboskopsteuerung",
        "Multi-light": "Mehrlicht",
        "Low distortion": "Geringe Verzeichnung",
        "Dimensional": "Maßprüfung",
        "Fixture ready": "Vorrichtungsbereit",
        "Roughness": "Rauheit",
        "Machining": "Bearbeitung",
        "Code quality": "Codequalität",
        "Reports": "Berichte",
        "Coatings": "Beschichtungen",
        "Finish control": "Oberflächenkontrolle",
        "Paint": "Lack",
        "Incoming QC": "Wareneingangsprüfung",
        "Loop check": "Schleifenprüfung",
        "Commissioning": "Inbetriebnahme",
        "Vision setup": "Vision-Setup",
        "Grid target": "Kalibriergitter",
        "Gauge blocks": "Endmaße",
        "Probe check": "Tasterprüfung",
        "Fixture setup": "Vorrichtungseinrichtung",
        "Light reference": "Lichtreferenz",
        "White balance": "Weißabgleich",
        "Vision QA": "Vision-QS",
    },
    "ja": {
        "Product Line": "製品ライン",
        "Model Comparison": "モデル比較",
        "Fast shortlist for industrial buying teams.": "産業機器の購買・技術チーム向けに、候補機種をすばやく絞り込めます。",
        "Need a sample, quotation, or OEM version?": "サンプル、見積、OEM仕様の相談が必要ですか？",
        "Send your application, environment, scan distance, network requirement, and target quantity. GYUTRON will recommend a hardware stack and pilot path.": "用途、使用環境、読み取り距離、ネットワーク要件、予定数量をお知らせください。GYUTRONが最適なハードウェア構成と評価導入の進め方をご提案します。",
        "Industrial intelligent hardware for mobile data capture, RFID, machine vision, sensing, and connected automation.": "モバイルデータ収集、RFID、マシンビジョン、センシング、連携自動化に対応する産業用インテリジェントハードウェア。",
        "Electronics Manufacturing": "電子機器製造",
        "Manufacturing Intelligence": "製造インテリジェンス",
        "<h4>Contact</h4>": "<h4>お問い合わせ</h4>",
        "All rights reserved.": "無断転載を禁じます。",
        "Automation / Vision / Innovation": "自動化 / 画像処理 / イノベーション",
        "Rugged handheld terminals for barcode, NFC, inventory, and field data capture.": "バーコード、NFC、棚卸、現場データ収集に対応する堅牢ハンドヘルド端末。",
        "Share your use case and get recommended device, accessory, and integration options.": "用途を共有いただければ、端末・アクセサリ・連携方式の推奨構成をご提案します。",
        "Presence &amp; Object Detection": "有無・物体検出",
        "Photoelectric, inductive, fiber, ultrasonic, and safety sensing for factory detection tasks.": "工場の検出用途に対応する光電、近接、ファイバ、超音波、安全センサー。",
        "Distance &amp; Position": "距離・位置",
        "Process &amp; Condition": "工程・状態監視",
        "Smart cameras, code readers, 3D vision, controllers, and lighting accessories.": "スマートカメラ、コードリーダー、3Dビジョン、コントローラ、照明アクセサリ。",
        "Code Reading &amp; Verification": "コード読み取り・検証",
        "Fixed readers, DPM scanners, and verifiers for traceability and code quality.": "トレーサビリティとコード品質管理に対応する固定式リーダー、DPMスキャナー、検証機。",
        "Vision Lighting": "画像処理照明",
        "White-light ring, bar, and dome lighting for stable machine vision images.": "安定した画像取得を支える白色リング照明、バー照明、ドーム照明。",
        "Track pallets, tools, equipment, and production assets with rugged RFID devices.": "堅牢RFIDデバイスでパレット、工具、設備、生産資産を追跡します。",
        "Track pallets, tools, work-in-process, containers, and returnable assets.": "パレット、工具、仕掛品、コンテナ、通い箱を追跡します。",
        "Smart cameras": "スマートカメラ",
        "Official Store: shop.gyutron.com": "公式ストア: shop.gyutron.com",
        "Support Center": "サポートセンター",
        "Search product": "製品を検索",
        "Smart &amp; Area Scan Cameras": "スマート・エリアスキャンカメラ",
        "Code Reading &amp; Traceability": "コード読取・トレーサビリティ",
        "Packaging &amp; Label Inspection": "包装・ラベル検査",
        "Lighting &amp; Trigger Synchronization": "照明・トリガー同期",
        "Device &amp; Fleet Management": "デバイス・フリート管理",
        "Receiving &amp; Inventory": "入荷・棚卸",
        "Picking &amp; Dispatch": "ピッキング・出荷",
        "Manufacturing &amp; Assembly": "製造・組立",
        "Machinery &amp; Metal Parts": "機械・金属部品",
        "Packaging &amp; Consumer Goods": "包装・消費財",
        "Electronics &amp; Semiconductors": "電子機器・半導体",
        "Connector &amp; Cable Assemblies": "コネクタ・ケーブル組立",
        "Logistics &amp; Field Operations": "物流・現場業務",
        "Warehousing &amp; Distribution": "倉庫・配送",
        "Transportation &amp; Courier": "輸送・宅配",
        "Utilities &amp; Field Service": "インフラ・フィールドサービス",
        "Regulated &amp; Process Industries": "規制対応・プロセス産業",
        "Food &amp; Beverage": "食品・飲料",
        "Pharmaceutical &amp; Medical Devices": "医薬品・医療機器",
        "Energy &amp; Natural Resources": "エネルギー・天然資源",
        "Cold Chain &amp; Compliance": "コールドチェーン・コンプライアンス",
        "Capture lot, temperature, barcode, and inspection evidence across operations.": "ロット、温度、バーコード、検査エビデンスを工程横断で記録します。",
        "Customer Success": "カスタマーサクセス",
        "Plan the right deployment path from first workflow review to scale-up.": "初回の業務確認から本格展開まで、適切な導入ステップを計画します。",
        "Solution Consulting": "ソリューション相談",
        "Map line constraints, data requirements, devices, and integration priorities.": "ライン制約、データ要件、デバイス、連携優先度を整理します。",
        "Pilot &amp; Proof of Concept": "パイロット・概念実証",
        "Validate inspection, scanning, and traceability before full rollout.": "本格展開前に検査、スキャン、トレーサビリティを検証します。",
        "Deployment Planning": "導入計画",
        "Coordinate hardware, accessories, operator workflow, and acceptance criteria.": "ハードウェア、アクセサリ、作業者フロー、受入基準を調整します。",
        "ROI &amp; Process Review": "ROI・工程レビュー",
        "Estimate throughput, labor impact, defect reduction, and operational risk.": "処理能力、作業負荷、不良削減、運用リスクを見積もります。",
        "Services &amp; Lifecycle Support": "サービス・ライフサイクルサポート",
        "Keep industrial hardware, vision systems, and mobile fleets running.": "産業用ハードウェア、画像処理システム、モバイル端末群の安定稼働を支援します。",
        "Technical Support": "技術サポート",
        "Help for setup, accessories, configuration, and deployment issues.": "セットアップ、アクセサリ、設定、導入時の課題を支援します。",
        "Preventive Maintenance": "予防保全",
        "Support uptime with inspection plans, spares, and service readiness.": "点検計画、予備品、サービス体制で稼働率を支えます。",
        "Repair &amp; RMA": "修理・RMA",
        "Coordinate device repair, replacement, warranty review, and service records.": "端末修理、交換、保証確認、サービス記録を管理します。",
        "Spare Parts &amp; Accessories": "予備部品・アクセサリ",
        "Docking, batteries, cables, mounts, lighting, brackets, and field kits.": "ドッキング、バッテリー、ケーブル、マウント、照明、ブラケット、現場キット。",
        "Training &amp; Enablement": "トレーニング・活用支援",
        "Equip operators, engineers, integrators, and partners to use GYUTRON systems.": "作業者、技術者、インテグレータ、パートナーがGYUTRONシステムを使いこなせるよう支援します。",
        "Operator Training": "作業者トレーニング",
        "Practical device use, scanning workflows, inspection steps, and care routines.": "端末操作、スキャン手順、検査ステップ、日常管理を実践的に学びます。",
        "Engineer Training": "技術者トレーニング",
        "Configuration, troubleshooting, integration, and data capture practices.": "設定、トラブルシュート、連携、データ収集の実務を扱います。",
        "Partner Certification": "パートナー認定",
        "Enable integrators and channels to specify, deploy, and support solutions.": "インテグレータと販売チャネルが仕様化、導入、サポートできる体制を整えます。",
        "Documentation Library": "ドキュメントライブラリ",
        "Manuals, guides, checklists, and technical notes for deployment teams.": "導入チーム向けのマニュアル、ガイド、チェックリスト、技術資料。",
        "Partner Programs": "パートナープログラム",
        "Work with GYUTRON as an integrator, OEM, channel, or solution partner.": "インテグレータ、OEM、販売チャネル、ソリューションパートナーとしてGYUTRONと連携します。",
        "System Integrators": "システムインテグレータ",
        "Build inspection, sensing, scanning, and data capture systems around customer sites.": "顧客現場に合わせた検査、センシング、スキャン、データ収集システムを構築します。",
        "OEM / Machine Builders": "OEM / 装置メーカー",
        "Embed vision, code reading, sensors, and rugged interfaces into machines.": "画像処理、コード読取、センサー、堅牢インターフェースを装置に組み込みます。",
        "Channel Partners": "チャネルパートナー",
        "Deliver local specification, procurement, training, and support coverage.": "地域での仕様策定、調達、トレーニング、サポートを提供します。",
        "Customization Programs": "カスタマイズプログラム",
        "About GYUTRON": "GYUTRONについて",
        "Industrial intelligence hardware built for factories, logistics, and field operations.": "工場、物流、現場業務のために設計された産業用インテリジェンスハードウェア。",
        "Who We Are": "私たちについて",
        "GYUTRON designs rugged intelligent hardware for demanding industrial work.": "GYUTRONは、厳しい産業現場に向けた堅牢なインテリジェントハードウェアを設計しています。",
        "Engineering Philosophy": "エンジニアリング思想",
        "Practical systems that combine sensing, vision, mobility, and edge control.": "センシング、画像処理、モビリティ、エッジ制御を組み合わせた実用的なシステム。",
        "Contact &amp; Locations": "お問い合わせ・拠点",
        "Reach the team for project, product, partner, and support discussions.": "プロジェクト、製品、パートナー、サポートに関する相談窓口です。",
        "Global Supply &amp; Service": "グローバル供給・サービス",
        "Structured procurement, configuration, delivery, and lifecycle support planning.": "調達、構成、納品、ライフサイクルサポートを体系的に計画します。",
        "Innovation &amp; Engineering": "イノベーション・エンジニアリング",
        "Vision labs, embedded systems, rugged design, and industrial integration capability.": "画像処理ラボ、組込みシステム、堅牢設計、産業連携の開発力。",
        "R&amp;D Capability": "研究開発力",
        "Prototype and refine industrial hardware, sensing, and machine vision concepts.": "産業用ハードウェア、センシング、マシンビジョンの構想を試作・改良します。",
        "Industrial Design": "産業デザイン",
        "Rugged housings, mounting, accessories, power, and operator ergonomics.": "堅牢筐体、取付、アクセサリ、電源、作業者エルゴノミクス。",
        "Embedded Software": "組込みソフトウェア",
        "Device logic, data capture, connectivity, workflow, and edge integration.": "デバイスロジック、データ収集、接続性、ワークフロー、エッジ連携。",
        "Vision Lab": "ビジョンラボ",
        "Lighting, optics, camera selection, defect studies, and inspection feasibility.": "照明、光学、カメラ選定、欠陥検証、検査可能性評価。",
        "Quality &amp; Responsibility": "品質・責任",
        "Reliability, compliance readiness, secure data flows, and responsible automation.": "信頼性、規制対応準備、安全なデータフロー、責任ある自動化。",
        "Quality Management": "品質管理",
        "Documented controls for inspection, configuration, delivery, and service.": "検査、構成、納品、サービスに関する文書化された管理。",
        "Reliability Testing": "信頼性試験",
        "Validate devices for industrial vibration, handling, power, and environmental demands.": "産業環境の振動、取扱い、電源、環境要求に対して端末を検証します。",
        "Cybersecurity &amp; Data": "サイバーセキュリティ・データ",
        "Support controlled device deployment and responsible operational data capture.": "管理された端末導入と責任ある運用データ収集を支援します。",
        "Responsible Automation": "責任ある自動化",
        "Design automation around safety, productivity, maintainability, and operator value.": "安全性、生産性、保守性、作業者価値を軸に自動化を設計します。",
        "Industrial intelligent hardware, vision, sensors, rugged PDA terminals, and connected automation systems.": "産業用インテリジェントハードウェア、画像処理、センサー、堅牢PDA端末、連携自動化システム。",
        "Industrial intelligent hardware for manufacturing, logistics, inspection, and connected operations.": "製造、物流、検査、連携運用に向けた産業用インテリジェントハードウェア。",
        "Fast 1D / 2D scan engines for receiving, picking, and line-side verification.": "入荷、ピッキング、ラインサイド照合に対応する高速1D/2Dスキャンエンジン。",
        "Laser displacement and ultrasonic distance sensors for gap, level, and position checks.": "ギャップ、レベル、位置確認に対応するレーザー変位センサーと超音波距離センサー。",
        "Pressure, temperature, humidity, vibration, and IO diagnostics for uptime visibility.": "稼働状態の可視化に向けた圧力、温度、湿度、振動、I/O診断。",
        "Smart & Area Scan Cameras": "スマート・エリアスキャンカメラ",
        "Controllers & 3D Vision": "コントローラ・3Dビジョン",
        "Vision controllers, line-scan systems, and 3D profile cameras for larger cells.": "大型検査セル向けのビジョンコントローラ、ラインスキャンシステム、3Dプロファイルカメラ。",
        "Measurement, surface review, code grading, calibration, and maintenance tools.": "測定、表面確認、コード評価、校正、保全ツール。",
        "Dimensional Gauges": "寸法測定機器",
        "Measurement tools for checking geometry, alignment, and repeatable production tolerances.": "形状、位置合わせ、量産時の繰返し公差確認に対応する測定ツール。",
        "Surface Inspection": "表面検査",
        "Detect visual defects, finish issues, scratches, and inconsistent material conditions.": "外観欠陥、仕上げ不良、傷、材質ばらつきを検出します。",
        "Portable Testers": "ポータブルテスター",
        "Handheld and bench tools for maintenance teams and quality engineers.": "保全チームと品質技術者向けのハンドヘルドおよびベンチトップツール。",
        "Calibration Tools": "校正ツール",
        "Support consistent measurement, setup verification, and lifecycle documentation.": "安定した測定、セットアップ確認、ライフサイクル記録を支援します。",
        "Robot Workcells": "ロボットワークセル",
        "Collaborative robot stations for loading, inspection, sorting, and assembly.": "投入、検査、仕分け、組立に対応する協働ロボットステーション。",
        "Edge Controllers": "エッジコントローラ",
        "Industrial computing for device orchestration and data acquisition.": "デバイス制御とデータ収集に対応する産業用コンピューティング。",
        "Accessories": "アクセサリ",
        "Docking, cables, brackets, lighting, and mounting hardware.": "ドッキング、ケーブル、ブラケット、照明、取付ハードウェア。",
        "Machine vision, embedded control, traceability, and mobile data capture packaged around factory workflows.": "マシンビジョン、組込み制御、トレーサビリティ、モバイルデータ収集を工場ワークフロー単位で構成します。",
        "Inline visual inspection, code verification, dimensional checks, and robotic final inspection.": "インライン外観検査、コード検証、寸法確認、ロボット最終検査。",
        "2D / 3D Optical Inspection": "2D/3D光学検査",
        "Use smart cameras and 3D vision to check parts, assemblies, and visible defects at production speed.": "スマートカメラと3Dビジョンで、部品、組立状態、外観欠陥を生産速度で確認します。",
        "Code Reading & Traceability": "コード読取・トレーサビリティ",
        "Measure key features and detect scratches, stains, cracks, or finish variation.": "重要寸法を測定し、傷、汚れ、割れ、仕上げばらつきを検出します。",
        "Robotic Final Inspection": "ロボット最終検査",
        "Combine robot motion, cameras, lighting, and sensors for multi-side final checks.": "ロボット動作、カメラ、照明、センサーを組み合わせ、多面の最終確認を行います。",
        "Inspection and traceability support for compact, high-volume precision manufacturing.": "小型・高密度・高量産の精密製造に向けた検査とトレーサビリティ支援。",
        "SMT Line Inspection Support": "SMTライン検査支援",
        "Presence, polarity, solder-area, connector, and component-level checks around electronics lines.": "電子機器ラインでの有無、極性、はんだ領域、コネクタ、部品レベルの確認。",
        "Component Presence Verification": "部品有無確認",
        "Confirm pins, plates, terminals, labels, and fixtures before downstream processing.": "後工程前にピン、プレート、端子、ラベル、治具を確認します。",
        "Packaging & Label Inspection": "包装・ラベル検査",
        "Validate labels, seals, cartons, serialization, and shipping identity.": "ラベル、シール、カートン、シリアル番号、出荷識別を検証します。",
        "Process Interlock": "工程インターロック",
        "Use inspection results to reject, stop, or route products before defect leakage occurs.": "検査結果に基づき、不良流出前に排出、停止、分岐を制御します。",
        "Industrial I/O & Sensor Networks": "産業用I/O・センサーネットワーク",
        "Connect presence sensors, measurement devices, safety signals, and process feedback.": "有無センサー、測定機器、安全信号、工程フィードバックを接続します。",
        "Motion & Robot Cell Control": "モーション・ロボットセル制御",
        "Coordinate handling, inspection, sorting, and line-side automation cells.": "搬送、検査、仕分け、ラインサイド自動化セルを連携制御します。",
        "Lighting & Trigger Synchronization": "照明・トリガー同期",
        "Stabilize image capture with white-light illumination, triggers, and control timing.": "白色照明、トリガー、制御タイミングで画像取得を安定化します。",
        "Edge Data Acquisition": "エッジデータ収集",
        "Collect machine events, inspection records, scans, and equipment status near the line.": "ライン近傍で機械イベント、検査記録、スキャン、設備状態を収集します。",
        "Turn inspection events, device data, and scan records into operational visibility.": "検査イベント、デバイスデータ、スキャン記録を運用可視化につなげます。",
        "MES / WMS Integration": "MES/WMS連携",
        "Move inspection results, scan events, and equipment records into factory systems.": "検査結果、スキャンイベント、設備記録を工場システムへ連携します。",
        "Quality Evidence Logging": "品質エビデンス記録",
        "Preserve image evidence, results, timestamps, and unit IDs for review and audits.": "レビューや監査に備え、画像エビデンス、結果、時刻、個体IDを保存します。",
        "Device & Fleet Management": "デバイス・フリート管理",
        "Standardize configuration, support, and updates across deployed hardware.": "導入済みハードウェアの設定、サポート、更新を標準化します。",
        "Dashboard & Reporting": "ダッシュボード・レポート",
        "Use production data to identify bottlenecks, yield shifts, and recurring quality risk.": "生産データからボトルネック、歩留まり変動、反復する品質リスクを把握します。",
        "Receiving & Inventory": "入荷・棚卸",
        "Digitize inbound checks, cycle counts, and stock accuracy workflows.": "入荷確認、循環棚卸、在庫精度管理をデジタル化します。",
        "Picking & Dispatch": "ピッキング・出荷",
        "Guide warehouse teams with scan checks, task records, and shipping validation.": "スキャン確認、作業記録、出荷検証で倉庫チームを支援します。",
        "Field Service Data Capture": "フィールドサービスデータ収集",
        "Capture service records, site evidence, parts usage, and return workflows in the field.": "現場でサービス記録、作業証跡、部品使用、返却フローを記録します。",
        "Customize hardware, firmware, accessories, branding, and workflow packaging for partners.": "パートナー向けにハードウェア、ファームウェア、アクセサリ、ブランド、ワークフロー構成をカスタマイズします。",
        "Manufacturing & Assembly": "製造・組立",
        "Vision, sensing, traceability, and rugged data capture for production lines.": "生産ライン向けの画像処理、センシング、トレーサビリティ、堅牢データ収集。",
        "Automotive & EV": "自動車・EV",
        "Battery, powertrain, body, and final assembly inspection workflows.": "バッテリー、パワートレイン、車体、最終組立の検査ワークフロー。",
        "Machinery & Metal Parts": "機械・金属部品",
        "Dimensional checks, surface inspection, part ID, and line-side verification.": "寸法確認、表面検査、部品ID、ラインサイド照合。",
        "Packaging & Consumer Goods": "包装・消費財",
        "Label, seal, fill, code, carton, and end-of-line checks.": "ラベル、シール、充填、コード、カートン、最終工程の確認。",
        "General Factory Automation": "一般工場自動化",
        "Sensors, controllers, handheld terminals, and inspection cells for mixed production.": "混流生産向けのセンサー、コントローラ、ハンドヘルド端末、検査セル。",
        "Electronics & Semiconductors": "電子機器・半導体",
        "Inspection and identification for high-density precision manufacturing.": "高密度精密製造に向けた検査と識別。",
        "PCB & SMT Production": "PCB・SMT生産",
        "Component presence, polarity, solder area, connector, and board-level traceability.": "部品有無、極性、はんだ領域、コネクタ、基板単位トレーサビリティ。",
        "Semiconductor Packaging": "半導体パッケージング",
        "Clean, precise visual checks for wafers, packages, trays, and micro features.": "ウェハ、パッケージ、トレイ、微細形状に対応する清浄で高精度な外観確認。",
        "Connector & Cable Assemblies": "コネクタ・ケーブル組立",
        "Pin, terminal, crimp, housing, and code verification.": "ピン、端子、圧着、ハウジング、コードの検証。",
        "Cleanroom Traceability": "クリーンルーム・トレーサビリティ",
        "Rugged identification, controlled data capture, and quality records.": "堅牢な識別、管理されたデータ収集、品質記録。",
        "Logistics & Field Operations": "物流・現場業務",
        "Warehousing & Distribution": "倉庫・配送",
        "Receiving, picking, cycle counting, shipping, and location accuracy.": "入荷、ピッキング、循環棚卸、出荷、ロケーション精度。",
        "Transportation & Courier": "輸送・宅配",
        "Parcel handoff, proof of delivery, cross-dock scanning, and route visibility.": "荷物引き渡し、配達証明、クロスドック読取、ルート可視化。",
        "Utilities & Field Service": "インフラ・フィールドサービス",
        "Rugged data capture for inspection, maintenance, repair, and site records.": "点検、保全、修理、現場記録に対応する堅牢データ収集。",
        "Regulated & Process Industries": "規制対応・プロセス産業",
        "Quality evidence, inspection, code control, and compliance-ready workflows.": "品質エビデンス、検査、コード管理、規制対応ワークフロー。",
        "Food & Beverage": "食品・飲料",
        "High-speed packaging, date code, fill, seal, label, and case inspection.": "高速包装、日付コード、充填、シール、ラベル、ケース検査。",
        "Pharmaceutical & Medical Devices": "医薬品・医療機器",
        "Clean production checks, serialization, device assembly, and label verification.": "清浄な生産確認、シリアル化、機器組立、ラベル検証。",
        "Energy & Natural Resources": "エネルギー・天然資源",
        "Inspection, measurement, asset visibility, and harsh-environment field records.": "検査、測定、資産可視化、過酷環境での現場記録。",
        "Page ${activePage} of ${totalPages}": "${activePage} / ${totalPages} ページ",
        "Pocketable 5-inch terminal for receiving, picking, stock counts, and line-side verification.": "入荷、ピッキング、棚卸、ラインサイド照合に適した携帯しやすい5インチ端末。",
        "Balanced handheld computer for logistics teams that need scanning, camera capture, and fast roaming.": "スキャン、カメラ記録、高速ローミングを必要とする物流チーム向けのバランス型ハンドヘルド。",
        "6-inch rugged terminal for mobile workflows with dense forms, WMS screens, and work instructions.": "帳票、WMS画面、作業指示を扱うモバイル業務に適した6インチ堅牢端末。",
        "Physical keypad model for glove use, repetitive scan tasks, and high-throughput warehouse teams.": "手袋操作、反復スキャン、高処理量の倉庫業務に適した物理キー搭載モデル。",
        "Rugged handheld for freezer aisles, food logistics, pharmaceutical storage, and outdoor winter work.": "冷凍倉庫、食品物流、医薬品保管、冬季屋外作業に対応する堅牢ハンドヘルド。",
        "High-end field computer for utilities, yards, maintenance teams, and long-shift industrial operations.": "インフラ、ヤード、保全チーム、長時間の産業現場運用に向けた上位フィールドコンピュータ。",
        "Compact RFID terminal for retail cycle counts, light warehouse work, and asset verification.": "店舗棚卸、軽量倉庫業務、資産確認に適したコンパクトRFID端末。",
        "Balanced pistol-grip reader for daily stock counts, pallet checks, and returns processing.": "日次棚卸、パレット確認、返品処理に適したバランス型ピストルグリップRFIDリーダー。",
        "High-power UHF handheld for warehouse aisles, dock doors, and bulk tag collection.": "倉庫通路、ドックドア、一括タグ収集に対応する高出力UHFハンドヘルド。",
        "Connected RFID computer for field asset teams that need wide-area data sync and secure Android apps.": "広域データ同期と安全なAndroidアプリ運用を必要とする現場資産管理チーム向けRFIDコンピュータ。",
        "Compact Android PDA": "コンパクトAndroid PDA",
        "All-purpose PDA": "汎用PDA",
        "Large-screen PDA": "大画面PDA",
        "Keypad PDA": "キーパッドPDA",
        "Cold-chain PDA": "コールドチェーンPDA",
        "Ultra-rugged PDA": "超堅牢PDA",
        "Built-in UHF PDA": "UHF内蔵PDA",
        "Ergonomic RFID reader": "エルゴノミックRFIDリーダー",
        "Long-range RFID reader": "長距離RFIDリーダー",
        "5G RFID terminal": "5G RFID端末",
        "Universal wired scanner": "汎用有線スキャナー",
        "Wireless industrial scanner": "産業用ワイヤレススキャナー",
        "Cold-chain scanner": "コールドチェーンスキャナー",
        "Extended-range scanner": "長距離対応スキャナー",
        "Hands-free scan station": "ハンズフリースキャンステーション",
        "Wearable ring scanner": "ウェアラブルリングスキャナー",
        "Industrial dock-door scanner": "産業用ドックドアスキャナー",
        "Photoelectric sensor": "光電センサー",
        "Inductive proximity sensor": "誘導形近接センサー",
        "Laser displacement sensor": "レーザー変位センサー",
        "Internal antenna": "内蔵アンテナ",
        "Circular antenna": "円偏波アンテナ",
        "Presentation mode": "プレゼンテーションモード",
        "White LED": "白色LED",
        "Fast decode": "高速デコード",
        "Batch memory": "バッチメモリ",
        "Cradle": "充電クレードル",
        "Anti-condensation": "結露対策",
        "Glove grip": "手袋対応グリップ",
        "Long range": "長距離",
        "Laser aimer": "レーザー照準",
        "Warehouse": "倉庫",
        "Auto trigger": "自動トリガー",
        "Fixture-ready": "治具組込対応",
        "White light": "白色光",
        "Wearable": "ウェアラブル",
        "Hands-free": "ハンズフリー",
        "Dock door": "ドックドア",
        "Conveyor": "コンベヤ",
        "Ethernet": "Ethernet",
        "Inventory": "棚卸",
        "Starter kit": "スターターキット",
        "Asset tracking": "資産追跡",
        "Bulk count": "一括読取",
        "Traceability": "トレーサビリティ",
        "Quality": "品質",
        "Fast setup": "かんたん設定",
        "Flush mount": "埋込取付",
        "High repeatability": "高い繰返し精度",
        "Machine tools": "工作機械",
        "Laser position": "レーザー位置決め",
        "Analog output": "アナログ出力",
        "Gap check": "ギャップ確認",
        "Tiny targets": "微小ワーク",
        "Teach button": "ティーチボタン",
        "Cabinet health": "制御盤状態",
        "Condition data": "状態データ",
        "Level": "レベル",
        "Clear objects": "透明体",
        "Dust tolerant": "粉じん耐性",
        "Machine safety": "機械安全",
        "Alignment aid": "位置合わせ支援",
        "Diagnostics": "診断",
        "Teach setup": "ティーチ設定",
        "Compact body": "コンパクト筐体",
        "Global shutter": "グローバルシャッター",
        "Color inspection": "色検査",
        "Label checks": "ラベル検査",
        "Defects": "欠陥",
        "Mono sensor": "モノクロセンサー",
        "Edge contrast": "エッジコントラスト",
        "PLC ready": "PLC接続対応",
        "High resolution": "高解像度",
        "Fine detail": "微細ディテール",
        "Print quality": "印字品質",
        "Height check": "高さ確認",
        "High read rate": "高読取率",
        "Wide range": "広範囲",
        "Robot cells": "ロボットセル",
        "Rack mount": "ラックマウント",
        "Cell wiring": "セル配線",
        "High bandwidth": "高帯域",
        "Low contrast": "低コントラスト",
        "Wide field": "広視野",
        "Code grading": "コードグレーディング",
        "Inline QA": "インライン品質保証",
        "Audit trail": "監査証跡",
        "Tunnel read": "トンネル読取",
        "Ring light": "リング照明",
        "Lens mount": "レンズマウント",
        "Bar light": "バー照明",
        "Side lighting": "サイド照明",
        "Low glare": "低グレア",
        "Backlight": "バックライト",
        "Silhouette": "シルエット",
        "Print check": "印字検査",
        "High output": "高出力",
        "Strobe control": "ストロボ制御",
        "Multi-light": "複数照明",
        "Low distortion": "低歪み",
        "Dimensional": "寸法測定",
        "Fixture ready": "治具対応",
        "Roughness": "粗さ",
        "Machining": "加工",
        "Code quality": "コード品質",
        "Reports": "レポート",
        "Coatings": "コーティング",
        "Finish control": "外観仕上げ管理",
        "Paint": "塗装",
        "Incoming QC": "受入検査",
        "Loop check": "ループチェック",
        "Commissioning": "立ち上げ",
        "Vision setup": "画像処理設定",
        "Grid target": "グリッドターゲット",
        "Gauge blocks": "ゲージブロック",
        "Probe check": "プローブ確認",
        "Fixture setup": "治具設定",
        "Light reference": "照明基準",
        "White balance": "ホワイトバランス",
        "Vision QA": "画像処理QA",
    },
}

for locale, replacements in POLISH_REPLACEMENTS.items():
    LOCALES[locale]["replacements"].update(replacements)


FINAL_COPY_REPLACEMENTS = {
    "de": {
        "GYUTRON Deutsch | ": "GYUTRON | ",
        "Contact GYUTRON Sales | Industrial Automation Inquiry": "GYUTRON Vertrieb kontaktieren | Anfrage zur industriellen Automatisierung",
        "Contact GYUTRON Sales": "GYUTRON Vertrieb kontaktieren",
        "Contact GYUTRON sales for industrial intelligent hardware, machine vision, rugged PDA terminals, sensors, inspection instruments, and automation deployment support.": "Kontaktieren Sie GYUTRON für industrielle intelligente Hardware, Machine Vision, robuste PDA-Terminals, Sensoren, Prüfgeräte und Unterstützung bei Automatisierungsprojekten.",
        "Share your industrial automation requirement and GYUTRON will help map the right hardware stack and deployment plan.": "Teilen Sie Ihre Anforderungen an die industrielle Automatisierung; GYUTRON unterstützt Sie bei Hardware-Stack und Einführungsplanung.",
        "GYUTRON sales inquiry": "GYUTRON Vertriebsanfrage",
        "Talk with GYUTRON about your industrial automation project.": "Sprechen Sie mit GYUTRON über Ihr industrielles Automatisierungsprojekt.",
        "Use the form for project details, or contact us directly for product specification, pilot planning, OEM / ODM programs, and channel cooperation.": "Nutzen Sie das Formular für Projektdetails oder kontaktieren Sie uns direkt zu Produktspezifikation, Pilotplanung, OEM-/ODM-Programmen und Vertriebspartnerschaften.",
        "Application, current process, required functions, timeline, quantity, integration interface, or certification needs.": "Anwendung, aktueller Prozess, benötigte Funktionen, Zeitplan, Menge, Integrationsschnittstelle oder Zertifizierungsanforderungen.",
        "GYUTRON Automated Vision Inspection | Industrial Quality Solutions": "GYUTRON Automatisierte Bildprüfung | Industrielle Qualitätslösungen",
        "GYUTRON Deutsch | Automatisierte Bildprüfung | Industrial Qualität Lösungen": "GYUTRON | Automatisierte Bildprüfung | Industrielle Qualitätslösungen",
        "Industrial Quality Solutions": "Industrielle Qualitätslösungen",
        "Industrial Qualität Lösungen": "Industrielle Qualitätslösungen",
        "GYUTRON automated vision inspection solutions combine smart cameras, sensors, lighting, barcode verification, edge control, and traceability for modern manufacturing quality teams.": "GYUTRON Lösungen für automatisierte Bildprüfung kombinieren Smart-Kameras, Sensoren, Beleuchtung, Barcode-Verifikation, Edge Control und Rückverfolgbarkeit für moderne Qualitätsteams.",
        "White-light reference kit for vision lighting consistency, exposure setup, and inspection station checks.": "Weißlicht-Referenzkit für konsistente Vision-Beleuchtung, Belichtungseinrichtung und Prüfplatzkontrollen.",
        "Coordinate branding, firmware, accessories, packaging, and workflow-specific kits.": "Branding, Firmware, Zubehör, Verpackung und workflowspezifische Kits koordinieren.",
        "News, Events &amp; Careers": "News, Events &amp; Karriere",
        "Updates, partner announcements, event participation, and team opportunities.": "Aktuelles, Partnerankündigungen, Eventteilnahmen und Karrieremöglichkeiten.",
        "Product notes, company updates, solution releases, and market announcements.": "Produktnotizen, Unternehmensupdates, Lösungsreleases und Marktankündigungen.",
        "Trade shows, demos, webinars, and regional technical sessions.": "Messen, Demos, Webinare und regionale technische Sessions.",
        "Join teams building industrial intelligence, vision, and rugged automation systems.": "Teams verstärken, die Industrial Intelligence, Vision und robuste Automatisierungssysteme entwickeln.",
        "Partner Announcements": "Partnerankündigungen",
        "Knowledge Center": "Knowledge Center",
        "Industrial automation ideas, application examples, and implementation guidance.": "Ideen, Anwendungsbeispiele und Umsetzungshinweise für industrielle Automatisierung.",
        "Application Notes": "Application Notes",
        "Practical guides for sensing, inspection, traceability, and mobile workflows.": "Praxisleitfäden für Sensorik, Prüfung, Rückverfolgbarkeit und mobile Workflows.",
        "Whitepapers &amp; eBooks": "Whitepaper &amp; eBooks",
        "Planning resources for automation, data capture, and quality systems.": "Planungsunterlagen für Automatisierung, Datenerfassung und Qualitätssysteme.",
        "On-demand and live sessions for engineers, operators, and operations leaders.": "On-Demand- und Live-Sessions für Ingenieure, Bediener und Betriebsleiter.",
        "See inspection cells, scanning workflows, and rugged hardware in action.": "Prüfzellen, Scan-Workflows und robuste Hardware im Einsatz sehen.",
        "Technical Documentation": "Technische Dokumentation",
        "Documentation for products, integration, configuration, and development.": "Dokumentation für Produkte, Integration, Konfiguration und Entwicklung.",
        "Product Manuals": "Produkthandbücher",
        "Setup, operation, maintenance, and accessory information.": "Informationen zu Einrichtung, Betrieb, Wartung und Zubehör.",
        "Integration notes for data exchange, device configuration, and software interfaces.": "Integrationshinweise für Datenaustausch, Gerätekonfiguration und Softwareschnittstellen.",
        "Integration Guides": "Integrationsleitfäden",
        "Mounting, fixture, bracket, and machine integration reference materials.": "Referenzmaterial für Montage, Vorrichtungen, Halterungen und Maschinenintegration.",
        "Buying Tools": "Beschaffungstools",
        "Shorten specification with selection, evaluation, and compliance support.": "Spezifikation mit Auswahl-, Bewertungs- und Compliance-Unterstützung verkürzen.",
        "Product Selection Guide": "Produktauswahl-Leitfaden",
        "Compare rugged terminals, sensors, vision systems, and inspection instruments.": "Robuste Terminals, Sensoren, Vision-Systeme und Prüfgeräte vergleichen.",
        "Specification Request": "Spezifikationsanfrage",
        "Send use-case details and receive recommended hardware and integration options.": "Anwendungsdetails senden und empfohlene Hardware- und Integrationsoptionen erhalten.",
        "Sample Evaluation": "Musterbewertung",
        "Discuss pilots, sample units, proof-of-concept tests, and acceptance criteria.": "Piloten, Mustergeräte, Proof-of-Concept-Tests und Abnahmekriterien besprechen.",
        "Compliance Documents": "Compliance-Dokumente",
        "Collect datasheets, declarations, inspection records, and delivery documentation.": "Datenblätter, Erklärungen, Prüfprotokolle und Lieferdokumentation sammeln.",
        "Support Resources": "Support-Ressourcen",
        "Help customers keep devices configured, updated, repaired, and documented.": "Kunden beim Konfigurieren, Aktualisieren, Reparieren und Dokumentieren von Geräten unterstützen.",
        "Common questions about hardware, accessories, compatibility, and deployment.": "Häufige Fragen zu Hardware, Zubehör, Kompatibilität und Deployment.",
        "Service Forms": "Serviceformulare",
        "Submit support, repair, replacement, and project follow-up requests.": "Support-, Reparatur-, Austausch- und Projekt-Follow-up-Anfragen einreichen.",
        "Firmware &amp; Utilities": "Firmware &amp; Utilities",
        "Deployment utilities, configuration tools, and update guidance.": "Deployment-Utilities, Konfigurationstools und Update-Hinweise.",
        "Contact Support": "Support kontaktieren",
        "Reach GYUTRON for technical, commercial, and lifecycle support.": "GYUTRON für technischen, kommerziellen und Lifecycle-Support kontaktieren.",
        "Solutions / Quality Inspection": "Lösungen / Qualitätsprüfung",
        "Primary solution": "Zentrale Lösung",
        "Built for inline inspection, assembly verification, traceability, and repeatable quality evidence across production lines.": "Entwickelt für Inline-Prüfung, Montageverifikation, Rückverfolgbarkeit und reproduzierbare Qualitätsnachweise über Produktionslinien hinweg.",
        "Capabilities": "Fähigkeiten",
        "Architecture": "Architektur",
        "Workflow": "Workflow",
        "Deployment": "Deployment",
        "Inspection Coverage": "Prüfabdeckung",
        "From visual checks to traceable quality decisions.": "Von Sichtprüfungen bis zu rückverfolgbaren Qualitätsentscheidungen.",
        "Detect missing parts, wrong orientation, assembly errors, surface issues, height variance, and visible defects at production speed.": "Fehlteile, falsche Ausrichtung, Montagefehler, Oberflächenprobleme, Höhenabweichungen und sichtbare Defekte im Produktionstakt erkennen.",
        "Use calibrated imaging, laser measurement, and inspection instruments for repeatable tolerance checks and appearance review.": "Kalibrierte Bildgebung, Lasermessung und Prüfgeräte für wiederholbare Toleranz- und Oberflächenprüfungen einsetzen.",
        "Acquire": "Erfassen",
        "Analyze": "Analysieren",
        "Interlock": "Verriegeln",
        "Record": "Dokumentieren",
        "Share your product interest, site requirements, deployment timeline, and integration needs. Our team will help map the right hardware stack for production, inspection, logistics, or field operations.": "Teilen Sie Produktinteresse, Standortanforderungen, Zeitplan und Integrationsbedarf. Unser Team unterstützt bei der passenden Hardwarearchitektur für Produktion, Prüfung, Logistik oder Feldeinsatz.",
        "Contact channels": "Kontaktkanäle",
        "Reach the sales team": "Vertriebsteam erreichen",
        "For faster review, include your product category, target application, expected quantity, country / region, and any interface or certification requirements.": "Für eine schnellere Prüfung nennen Sie bitte Produktkategorie, Zielanwendung, erwartete Menge, Land/Region sowie Schnittstellen- oder Zertifizierungsanforderungen.",
        "Tell us what you need": "Sagen Sie uns, was Sie benötigen",
        "Request sales support": "Vertriebsunterstützung anfordern",
    },
    "ja": {
        "GYUTRON 日本語 | ": "GYUTRON | ",
        "Contact GYUTRON Sales | Industrial Automation Inquiry": "GYUTRON営業へのお問い合わせ | 産業自動化のご相談",
        "Contact GYUTRON Sales": "GYUTRON営業へ問い合わせ",
        "Contact GYUTRON sales for industrial intelligent hardware, machine vision, rugged PDA terminals, sensors, inspection instruments, and automation deployment support.": "産業用インテリジェントハードウェア、マシンビジョン、堅牢PDA端末、センサー、検査機器、自動化導入支援についてGYUTRON営業へお問い合わせください。",
        "Share your industrial automation requirement and GYUTRON will help map the right hardware stack and deployment plan.": "産業自動化の要件を共有いただければ、GYUTRONが適切なハードウェア構成と導入計画をご提案します。",
        "GYUTRON sales inquiry": "GYUTRON営業へのお問い合わせ",
        "Talk with GYUTRON about your industrial automation project.": "産業自動化プロジェクトについてGYUTRONにご相談ください。",
        "Use the form for project details, or contact us directly for product specification, pilot planning, OEM / ODM programs, and channel cooperation.": "プロジェクト詳細はフォームから送信できます。製品仕様、パイロット計画、OEM/ODM、チャネル連携についても直接ご相談ください。",
        "Application, current process, required functions, timeline, quantity, integration interface, or certification needs.": "用途、現在の工程、必要機能、導入時期、数量、連携インターフェース、認証要件など。",
        "GYUTRON Automated Vision Inspection | Industrial Quality Solutions": "GYUTRON 自動画像検査 | 産業向け品質ソリューション",
        "GYUTRON 日本語 | 自動画像検査 | Industrial 品質 ソリューション": "GYUTRON | 自動画像検査 | 産業向け品質ソリューション",
        "Industrial Quality Solutions": "産業向け品質ソリューション",
        "Industrial 品質 ソリューション": "産業向け品質ソリューション",
        "GYUTRON automated vision inspection solutions combine smart cameras, sensors, lighting, barcode verification, edge control, and traceability for modern manufacturing quality teams.": "GYUTRONの自動画像検査ソリューションは、スマートカメラ、センサー、照明、バーコード検証、エッジ制御、トレーサビリティを組み合わせ、現代の製造品質チームを支援します。",
        "White-light reference kit for vision lighting consistency, exposure setup, and inspection station checks.": "画像処理照明の一貫性、露光設定、検査ステーション確認に使う白色光リファレンスキット。",
        "Coordinate branding, firmware, accessories, packaging, and workflow-specific kits.": "ブランド、ファームウェア、アクセサリ、包装、業務別キットを調整します。",
        "News, Events &amp; Careers": "ニュース・イベント・採用",
        "Updates, partner announcements, event participation, and team opportunities.": "製品情報、パートナー発表、イベント参加、採用情報。",
        "Product notes, company updates, solution releases, and market announcements.": "製品メモ、会社ニュース、ソリューションリリース、市場向けのお知らせ。",
        "Trade shows, demos, webinars, and regional technical sessions.": "展示会、デモ、ウェビナー、地域別技術セッション。",
        "Join teams building industrial intelligence, vision, and rugged automation systems.": "産業インテリジェンス、画像処理、堅牢自動化システムを構築するチームに参加できます。",
        "Partner Announcements": "パートナー発表",
        "Knowledge Center": "ナレッジセンター",
        "Industrial automation ideas, application examples, and implementation guidance.": "産業自動化のアイデア、用途例、導入ガイダンス。",
        "Application Notes": "アプリケーションノート",
        "Practical guides for sensing, inspection, traceability, and mobile workflows.": "センシング、検査、トレーサビリティ、モバイル業務の実践ガイド。",
        "Whitepapers &amp; eBooks": "ホワイトペーパー・eBook",
        "Planning resources for automation, data capture, and quality systems.": "自動化、データ収集、品質システムの計画資料。",
        "On-demand and live sessions for engineers, operators, and operations leaders.": "技術者、作業者、運用責任者向けのオンデマンド・ライブセッション。",
        "See inspection cells, scanning workflows, and rugged hardware in action.": "検査セル、スキャン業務、堅牢ハードウェアの動作例をご覧いただけます。",
        "Technical Documentation": "技術ドキュメント",
        "Documentation for products, integration, configuration, and development.": "製品、連携、設定、開発に関するドキュメント。",
        "Product Manuals": "製品マニュアル",
        "Setup, operation, maintenance, and accessory information.": "セットアップ、操作、保守、アクセサリ情報。",
        "Integration notes for data exchange, device configuration, and software interfaces.": "データ連携、端末設定、ソフトウェアインターフェースの技術メモ。",
        "Integration Guides": "連携ガイド",
        "Mounting, fixture, bracket, and machine integration reference materials.": "取付、治具、ブラケット、装置連携の参考資料。",
        "Buying Tools": "購入検討ツール",
        "Shorten specification with selection, evaluation, and compliance support.": "選定、評価、規制対応支援により仕様検討を短縮します。",
        "Product Selection Guide": "製品選定ガイド",
        "Compare rugged terminals, sensors, vision systems, and inspection instruments.": "堅牢端末、センサー、画像処理システム、検査機器を比較できます。",
        "Specification Request": "仕様相談",
        "Send use-case details and receive recommended hardware and integration options.": "用途詳細を送信すると、推奨ハードウェアと連携案をご提案します。",
        "Sample Evaluation": "サンプル評価",
        "Discuss pilots, sample units, proof-of-concept tests, and acceptance criteria.": "パイロット、サンプル機、概念実証、受入基準について相談できます。",
        "Compliance Documents": "規制対応資料",
        "Collect datasheets, declarations, inspection records, and delivery documentation.": "データシート、宣言書、検査記録、納品資料を取得できます。",
        "Support Resources": "サポート資料",
        "Help customers keep devices configured, updated, repaired, and documented.": "端末の設定、更新、修理、文書管理を継続的に支援します。",
        "Common questions about hardware, accessories, compatibility, and deployment.": "ハードウェア、アクセサリ、互換性、導入に関するよくある質問。",
        "Service Forms": "サービスフォーム",
        "Submit support, repair, replacement, and project follow-up requests.": "サポート、修理、交換、プロジェクトフォローアップを依頼できます。",
        "Firmware &amp; Utilities": "ファームウェア・ユーティリティ",
        "Deployment utilities, configuration tools, and update guidance.": "導入ユーティリティ、設定ツール、更新ガイダンス。",
        "Contact Support": "サポートに問い合わせ",
        "Reach GYUTRON for technical, commercial, and lifecycle support.": "技術、商談、ライフサイクルサポートについてGYUTRONへ問い合わせできます。",
        "Solutions / Quality Inspection": "ソリューション / 品質検査",
        "Primary solution": "主要ソリューション",
        "Built for inline inspection, assembly verification, traceability, and repeatable quality evidence across production lines.": "生産ライン全体のインライン検査、組立確認、トレーサビリティ、再現性のある品質エビデンスに対応します。",
        "Capabilities": "対応機能",
        "Architecture": "構成",
        "Workflow": "ワークフロー",
        "Deployment": "導入",
        "Inspection Coverage": "検査範囲",
        "From visual checks to traceable quality decisions.": "外観確認から追跡可能な品質判断まで対応します。",
        "Detect missing parts, wrong orientation, assembly errors, surface issues, height variance, and visible defects at production speed.": "部品欠品、向き違い、組立不良、表面異常、高さばらつき、外観欠陥を生産速度で検出します。",
        "Use calibrated imaging, laser measurement, and inspection instruments for repeatable tolerance checks and appearance review.": "校正済み画像取得、レーザー測定、検査機器により、再現性のある公差確認と外観評価を行います。",
        "Acquire": "取得",
        "Analyze": "解析",
        "Interlock": "連動",
        "Record": "記録",
        "Share your product interest, site requirements, deployment timeline, and integration needs. Our team will help map the right hardware stack for production, inspection, logistics, or field operations.": "関心のある製品、現場要件、導入時期、連携要件をお知らせください。生産、検査、物流、現場業務に適したハードウェア構成をご提案します。",
        "Contact channels": "連絡先",
        "Reach the sales team": "営業チームへ問い合わせ",
        "For faster review, include your product category, target application, expected quantity, country / region, and any interface or certification requirements.": "迅速な確認のため、製品カテゴリ、用途、予定数量、国・地域、インターフェースや認証要件をお知らせください。",
        "Tell us what you need": "必要な内容をお知らせください",
        "Request sales support": "営業サポートを依頼",
    },
}

for locale, replacements in FINAL_COPY_REPLACEMENTS.items():
    LOCALES[locale]["replacements"].update(replacements)


LANGUAGE_OPTIONS = [
    ("index.html", "English", "EN", "en"),
    ("de/index.html", "Deutsch", "DE", "de"),
    ("ja/index.html", "日本語", "JA", "ja"),
]

LANGUAGE_ARIA = {
    "en": ("Language and region selector", "Language options"),
    "de": ("Sprache und Region auswählen", "Sprachoptionen"),
    "ja": ("言語と地域を選択", "言語オプション"),
}


def language_menu(locale: str, mobile: bool, current_page: str = "index.html") -> str:
    indent = " " * 12 if mobile else " " * 16
    cls = "language-switch-mobile" if mobile else "language-switch-desktop"
    icon_cls = "language-icon-mobile" if mobile else "language-icon-desktop"
    aria_label, menu_label = LANGUAGE_ARIA.get(locale, LANGUAGE_ARIA["en"])
    lines = [
        f'{indent}<div class="language-switch {cls}">',
        f'{indent}    <button class="language-icon {icon_cls}" type="button" aria-label="{aria_label}" aria-haspopup="true"><i class="fa-solid fa-globe"></i></button>',
        f'{indent}    <div class="language-menu" aria-label="{menu_label}">',
    ]
    for href, label, short, key in LANGUAGE_OPTIONS:
        if key == "en":
            option_href = current_page
        else:
            option_href = f"{key}/{current_page}"
        current = ' aria-current="page"' if key == locale else ""
        lines.append(f'{indent}        <a href="{option_href}"{current}>{label} <span>{short}</span></a>')
    lines.extend([
        f"{indent}    </div>",
        f"{indent}</div>",
    ])
    return "\n".join(lines)


def ensure_language_switch(html: str, locale: str, current_page: str = "index.html") -> str:
    html = re.sub(
        r'\s*<div class="language-switch language-switch-mobile">.*?</div>\s*</div>',
        "\n" + language_menu(locale, True, current_page),
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'\s*<a class="language-icon language-icon-mobile" href="#" aria-label="Language and region selector"><i class="fa-solid fa-globe"></i></a>',
        "\n" + language_menu(locale, True, current_page),
        html,
        count=1,
    )
    html = re.sub(
        r'\s*<div class="language-switch language-switch-desktop">.*?</div>\s*</div>',
        "\n" + language_menu(locale, False, current_page),
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'\s*<a class="language-icon language-icon-desktop" href="#" aria-label="Language and region selector"><i class="fa-solid fa-globe"></i></a>',
        "\n" + language_menu(locale, False, current_page),
        html,
        count=1,
    )
    return html


def localize_links(html: str, folder: str) -> str:
    def replace_href(match: re.Match[str]) -> str:
        href = match.group(1)
        if href == "#":
            return f'href="{folder}/index.html"'
        if href.startswith("#"):
            return f'href="{folder}/index.html{href}"'
        if (
            href.startswith(("http:", "https:", "mailto:", "tel:", "/", f"{folder}/"))
            or href.startswith(("de/", "ja/"))
        ):
            return match.group(0)
        if ".html" not in href:
            return match.group(0)
        return f'href="{folder}/{href}"'

    return re.sub(r'href="([^"]+)"', replace_href, html)


def localize_html(source: str, folder: str, settings: dict[str, object], filename: str) -> str:
    html = source
    html = re.sub(r'<html lang="[^"]+">', f'<html lang="{settings["html_lang"]}">', html, count=1)
    if '<base href="../">' not in html:
        html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n    <base href="../">', 1)

    if filename == "index.html":
        html = re.sub(r"<title>.*?</title>", f'<title>{settings["title"]}</title>', html, count=1, flags=re.S)
        html = re.sub(
            r'<meta name="description" content="[^"]*">',
            f'<meta name="description" content="{settings["description"]}">',
            html,
            count=1,
        )
        html = re.sub(
            r'<meta property="og:locale" content="[^"]*">',
            f'<meta property="og:locale" content="{settings["og_locale"]}">',
            html,
            count=1,
        )
        html = re.sub(
            r'<meta property="og:url" content="[^"]*">',
            f'<meta property="og:url" content="https://www.gyutron.com/{folder}/">',
            html,
            count=1,
        )
    else:
        stem = filename.removesuffix(".html")
        html = re.sub(r"<title>GYUTRON ", f"<title>GYUTRON {settings['label']} | ", html, count=1)
        html = re.sub(
            r'<meta name="description" content="([^"]*)">',
            rf'<meta name="description" content="\1">',
            html,
            count=1,
        )

    html = localize_links(html, folder)
    html = ensure_language_switch(html, folder if folder in {"de", "ja"} else "en", filename)
    html = html.replace('src="product-data.js"', f'src="{folder}/product-data.js"')
    html = html.replace('src="product-catalog.js"', f'src="{folder}/product-catalog.js"')

    for before, after in sorted(settings["replacements"].items(), key=lambda item: len(item[0]), reverse=True):
        html = html.replace(before, after)

    if folder == "de":
        html = html.replace("Bildverarbeitungssysteme", "Bildverarbeitungssysteme")
    return html


_STRINGS_CACHE: dict[str, dict[str, str]] = {}


def load_strings(locale_code: str) -> dict[str, str]:
    """Load the flat English -> translated translation memory for a locale.

    locales/<code>/strings.json is the single source of truth for copy. To fix
    or add a translation, edit that JSON file -- no Python edits needed. To add
    a new market language, create locales/<newcode>/strings.json and register
    the locale in locales/locale-meta.json.
    """
    if locale_code not in _STRINGS_CACHE:
        path = ROOT / "locales" / locale_code / "strings.json"
        with path.open("r", encoding="utf-8") as handle:
            _STRINGS_CACHE[locale_code] = json.load(handle)
    return _STRINGS_CACHE[locale_code]


def apply_replacements(text: str, settings: dict[str, object]) -> str:
    for before, after in sorted(settings["replacements"].items(), key=lambda item: len(item[0]), reverse=True):
        text = text.replace(before, after)
    return text


def localized_catalog_js(folder: str, settings: dict[str, object]) -> str:
    js = (ROOT / "product-catalog.js").read_text(encoding="utf-8")
    if folder == "de":
        helpers = r'''
function localizeProductType(product) {
    return product.type
        .replace("Compact", "Kompaktes")
        .replace("All-purpose", "Universelles")
        .replace("Large-screen", "Großdisplay")
        .replace("Keypad", "Tastatur")
        .replace("Cold-chain", "Kühlketten")
        .replace("Ultra-rugged", "Ultra-robustes")
        .replace("Built-in", "Integriertes")
        .replace("Ergonomic", "Ergonomisches")
        .replace("Long-range", "Long-Range")
        .replace("Universal", "Universeller")
        .replace("Wireless", "Kabelloser")
        .replace("Wired", "Kabelgebundener")
        .replace("Industrial", "Industrieller")
        .replace("scanner", "Scanner")
        .replace("reader", "Leser")
        .replace("terminal", "Terminal")
        .replace("sensor", "Sensor")
        .replace("camera", "Kamera")
        .replace("instrument", "Instrument")
        .replace("tester", "Tester")
        .replace("gauge", "Messgerät");
}

function localizeProductSummary(product, category) {
    const tags = product.tags && product.tags.length ? ` Wichtige Optionen: ${product.tags.join(", ")}.` : "";
    return `Professionelle Modellvariante für ${category.title}. Ausgelegt für industrielle Beschaffung, Pilotierung und Systemintegration.${tags}`;
}
'''
    elif folder == "ja":
        helpers = r'''
function localizeProductType(product) {
    return product.type
        .replace("Compact", "コンパクト")
        .replace("All-purpose", "汎用")
        .replace("Large-screen", "大画面")
        .replace("Keypad", "キーパッド")
        .replace("Cold-chain", "コールドチェーン")
        .replace("Ultra-rugged", "超堅牢")
        .replace("Built-in", "内蔵型")
        .replace("Ergonomic", "エルゴノミック")
        .replace("Long-range", "長距離")
        .replace("Universal", "汎用")
        .replace("Wireless", "ワイヤレス")
        .replace("Wired", "有線")
        .replace("Industrial", "産業用")
        .replace("scanner", "スキャナー")
        .replace("reader", "リーダー")
        .replace("terminal", "端末")
        .replace("sensor", "センサー")
        .replace("camera", "カメラ")
        .replace("instrument", "機器")
        .replace("tester", "テスター")
        .replace("gauge", "ゲージ");
}

function localizeProductSummary(product, category) {
    const tags = product.tags && product.tags.length ? ` 主なオプション: ${product.tags.join("、")}。` : "";
    return `${category.title}向けの業務用モデルです。産業用途での調達、評価、システム統合を前提に構成されています。${tags}`;
}
'''
    else:
        helpers = ""
    if helpers:
        js = js.replace("const PRODUCTS_PER_PAGE = 6;\n", "const PRODUCTS_PER_PAGE = 6;\n" + helpers + "\n")
    js = js.replace('window.location.replace(`${category.redirectTo}.html`);', f'window.location.replace(`{folder}/${{category.redirectTo}}.html`);')
    js = js.replace('href="${key}.html"', f'href="{folder}/${{key}}.html"')
    js = js.replace('href="contact-sales.html"', f'href="{folder}/contact-sales.html"')
    js = js.replace('href="request-specification.html"', f'href="{folder}/request-specification.html"')
    js = js.replace('${product.type}', '${localizeProductType(product)}')
    js = js.replace('${product.summary}', '${localizeProductSummary(product, category)}')
    if folder == "de":
        js = js.replace('`${category.title} products`', '`${category.title} Produkte`')
        js = js.replace(
            "Model names, options, and specifications are structured for GYUTRON's portfolio and use common industrial device classes as benchmarks.",
            "Modellnamen, Optionen und Spezifikationen sind für das GYUTRON Portfolio strukturiert und orientieren sich an gängigen industriellen Geräteklassen."
        )
    elif folder == "ja":
        js = js.replace('`${category.title} products`', '`${category.title} 製品`')
        js = js.replace(
            "Model names, options, and specifications are structured for GYUTRON's portfolio and use common industrial device classes as benchmarks.",
            "モデル名、オプション、仕様はGYUTRONのポートフォリオに合わせて整理され、一般的な産業用デバイス分類を基準にしています。"
        )
    js = apply_replacements(js, settings)
    if folder == "de":
        js = js.replace("<th>Model</th>", "<th>Modell</th>")
    elif folder == "ja":
        js = js.replace("<th>Model</th>", "<th>モデル</th>")
    return js


def localized_product_data(settings: dict[str, object]) -> str:
    data = (ROOT / "product-data.js").read_text(encoding="utf-8")
    return apply_replacements(data, settings)


def sync_public_file(path: Path) -> None:
    relative = path.relative_to(ROOT)
    target = PUBLIC / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(path, target)


def main() -> None:
    for page in PAGE_FILES:
        path = ROOT / page
        if not path.exists():
            continue
        html = ensure_language_switch(path.read_text(encoding="utf-8"), "en", page)
        path.write_text(html, encoding="utf-8", newline="")
        sync_public_file(path)

    for folder, settings in LOCALES.items():
        # locales/<folder>/strings.json is the source of truth; it overrides the
        # legacy in-Python replacement dicts for both localize_html() and
        # apply_replacements() (which read settings["replacements"]).
        settings = {**settings, "replacements": load_strings(folder)}
        locale_dir = ROOT / folder
        locale_dir.mkdir(exist_ok=True)
        for page in PAGE_FILES:
            source_path = ROOT / page
            if not source_path.exists():
                continue
            source = source_path.read_text(encoding="utf-8")
            localized = localize_html(source, folder, settings, page)
            out_path = locale_dir / page
            out_path.write_text(localized, encoding="utf-8", newline="")
            sync_public_file(out_path)

        data_path = locale_dir / "product-data.js"
        data_path.write_text(localized_product_data(settings), encoding="utf-8", newline="")
        sync_public_file(data_path)

        catalog_path = locale_dir / "product-catalog.js"
        catalog_path.write_text(localized_catalog_js(folder, settings), encoding="utf-8", newline="")
        sync_public_file(catalog_path)

    for asset in ["mobile-navigation.css", "mobile-navigation.js", "product-page.css", "solution-page.css", "sitemap.xml"]:
        asset_path = ROOT / asset
        if asset_path.exists():
            sync_public_file(asset_path)

    print("Generated localized main-site pages for: " + ", ".join(LOCALES.keys()))


if __name__ == "__main__":
    main()
