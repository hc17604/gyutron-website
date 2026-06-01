#!/usr/bin/env python3
"""Templatize + harvest main-site pages into the build-time key i18n architecture.

REUSE the already-audited legacy de/ja output as the source of truth so the new
build_i18n.py pipeline reproduces it BYTE-FOR-BYTE (verified by an empty git diff).

Per page: read the EN source (root/<page>) plus the legacy de/ and ja/ outputs,
align their body text nodes (identical DOM — only text and locale attrs differ),
and key every node whose de OR ja value differs from en. Keys are deduped
globally (the legacy translation is a single global phrase map, so the same EN
string always maps to the same DE/JA), assigned semantic-by-namespace ids
(main.NNN for shared chrome/body text, seo.<stem>.title|desc per page). The
result is written as templates/<page>.html, and the harvested values are merged
into locales/i18n/{en,de,ja}.json (preserving the existing shop keys verbatim).

Usage:  python tools/harvest_main_i18n.py [page.html ...]   (default: barcode-scanners.html)
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
I18N = ROOT / "locales" / "i18n"
TEMPLATES = ROOT / "templates"

TAG = re.compile(r"(<[^>]+>)")
# Language-switch blocks -> directives. The leading indent stays in the template;
# the directive (main_language_switch) emits the rest with absolute indentation.
MOBILE_SWITCH = re.compile(r'<div class="language-switch language-switch-mobile">.*?</div>\s*</div>', re.S)
DESKTOP_SWITCH = re.compile(r'<div class="language-switch language-switch-desktop">.*?</div>\s*</div>', re.S)

# Harvested NEW keys (merged into the existing locale files, which keep shop keys).
NEW = {"en": {}, "de": {}, "ja": {}}
# Dedup by the FULL (en, de, ja) triple, never by en alone: the same English
# word can translate differently by context (e.g. "Contact" -> ja "問い合わせ"
# in the header short label but "お問い合わせ" as the footer heading, because the
# legacy phrase map disambiguated on trailing markup). Merging only identical
# triples keeps every node's exact committed translation.
KEYMAP: dict[tuple[str, str, str], str] = {}
COUNTER = [0]


def read_head(rel: str) -> str:
    """Read a file's PRISTINE committed (HEAD) content — never the working tree,
    which build_i18n.py overwrites for pages it already owns. Guarantees the
    harvest source is the legacy-generated baseline regardless of build state."""
    r = subprocess.run(["git", "-C", str(ROOT), "show", f"HEAD:{rel}"],
                       capture_output=True)
    if r.returncode != 0:
        raise SystemExit(f"git show HEAD:{rel} failed: {r.stderr.decode('utf-8', 'replace')}")
    return r.stdout.decode("utf-8")


def split_head_body(html: str) -> tuple[str, str]:
    m = re.search(r"<body[^>]*>", html)
    return html[: m.end()], html[m.end():]


def record(key: str, en: str, de: str, ja: str) -> None:
    NEW["en"][key] = en
    NEW["de"][key] = de
    NEW["ja"][key] = ja


def key_body(en_body: str, de_body: str, ja_body: str) -> str:
    et, dt, jt = TAG.split(en_body), TAG.split(de_body), TAG.split(ja_body)
    if not (len(et) == len(dt) == len(jt)):
        raise SystemExit(f"tag-count mismatch: en={len(et)} de={len(dt)} ja={len(jt)}")
    out: list[str] = []
    for idx, seg in enumerate(et):
        if idx % 2 == 1:            # a tag — handled later (links/switch directives)
            out.append(seg)
            continue
        core = seg.strip()
        if not core:
            out.append(seg)
            continue
        d, j = dt[idx], jt[idx]
        if d == seg and j == seg:    # identical across locales -> not translatable
            out.append(seg)
            continue
        lead = seg[: len(seg) - len(seg.lstrip())]
        trail = seg[len(seg.rstrip()):]
        triple = (core, d.strip(), j.strip())
        key = KEYMAP.get(triple)
        if key is None:
            COUNTER[0] += 1
            key = f"main.{COUNTER[0]:03d}"
            KEYMAP[triple] = key
            record(key, *triple)
        out.append(f"{lead}{{{{t:{key}}}}}{trail}")
    return "".join(out)


def add_link_directives(s: str) -> str:
    """Mirror the legacy localize_links / script-src rewriting as a {{locale.path}}
    prefix. EN renders "" (bare, as today); de/ja render de//ja/."""
    s = s.replace('src="product-data.js"', 'src="{{locale.path}}product-data.js"')
    s = s.replace('src="product-catalog.js"', 'src="{{locale.path}}product-catalog.js"')

    def repl(m: re.Match[str]) -> str:
        href = m.group(1)
        if href.startswith(("http:", "https:", "mailto:", "tel:", "/", "de/", "ja/")):
            return m.group(0)
        if href.startswith("#"):
            raise SystemExit(f"bare-anchor href not handled (needs explicit {{locale.path}}): {href}")
        if ".html" not in href:
            return m.group(0)
        return f'href="{{{{locale.path}}}}{href}"'

    return re.sub(r'href="([^"]+)"', repl, s)


