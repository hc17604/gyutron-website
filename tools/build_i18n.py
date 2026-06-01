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

# Professional Japanese font stack (Noto Sans JP + system fallback, 1.7 line
# height, sensible weights). Injected only on ja pages via {{locale.fonts}}.
JA_FONTS = (
    '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">\n'
    '    <style id="gyutron-ja-typography">\n'
    '      body, button, input, select, textarea {\n'
    '        font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", system-ui, sans-serif;\n'
    '      }\n'
    '      body { line-height: 1.7; }\n'
    '      h1, h2, h3, h4 { font-weight: 700; line-height: 1.45; }\n'
    '      p, li, span, a, label, td, th { font-weight: 400; }\n'
    '    </style>'
)

LANG_DIRECTIVE = re.compile(r"\{\{locale\.(lang|og|base|fonts)\}\}")
CANONICAL_DIRECTIVE = re.compile(r"\{\{locale\.canonical:([^}]+)\}\}")
LANGSWITCH_DIRECTIVE = re.compile(r"\{\{locale\.langswitch:([^}]+)\}\}")


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


def apply_locale_directives(text: str, loc_code: str) -> str:
    conf = CONFIG[loc_code]
    text = LANG_DIRECTIVE.sub(lambda m: {"lang": conf["lang"], "og": conf["og"],
                                          "base": conf["base"],
                                          "fonts": JA_FONTS if loc_code == "ja" else ""}[m.group(1)], text)
    text = CANONICAL_DIRECTIVE.sub(lambda m: f'{SHOP_HOST}{conf["base"]}{m.group(1)}', text)
    text = LANGSWITCH_DIRECTIVE.sub(lambda m: shop_language_switch(loc_code, m.group(1)), text)
    return text

DATA_I18N = re.compile(r'<([a-zA-Z0-9]+)([^>]*?)\sdata-i18n="([^"]+)"([^>]*)>(.*?)</\1>', re.DOTALL)
DATA_ATTR = re.compile(r'data-i18n-attr="([^"]+)"')
MUSTACHE = re.compile(r"\{\{t:([^}]+)\}\}")


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


def render(text: str, loc_code: str, loc: dict[str, str], strict_report: list[str], where: str) -> str:
    text = apply_locale_directives(text, loc_code)

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
    return [p for p in TEMPLATES.rglob("*") if p.is_file()]


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
        all_keys |= referenced_keys(apply_locale_directives(t.read_text(encoding="utf-8"), "en"))
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
            rendered = render(t.read_text(encoding="utf-8"), loc, data, report, f"{loc}/{rel}")
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
