#!/usr/bin/env python3
"""GYUTRON build-time i18n (target architecture).

One set of templates -> abstract i18n keys -> per-locale static pages.

    templates/<path>.html          language-neutral, marked with i18n keys
    locales/i18n/<loc>.json        flat { "key": "text" } per locale
            |
            v  python tools/build_i18n.py
    <root or loc>/<path>.html      static, SEO-complete per locale  (+ public/ mirror)

Markers in templates:
  * Element text:   <span data-i18n="cta.shop">Shop Products</span>
                    -> inner text replaced with the locale value.
  * Attributes:     <input data-i18n-attr="placeholder=search.ph;aria-label=search.ph">
  * Inline/anywhere: {{t:key}}  (works in <title>, meta content, JS, anywhere)

Rules:
  * Keys are semantic (nav.products), never the English text.
  * A key referenced by a template but missing from a locale file is a BUILD
    ERROR (no silent English fallback). Run with --check for a dry audit.
  * Locked terms (GYUTRON, SKU, RFID, ...) are just literal text in templates;
    they are never keyed, so they can never be mistranslated.
  * JS is NOT blind-replaced: only {{t:key}} markers are substituted, so code
    identifiers can never be corrupted (the root cause of the old breakage).
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "templates"
I18N_DIR = ROOT / "locales" / "i18n"
PUBLIC = ROOT / "public"

CONFIG = {
    "en": {"dir": "", "lang": "en", "og": "en_US", "base": "", "label": "English", "short": "EN"},
    "de": {"dir": "de", "lang": "de", "og": "de_DE", "base": "/de", "label": "Deutsch", "short": "DE"},
    "ja": {"dir": "ja", "lang": "ja", "og": "ja_JP", "base": "/ja", "label": "日本語", "short": "JA"},
}

SHOP_HOST = "https://shop.gyutron.com"
WWW_HOST = "https://www.gyutron.com"

# Professional Japanese font stack (Noto Sans JP + system fallback, 1.7 line
# height, sensible weights). Injected only on ja pages via {{locale.fonts}}.
JA_FONTS = (
    '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap" rel="stylesheet">\n'
    '    <style id="gyutron-ja-typography">\n'
    '      body, button, input, select, textarea {\n'
    '        font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", system-ui, sans-serif;\n'
    '        -webkit-font-smoothing: antialiased;\n'
    '        text-rendering: optimizeLegibility;\n'
    '      }\n'
    '      body { line-height: 1.7; }\n'
    '      h1, h2, h3, h4 { font-weight: 700; line-height: 1.45; }\n'
    '      p, li, label, td { font-weight: 400; }\n'
    '      .nav a, .nav-links a, .nav-trigger, .nav-item > a,\n'
    '      .store-language-menu a, .top-strip, .brand span {\n'
    '        font-weight: 700;\n'
    '        color: var(--ink, #17121f);\n'
    '      }\n'
    '      /* JA nav: bigger than the Latin-tuned 12px, no uppercase, tight tracking. */\n'
    '      .nav, .nav-links, .nav a, .nav-links a, .nav-trigger {\n'
    '        font-size: 15px;\n'
    '        text-transform: none;\n'
    '        letter-spacing: 0.01em;\n'
    '      }\n'
    '      .store-language-menu a { font-size: 14px; text-transform: none; }\n'
    '      .store-language-menu a span { font-size: 12px; }\n'
    '    </style>'
)

# Main-site Japanese font block — byte-identical to the legacy generator's
# JA_FONT_BLOCK (it carries the 2 preconnect links + comments the shop block
# omits), injected before </head> on ja main pages via {{locale.mainfonts}}.
JA_FONT_BLOCK_MAIN = (
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

LANG_DIRECTIVE = re.compile(r"\{\{locale\.(lang|og|base|fonts)\}\}")
CANONICAL_DIRECTIVE = re.compile(r"\{\{locale\.canonical:([^}]+)\}\}")
LANGSWITCH_DIRECTIVE = re.compile(r"\{\{locale\.langswitch(?::([^}]+))?\}\}")
ALTERNATES_DIRECTIVE = re.compile(r"\{\{locale\.alternates\}\}")
# Main-site directives (relative paths + <base href="../">, www host, mega-menu
# language switch). These regexes never match shop templates, so they are no-ops
# there — the shop render path stays byte-identical.
PATH_DIRECTIVE = re.compile(r"\{\{locale\.path\}\}")
BASETAG_DIRECTIVE = re.compile(r"\{\{locale\.basetag\}\}")
MAINLANGSWITCH_DIRECTIVE = re.compile(r"\{\{locale\.mainlangswitch\.(mobile|desktop)(?::([^}]+))?\}\}")
MAINFONTS_DIRECTIVE = re.compile(r"\{\{locale\.mainfonts\}\}")


def alternates_block(page_path: str, active: str, host: str = SHOP_HOST) -> str:
    """canonical + hreflang(en/de/ja/x-default) for the CURRENT page, so the
    shared <head> partial needs no per-page parameters."""
    lines = [f'<link rel="canonical" href="{host}{CONFIG[active]["base"]}{page_path}">']
    for code, conf in CONFIG.items():
        lines.append(f'    <link rel="alternate" hreflang="{conf["lang"]}" href="{host}{conf["base"]}{page_path}">')
    lines.append(f'    <link rel="alternate" hreflang="x-default" href="{host}{page_path}">')
    return "\n".join(lines)


def shop_language_switch(active: str, page: str) -> str:
    """Build the store language switcher for `page`, marking `active` current.
    Each option links to the same page under its locale base, so switching keeps
    you on the same page (not bounced to the homepage)."""
    lines = [
        '<div class="store-language-switch">',
        '                    <button class="language-icon store-language" type="button" data-i18n-attr="aria-label=lang.selector" aria-haspopup="true"><i class="fa-solid fa-globe"></i></button>',
        '                    <div class="store-language-menu" data-i18n-attr="aria-label=lang.options">',
    ]
    for code, conf in CONFIG.items():
        href = f"{conf['base']}/shop/{page}"
        cur = ' aria-current="page"' if code == active else ""
        lines.append(f'                        <a href="{href}"{cur}>{conf["label"]} <span>{conf["short"]}</span></a>')
    lines += ["                    </div>", "                </div>"]
    return "\n".join(lines)


# Main-site language switcher. aria labels are localized per the ACTIVE locale,
# matching the legacy generator's LANGUAGE_ARIA so output stays byte-identical.
MAIN_LANGUAGE_ARIA = {
    "en": ("Language and region selector", "Language options"),
    "de": ("Sprache und Region auswählen", "Sprachoptionen"),
    "ja": ("言語と地域を選択", "言語オプション"),
}


def main_language_switch(active: str, page: str, variant: str) -> str:
    """Main-site language switcher (mobile/desktop). Hrefs are locale-invariant
    (en bare, de/ja dir-prefixed; resolved via <base href="../"> on de/ja pages);
    only aria-current moves to the active locale. The first line carries no indent
    — the template supplies it (same convention as shop_language_switch)."""
    mobile = variant == "mobile"
    base = 12 if mobile else 16
    cls = "language-switch-mobile" if mobile else "language-switch-desktop"
    icon_cls = "language-icon-mobile" if mobile else "language-icon-desktop"
    aria_label, menu_label = MAIN_LANGUAGE_ARIA.get(active, MAIN_LANGUAGE_ARIA["en"])
    i = " " * base
    lines = [
        f'<div class="language-switch {cls}">',
        f'{i}    <button class="language-icon {icon_cls}" type="button" aria-label="{aria_label}" aria-haspopup="true"><i class="fa-solid fa-globe"></i></button>',
        f'{i}    <div class="language-menu" aria-label="{menu_label}">',
    ]
    for prefix, label, short, code in (("", "English", "EN", "en"), ("de/", "Deutsch", "DE", "de"), ("ja/", "日本語", "JA", "ja")):
        cur = ' aria-current="page"' if code == active else ""
        lines.append(f'{i}        <a href="{prefix}{page}"{cur}>{label} <span>{short}</span></a>')
    lines += [f'{i}    </div>', f'{i}</div>']
    return "\n".join(lines)


def apply_locale_directives(text: str, loc_code: str, rel: str = "") -> str:
    conf = CONFIG[loc_code]
    page_file = Path(rel).name if rel else "index.html"
    page_path = "/" + rel if rel else ""
    is_shop = bool(Path(rel).parts) and Path(rel).parts[0] == "shop"
    host = SHOP_HOST if is_shop else WWW_HOST
    text = LANG_DIRECTIVE.sub(lambda m: {"lang": conf["lang"], "og": conf["og"],
                                          "base": conf["base"],
                                          "fonts": JA_FONTS if loc_code == "ja" else ""}[m.group(1)], text)
    # Main-site directives (no-ops on shop templates, which never use them).
    text = PATH_DIRECTIVE.sub(lambda m: f'{conf["dir"]}/' if conf["dir"] else "", text)
    text = BASETAG_DIRECTIVE.sub(lambda m: '\n    <base href="../">' if conf["dir"] else "", text)
    text = MAINFONTS_DIRECTIVE.sub(lambda m: JA_FONT_BLOCK_MAIN if loc_code == "ja" else "", text)
    text = MAINLANGSWITCH_DIRECTIVE.sub(
        lambda m: main_language_switch(loc_code, m.group(2) or page_file, m.group(1)), text)
    text = CANONICAL_DIRECTIVE.sub(lambda m: f'{host}{conf["base"]}{m.group(1)}', text)
    text = ALTERNATES_DIRECTIVE.sub(lambda m: alternates_block(page_path, loc_code, host), text)
    text = LANGSWITCH_DIRECTIVE.sub(lambda m: shop_language_switch(loc_code, m.group(1) or page_file), text)
    return text

DATA_I18N = re.compile(r'<([a-zA-Z0-9]+)([^>]*?)\sdata-i18n="([^"]+)"([^>]*)>(.*?)</\1>', re.DOTALL)
DATA_ATTR = re.compile(r'data-i18n-attr="([^"]+)"')
MUSTACHE = re.compile(r"\{\{t:([^}]+)\}\}")
INCLUDE = re.compile(r"\{\{include:([^}]+)\}\}")
PARTIALS = TEMPLATES / "_partials"


def resolve_includes(text: str, _depth: int = 0) -> str:
    """Inline {{include:name}} from templates/_partials/<name>.html (one shared
    header/footer authored once, used by every page). Recursive, with a guard."""
    if _depth > 5:
        return text
    def repl(m: re.Match[str]) -> str:
        part = (PARTIALS / f"{m.group(1).strip()}.html").read_text(encoding="utf-8")
        return resolve_includes(part, _depth + 1)
    return INCLUDE.sub(repl, text)


def load_locale(loc: str) -> dict[str, str]:
    p = I18N_DIR / f"{loc}.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def referenced_keys(text: str) -> set[str]:
    keys: set[str] = set()
    keys |= set(MUSTACHE.findall(text))
    for m in DATA_I18N.finditer(text):
        keys.add(m.group(3))
    for m in DATA_ATTR.finditer(text):
        for pair in m.group(1).split(";"):
            if "=" in pair:
                keys.add(pair.split("=", 1)[1].strip())
    return keys


def render(text: str, loc_code: str, loc: dict[str, str], strict_report: list[str], where: str, rel: str = "") -> str:
    text = resolve_includes(text)
    text = apply_locale_directives(text, loc_code, rel)

    def need(key: str) -> str:
        if key not in loc:
            strict_report.append(f"{where}: missing key '{key}'")
            return ""  # build --check surfaces it; render emits empty rather than English
        return loc[key]

    # 1. element text via data-i18n
    def repl_el(m: re.Match[str]) -> str:
        tag, pre, key, post, _inner = m.groups()
        return f"<{tag}{pre} data-i18n=\"{key}\"{post}>{need(key)}</{tag}>"
    text = DATA_I18N.sub(repl_el, text)

    # 2. attributes via data-i18n-attr
    def repl_attr(m: re.Match[str]) -> str:
        out_attrs = []
        spec = m.group(1)
        result = m.group(0)
        for pair in spec.split(";"):
            if "=" not in pair:
                continue
            attr, key = (x.strip() for x in pair.split("=", 1))
            out_attrs.append((attr, need(key)))
        # apply to the surrounding tag: handled by a second pass below
        return "\x00ATTR\x00" + json.dumps(out_attrs) + "\x00"
    # attribute substitution needs tag context; do a tag-level pass instead:
    def repl_tag(m: re.Match[str]) -> str:
        tag = m.group(0)
        am = DATA_ATTR.search(tag)
        if not am:
            return tag
        for pair in am.group(1).split(";"):
            if "=" not in pair:
                continue
            attr, key = (x.strip() for x in pair.split("=", 1))
            val = need(key)
            if re.search(rf'\s{re.escape(attr)}="[^"]*"', tag):
                tag = re.sub(rf'(\s{re.escape(attr)}=")[^"]*(")', lambda mm: mm.group(1) + val + mm.group(2), tag, count=1)
            else:
                tag = tag[:-1] + f' {attr}="{val}">'
        return tag
    text = re.sub(r"<[^>]*\sdata-i18n-attr=\"[^\"]+\"[^>]*>", repl_tag, text)

    # 3. mustache anywhere (title, meta, JS)
    text = MUSTACHE.sub(lambda m: need(m.group(1)), text)
    return text


def iter_templates() -> list[Path]:
    if not TEMPLATES.exists():
        return []
    return [p for p in TEMPLATES.rglob("*")
            if p.is_file() and "_partials" not in p.relative_to(TEMPLATES).parts]


def build(check_only: bool) -> int:
    locales = {loc: load_locale(loc) for loc in CONFIG}
    report: list[str] = []
    tpls = iter_templates()
    if not tpls:
        print("No templates/ yet — nothing to build.")
        return 0

    # key-parity audit across locales (expand directives first so switcher keys
    # like lang.selector are counted).
    all_keys: set[str] = set()
    for t in tpls:
        expanded = apply_locale_directives(resolve_includes(t.read_text(encoding="utf-8")), "en")
        all_keys |= referenced_keys(expanded)
    for loc, data in locales.items():
        missing = sorted(all_keys - set(data))
        for k in missing:
            report.append(f"locale {loc}: missing key '{k}'")

    if check_only:
        if report:
            print(f"i18n CHECK FAIL ({len(report)}):")
            for r in report[:50]:
                print("  " + r)
            return 1
        print(f"i18n CHECK PASS — {len(all_keys)} keys x {len(locales)} locales.")
        return 0

    written = 0
    for loc, conf in CONFIG.items():
        data = locales[loc]
        for t in tpls:
            rel = t.relative_to(TEMPLATES)
            rendered = render(t.read_text(encoding="utf-8"), loc, data, report, f"{loc}/{rel}", rel.as_posix())
            out = (ROOT / conf["dir"] / rel) if conf["dir"] else (ROOT / rel)
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(rendered, encoding="utf-8", newline="")
            mirror = PUBLIC / conf["dir"] / rel if conf["dir"] else PUBLIC / rel
            mirror.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(out, mirror)
            written += 1
    miss = [r for r in report if "missing key" in r]
    if miss:
        print(f"BUILD completed with {len(miss)} MISSING KEYS (emitted empty):")
        for r in sorted(set(miss))[:30]:
            print("  " + r)
        return 1
    print(f"i18n build OK — {written} files across {len(locales)} locales.")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="audit key parity, write nothing")
    sys.exit(build(ap.parse_args().check))