def grab(pat: str, text: str, group: int = 1) -> str:
    m = re.search(pat, text, re.S)
    if not m:
        raise SystemExit(f"pattern not found: {pat!r}")
    return m.group(group)


def templatize(page: str) -> str:
    stem = page[:-5]
    en = read_head(page)
    de = read_head(f"de/{page}")
    ja = read_head(f"ja/{page}")
    en_head, en_body = split_head_body(en)
    _, de_body = split_head_body(de)
    _, ja_body = split_head_body(ja)

    # ---- head: <html lang>, base tag, SEO title/desc keys, ja font block ----
    h = en_head
    h = re.sub(r'<html lang="[^"]*">', '<html lang="{{locale.lang}}">', h, count=1)
    h = h.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">{{locale.basetag}}', 1)

    en_title = grab(r"<title>(.*?)</title>", en_head)
    en_desc = grab(r'<meta name="description" content="([^"]*)">', en_head)
    record(f"seo.{stem}.title", en_title,
           grab(r"<title>(.*?)</title>", de), grab(r"<title>(.*?)</title>", ja))
    record(f"seo.{stem}.desc", en_desc,
           grab(r'<meta name="description" content="([^"]*)">', de),
           grab(r'<meta name="description" content="([^"]*)">', ja))
    h = h.replace(f"<title>{en_title}</title>", f"<title>{{{{t:seo.{stem}.title}}}}</title>", 1)
    h = h.replace(f'<meta name="description" content="{en_desc}">',
                  f'<meta name="description" content="{{{{t:seo.{stem}.desc}}}}">', 1)
    h = h.replace("</head>", "{{locale.mainfonts}}</head>", 1)

    # ---- body: key text, replace switches with directives, prefix links ----
    b = key_body(en_body, de_body, ja_body)
    b, n_mob = MOBILE_SWITCH.subn("{{locale.mainlangswitch.mobile}}", b, count=1)
    b, n_desk = DESKTOP_SWITCH.subn("{{locale.mainlangswitch.desktop}}", b, count=1)
    if (n_mob, n_desk) != (1, 1):
        raise SystemExit(f"language-switch blocks not found exactly once: mobile={n_mob} desktop={n_desk}")
    b = add_link_directives(b)
    return h + b


def main() -> None:
    pages = sys.argv[1:] or ["barcode-scanners.html"]
    for page in pages:
        tmpl = templatize(page)
        out = TEMPLATES / page
        out.write_text(tmpl, encoding="utf-8", newline="")
        print(f"wrote {out.relative_to(ROOT)}")

    for loc in ("en", "de", "ja"):
        path = I18N / f"{loc}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data.update(NEW[loc])
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8", newline="")
    print(f"harvested {len(NEW['en'])} new keys across en/de/ja "
          f"({COUNTER[0]} shared main.* + {len(NEW['en']) - COUNTER[0]} seo.*)")


if __name__ == "__main__":
    main()
