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

# Official store (shop.gyutron.com). These use absolute "/shop/..." paths, so
# localized copies live at "/<locale>/shop/..." by rewriting the path prefix.
SHOP_DIR = "shop"
SHOP_PAGE_FILES = [
    "index.html",
    "products.html",
    "product.html",
    "cart.html",
    "checkout.html",
    "account.html",
    "request-quote.html",
    "contact-engineer.html",
    "contact-us.html",
    "about-us.html",
    "payment-methods.html",
    "privacy-policy.html",
    "return-refund-policy.html",
    "shipping-policy.html",
    "terms-of-service.html",
    "warranty-policy.html",
]


LOCALES = {
    "de": {
        "html_lang": "de",
        "label": "Deutsch",
        "short": "DE",
        "og_locale": "de_DE",
        "title": "GYUTRON | Industrielle Bildverarbeitung, Sensorik und Automatisierungshardware",
        "description": "GYUTRON bietet industrielle intelligente Hardware, Machine-Vision-Systeme, Sensoren, robuste PDA-Terminals, Prüfgeräte und vernetzte Automatisierungslösungen für moderne Fertigungs- und Logistikteams.",
        "replacements": {},
    },
    "ja": {
        "html_lang": "ja",
        "label": "日本語",
        "short": "JA",
        "og_locale": "ja_JP",
        "title": "GYUTRON | 産業用画像処理・センサー・データ収集・自動化ハードウェア",
        "description": "GYUTRONは、現代の製造、物流、現場業務向けに産業用カメラ、堅牢なデータ収集端末、センサー、検査機器、自動化ソリューションを提供します。",
        "replacements": {},
    },
}


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


JA_FONT_BLOCK = (
    '\n    <link rel="preconnect" href="https://fonts.googleapis.com">'
    '\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    '\n    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap" rel="stylesheet">'
    '\n    <style id="gyutron-ja-typography">'
    '\n      body, button, input, select, textarea {'
    '\n        font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", system-ui, sans-serif;'
    '\n        -webkit-font-smoothing: antialiased;'
    '\n        text-rendering: optimizeLegibility;'
    '\n      }'
    '\n      body { line-height: 1.7; }'
    '\n      h1, h2, h3, h4 { font-weight: 700; line-height: 1.45; }'
    '\n      /* Body copy at a readable regular weight, but DO NOT flatten links/'
    '\n         spans globally — that washed out the nav. Let component weights win. */'
    '\n      p, li, label, td { font-weight: 400; }'
    '\n      /* Navigation must read bold and dark, not thin/pale in Japanese. */'
    '\n      .nav a, .nav-links a, .nav-trigger, .nav-item > a,'
    '\n      .store-language-menu a, .top-strip, .brand span {'
    '\n        font-weight: 700;'
    '\n        color: var(--ink, #17121f);'
    '\n      }'
    '\n      /* Japanese is visually smaller than Latin at the same px and the'
    '\n         Latin-tuned 12px uppercase nav reads too small. Enlarge JA nav,'
    '\n         drop the no-op uppercase, and tighten the wide tracking that hurts'
    '\n         CJK. EN/DE pages are unaffected (this block is ja-only). */'
    '\n      .nav, .nav-links, .nav a, .nav-links a, .nav-trigger {'
    '\n        font-size: 15px;'
    '\n        text-transform: none;'
    '\n        letter-spacing: 0.01em;'
    '\n      }'
    '\n      .store-language-menu a { font-size: 14px; text-transform: none; }'
    '\n      .store-language-menu a span { font-size: 12px; }'
    '\n    </style>\n'
)


def _finalize_head(html: str, locale: str) -> str:
    """Locale-specific <head> finalization: professional Japanese font stack
    (Noto Sans JP + system fallback, line-height 1.7, sensible weights) and a
    `ja` hreflang alternate. Idempotent — guards on marker presence."""
    if locale == "ja" and "gyutron-ja-typography" not in html:
        html = html.replace("</head>", JA_FONT_BLOCK + "</head>", 1)
    # Ensure a Japanese hreflang alternate exists wherever a German one does.
    if 'hreflang="de"' in html and 'hreflang="ja"' not in html:
        html = re.sub(
            r'(<link rel="alternate" hreflang="de" href="([^"]*)">)',
            lambda m: m.group(1) + '\n    <link rel="alternate" hreflang="ja" href="'
                      + m.group(2).replace("/de/", "/ja/").replace("/de", "/ja") + '">',
            html,
            count=1,
        )
    return html


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
        html = re.sub(
            r'<meta property="og:title" content="[^"]*">',
            f'<meta property="og:title" content="{settings["title"]}">',
            html,
            count=1,
        )
    # Non-index pages: the full <title> and <meta description> are translated by
    # the strings.json replacement pass below (keyed on the exact English source
    # text), so no per-page munging is needed here. og:locale is set for all.
    html = re.sub(
        r'<meta property="og:locale" content="[^"]*">',
        f'<meta property="og:locale" content="{settings["og_locale"]}">',
        html,
        count=1,
    )

    html = localize_links(html, folder)
    html = ensure_language_switch(html, folder if folder in {"de", "ja"} else "en", filename)
    html = html.replace('src="product-data.js"', f'src="{folder}/product-data.js"')
    html = html.replace('src="product-catalog.js"', f'src="{folder}/product-catalog.js"')

    html = _apply_phrase_map(html, settings["replacements"])
    html = _finalize_head(html, folder)
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


