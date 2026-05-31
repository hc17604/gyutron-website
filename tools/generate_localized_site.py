#!/usr/bin/env python3
"""Generate static localized main-site pages from the English source pages."""

from __future__ import annotations

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


LANGUAGE_OPTIONS = [
    ("index.html", "English", "EN", "en"),
    ("de/index.html", "Deutsch", "DE", "de"),
    ("ja/index.html", "日本語", "JA", "ja"),
]


def language_menu(locale: str, mobile: bool, current_page: str = "index.html") -> str:
    indent = " " * 12 if mobile else " " * 16
    cls = "language-switch-mobile" if mobile else "language-switch-desktop"
    icon_cls = "language-icon-mobile" if mobile else "language-icon-desktop"
    lines = [
        f'{indent}<div class="language-switch {cls}">',
        f'{indent}    <button class="language-icon {icon_cls}" type="button" aria-label="Language and region selector" aria-haspopup="true"><i class="fa-solid fa-globe"></i></button>',
        f'{indent}    <div class="language-menu" aria-label="Language options">',
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


def apply_replacements(text: str, settings: dict[str, object]) -> str:
    for before, after in sorted(settings["replacements"].items(), key=lambda item: len(item[0]), reverse=True):
        text = text.replace(before, after)
    return text


def localized_catalog_js(folder: str, settings: dict[str, object]) -> str:
    js = (ROOT / "product-catalog.js").read_text(encoding="utf-8")
    js = js.replace('window.location.replace(`${category.redirectTo}.html`);', f'window.location.replace(`{folder}/${{category.redirectTo}}.html`);')
    js = js.replace('href="${key}.html"', f'href="{folder}/${{key}}.html"')
    js = js.replace('href="contact-sales.html"', f'href="{folder}/contact-sales.html"')
    js = js.replace('href="request-specification.html"', f'href="{folder}/request-specification.html"')
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