_PHRASE_RE_CACHE: dict[int, "re.Pattern[str]"] = {}


def _apply_phrase_map(text: str, mapping: dict[str, str]) -> str:
    """Replace every English source phrase with its translation in a SINGLE
    left-to-right pass.

    Using repeated str.replace() (longest-first) is unsafe: a short key can hit
    a substring of text another key already produced. E.g. after
    "Industrial Sensors" -> "Industriesensoren", a later "Industries" -> "Branchen"
    key would corrupt it into "Branchenensoren". A single regex pass matches each
    position once (longest alternative wins) and never re-scans replaced text, so
    translations can't bleed into one another.
    """
    if not mapping:
        return text
    key = id(mapping)
    pattern = _PHRASE_RE_CACHE.get(key)
    if pattern is None:
        # Longest keys first so the most specific phrase wins at each position.
        sources = sorted(mapping, key=len, reverse=True)
        pattern = re.compile("|".join(re.escape(s) for s in sources))
        _PHRASE_RE_CACHE[key] = pattern
    return pattern.sub(lambda m: mapping[m.group(0)], text)


def apply_replacements(text: str, settings: dict[str, object]) -> str:
    return _apply_phrase_map(text, settings["replacements"])


# Chars after which a "/" begins a regex literal rather than division.
_REGEX_PREFIX = set("(,=:[!&|?{;}+-*%<>~^") | {""}


def translate_js(js: str, mapping: dict[str, str]) -> str:
    """Translate ONLY the human-readable text inside JS string/template literals.

    Running the plain phrase map over JavaScript corrupts code: e.g. the key
    "Checkout" -> "Zur Kasse" rewrote the identifier `renderCheckoutSummary`
    into `renderZur KasseSummary`, a syntax error that took the whole German
    store offline. This walks the source and applies the phrase map only inside
    "..."/'...' strings and the text portions of `...` template literals — never
    to identifiers, keywords, comments, regex literals, or ${...} expressions.
    """
    if not mapping:
        return js
    out: list[str] = []
    i, n = 0, len(js)
    prev = ""  # last significant (non-space) code char, for regex detection
    while i < n:
        c = js[i]
        two = js[i:i + 2]
        if two == "//":                                   # line comment
            j = js.find("\n", i)
            j = n if j == -1 else j
            out.append(js[i:j]); i = j; continue
        if two == "/*":                                   # block comment
            j = js.find("*/", i + 2)
            j = n if j == -1 else j + 2
            out.append(js[i:j]); i = j; continue
        if c in ('"', "'"):                               # quoted string
            j, buf = i + 1, []
            while j < n:
                if js[j] == "\\":
                    buf.append(js[j:j + 2]); j += 2; continue
                if js[j] == c:
                    break
                buf.append(js[j]); j += 1
            out.append(c + _apply_phrase_map("".join(buf), mapping) + (c if j < n else ""))
            i = j + 1; prev = c; continue
        if c == "`":                                      # template literal
            out.append("`"); j = i + 1
            while j < n:
                if js[j] == "\\":
                    out.append(js[j:j + 2]); j += 2; continue
                if js[j] == "`":
                    break
                if js[j:j + 2] == "${":                    # expression: copy verbatim
                    depth, k = 0, j
                    while k < n:
                        if js[k] == "{":
                            depth += 1
                        elif js[k] == "}":
                            depth -= 1
                            if depth == 0:
                                k += 1; break
                        k += 1
                    out.append(js[j:k]); j = k; continue
                start = j
                while j < n and js[j] not in ("`", "\\") and js[j:j + 2] != "${":
                    j += 1
                out.append(_apply_phrase_map(js[start:j], mapping))
            out.append("`" if j < n else ""); i = j + 1; prev = "`"; continue
        if c == "/" and prev in _REGEX_PREFIX:            # regex literal
            j, in_class = i + 1, False
            while j < n:
                ch = js[j]
                if ch == "\\":
                    j += 2; continue
                if ch == "[":
                    in_class = True
                elif ch == "]":
                    in_class = False
                elif ch == "\n":
                    break
                elif ch == "/" and not in_class:
                    break
                j += 1
            k = j + 1
            while k < n and js[k].isalpha():
                k += 1
            out.append(js[i:k]); i = k; prev = "/"; continue
        out.append(c)
        if not c.isspace():
            prev = c
        i += 1
    return "".join(out)


def localized_catalog_js(folder: str, settings: dict[str, object]) -> str:
    js = (ROOT / "product-catalog.js").read_text(encoding="utf-8")
    if folder == "de":
        helpers = r'''
function __LOCALIZE_TYPE__(product) {
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

function __LOCALIZE_SUMMARY__(product, category) {
    const tags = product.tags && product.tags.length ? ` Wichtige Optionen: ${product.tags.join(", ")}.` : "";
    return `Professionelle Modellvariante für ${category.title}. Ausgelegt für industrielle Beschaffung, Pilotierung und Systemintegration.${tags}`;
}
'''
    elif folder == "ja":
        helpers = r'''
function __LOCALIZE_TYPE__(product) {
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

function __LOCALIZE_SUMMARY__(product, category) {
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
    # The type/summary helpers injected above AND these call sites deliberately use
    # the __LOCALIZE_*__ names: apply_replacements() below is a blind phrase map over
    # the whole file and WOULD corrupt a normal identifier — it turned
    # localizeProductType -> localizeProductTyp via the "Type"->"Typ" key, which left
    # __LOCALIZE_TYPE__ undefined and crashed (blank) every de/ja product page. The
    # all-caps/underscore names match no phrase key, so definition and call survive
    # intact. (Proper fix = the build_i18n.py t() migration; until then don't rename.)
    js = js.replace('${product.type}', '${__LOCALIZE_TYPE__(product)}')
    js = js.replace('${product.summary}', '${__LOCALIZE_SUMMARY__(product, category)}')
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
    return translate_js(data, settings["replacements"])


def sync_public_file(path: Path) -> None:
    relative = path.relative_to(ROOT)
    target = PUBLIC / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(path, target)


# ---- Official store (shop) localization ------------------------------------

SHOP_LANG_OPTIONS = [("en", "English", "EN"), ("de", "Deutsch", "DE"), ("ja", "日本語", "JA")]
SHOP_LANG_ARIA = {
    "en": ("Language and region selector", "Language options"),
    "de": ("Sprache und Region auswählen", "Sprachoptionen"),
    "ja": ("言語と地域を選択", "言語オプション"),
}
# Matches either the original globe link or an already-injected switcher, so the
# generator is idempotent across re-runs.
SHOP_LANG_RE = re.compile(
    r'<a class="language-icon store-language"[^>]*>.*?</a>'
    r'|<div class="store-language-switch">.*?</div>\s*</div>',
    re.DOTALL,
)


def shop_language_menu(locale: str, current_page: str) -> str:
    aria_label, menu_label = SHOP_LANG_ARIA.get(locale, SHOP_LANG_ARIA["en"])
    lines = [
        '<div class="store-language-switch">',
        f'                    <button class="language-icon store-language" type="button" aria-label="{aria_label}" aria-haspopup="true"><i class="fa-solid fa-globe"></i></button>',
        f'                    <div class="store-language-menu" aria-label="{menu_label}">',
    ]
    for key, label, short in SHOP_LANG_OPTIONS:
        href = f"/{SHOP_DIR}/{current_page}" if key == "en" else f"/{key}/{SHOP_DIR}/{current_page}"
        current = ' aria-current="page"' if key == locale else ""
        lines.append(f'                        <a href="{href}"{current}>{label} <span>{short}</span></a>')
    lines.extend(["                    </div>", "                </div>"])
    return "\n".join(lines)


def _inject_shop_i18n(html: str, locale: str) -> str:
    """Load shop-i18n.js and set the locale flag BEFORE shop.js runs, so product/
    category/UI copy is localized from structured data (shop-i18n.js) instead of
    blind string replacement. Works for every locale incl. en (en = no-op)."""
    base = "" if locale == "en" else f"/{locale}"
    snippet = (
        f'<script>window.GYUTRON_SHOP_LOCALE="{locale}";</script>\n'
        f'    <script src="{base}/{SHOP_DIR}/shop-i18n.js"></script>\n    '
    )
    # Insert right before the main shop.js include.
    return html.replace(f'<script src="{base}/{SHOP_DIR}/shop.js">',
                        snippet + f'<script src="{base}/{SHOP_DIR}/shop.js">', 1)


def localize_shop_html(source: str, locale: str, filename: str) -> str:
    html = source
    html = re.sub(r'<html lang="[^"]+">', f'<html lang="{locale}">', html, count=1)
    # Pull the language control out to a placeholder BEFORE translating/path-
    # rewriting so its own hrefs/labels are never rewritten. Makes the build
    # idempotent (re-running is byte-identical instead of corrupting switcher
    # paths like /ja/shop/ -> /ja/de/shop/).
    placeholder = "@@GYUTRON_SHOP_LANG@@"
    html = SHOP_LANG_RE.sub(placeholder, html, count=1)
    if locale != "en":
        html = html.replace(f"/{SHOP_DIR}/", f"/{locale}/{SHOP_DIR}/")
        html = apply_replacements(html, {"__locale_code": locale, "replacements": load_strings(locale)})
    html = html.replace(placeholder, shop_language_menu(locale, filename))
    html = _finalize_head(html, locale)
    html = _inject_shop_i18n(html, locale)
    return html


def localized_shop_js(locale: str) -> str:
    # shop.js is now locale-neutral: it reads window.GYUTRON_SHOP_LOCALE +
    # shop-i18n.js at runtime. We only rewrite the absolute /shop/ asset paths
    # for the locale subdirectory; the CODE is never translated (that was the
    # cause of the old `renderZur KasseSummary` breakage).
    js = (ROOT / SHOP_DIR / "shop.js").read_text(encoding="utf-8")
    if locale != "en":
        js = js.replace(f"/{SHOP_DIR}/", f"/{locale}/{SHOP_DIR}/")
    return js


def localized_shop_i18n_js(locale: str) -> str:
    """shop-i18n.js with its internal /shop/ asset paths rewritten per locale
    (the data file has no translatable code, only the dictionaries)."""
    js = (ROOT / SHOP_DIR / "shop-i18n.js").read_text(encoding="utf-8")
    if locale != "en":
        js = js.replace(f"/{SHOP_DIR}/", f"/{locale}/{SHOP_DIR}/")
    return js


def _template_owned(rel_path: str) -> bool:
    """A page that now has a template under templates/ is owned by the new
    build_i18n.py pipeline; the legacy generator must not touch it (otherwise the
    two would fight over the same output file). Lets us migrate page-by-page."""
    return (ROOT / "templates" / rel_path).exists()


def generate_shop() -> None:
    # Localized stores first (read from the pristine English source on disk).
    for folder in LOCALES:
        shop_out = ROOT / folder / SHOP_DIR
        shop_out.mkdir(parents=True, exist_ok=True)
        for page in SHOP_PAGE_FILES:
            if _template_owned(f"{SHOP_DIR}/{page}"):
                continue  # owned by build_i18n.py
            src = ROOT / SHOP_DIR / page
            if not src.exists():
                continue
            out = shop_out / page
            out.write_text(localize_shop_html(src.read_text(encoding="utf-8"), folder, page), encoding="utf-8", newline="")
            sync_public_file(out)
        js_out = shop_out / "shop.js"
        js_out.write_text(localized_shop_js(folder), encoding="utf-8", newline="")
        sync_public_file(js_out)
        i18n_out = shop_out / "shop-i18n.js"
        i18n_out.write_text(localized_shop_i18n_js(folder), encoding="utf-8", newline="")
        sync_public_file(i18n_out)
        css_src = ROOT / SHOP_DIR / "shop.css"
        if css_src.exists():
            css_out = shop_out / "shop.css"
            css_out.write_text(css_src.read_text(encoding="utf-8"), encoding="utf-8", newline="")
            sync_public_file(css_out)

    # English source last: inject the language switch in place + mirror to public.
    for page in SHOP_PAGE_FILES:
        if _template_owned(f"{SHOP_DIR}/{page}"):
            continue  # owned by build_i18n.py
        src = ROOT / SHOP_DIR / page
        if not src.exists():
            continue
        src.write_text(localize_shop_html(src.read_text(encoding="utf-8"), "en", page), encoding="utf-8", newline="")
        sync_public_file(src)
    for asset in ("shop.js", "shop-i18n.js", "shop.css"):
        asset_path = ROOT / SHOP_DIR / asset
        if asset_path.exists():
            sync_public_file(asset_path)


def main() -> None:
    for page in PAGE_FILES:
        if _template_owned(page):
            continue  # owned by build_i18n.py (new key pipeline)
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
            if _template_owned(page):
                continue  # owned by build_i18n.py (new key pipeline)
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

    generate_shop()

    print("Generated localized main-site + store pages for: " + ", ".join(LOCALES.keys()))


if __name__ == "__main__":
    main()
