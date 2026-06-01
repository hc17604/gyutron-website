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
PARTIALS = TEMPLATES / "_partials"

TAG = re.compile(r"(<[^>]+>)")
# Language-switch blocks -> directives. The leading indent stays in the template;
# the directive (main_language_switch) emits the rest with absolute indentation.
MOBILE_SWITCH = re.compile(r'<div class="language-switch language-switch-mobile">.*?</div>\s*</div>', re.S)
DESKTOP_SWITCH = re.compile(r'<div class="language-switch language-switch-desktop">.*?</div>\s*</div>', re.S)
# Human-readable attributes the legacy blind phrase map translated (same set the
# audit checks). Keyed only when the de/ja value differs from en.
TRANS_ATTR = re.compile(r'(\s)(alt|aria-label|title|placeholder)="([^"]*)"')
# Inline <script>/<style> are CODE, never content. The legacy blind phrase map
# translated them (corrupting identifiers, e.g. navItems -> navArtikel); here they
# are protected as atomic blocks so de/ja carry the EN code verbatim.
CODE_BLOCK = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.S)

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


def _key_for(en: str, de: str, ja: str) -> str:
    """Existing key for this (en,de,ja) triple, or mint a new main.NNN."""
    key = KEYMAP.get((en, de, ja))
    if key is None:
        COUNTER[0] += 1
        key = f"main.{COUNTER[0]:03d}"
        KEYMAP[(en, de, ja)] = key
        record(key, en, de, ja)
    return key


def key_body(en_body: str, de_body: str, ja_body: str) -> str:
    """Key translatable TEXT nodes plus human-readable ATTRIBUTES
    (alt/aria-label/title/placeholder) whose de or ja value differs from en.
    Switch blocks must already be directive-ized before this runs, so the
    switcher's own localized aria labels aren't keyed into orphans."""
    et, dt, jt = TAG.split(en_body), TAG.split(de_body), TAG.split(ja_body)
    if not (len(et) == len(dt) == len(jt)):
        raise SystemExit(f"tag-count mismatch: en={len(et)} de={len(dt)} ja={len(jt)}")
    out: list[str] = []
    for idx, seg in enumerate(et):
        if idx % 2 == 1:            # a tag — key translatable attribute values
            de_tag, ja_tag = dt[idx], jt[idx]

            def repl_attr(m: "re.Match[str]") -> str:
                ws, name, en_val = m.group(1), m.group(2), m.group(3)
                if not en_val.strip():
                    return m.group(0)
                dm = re.search(rf'\b{name}="([^"]*)"', de_tag)
                jm = re.search(rf'\b{name}="([^"]*)"', ja_tag)
                de_val = dm.group(1) if dm else en_val
                ja_val = jm.group(1) if jm else en_val
                if de_val == en_val and ja_val == en_val:
                    return m.group(0)
                return f'{ws}{name}="{{{{t:{_key_for(en_val, de_val, ja_val)}}}}}"'

            out.append(TRANS_ATTR.sub(repl_attr, seg))
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
        out.append(f"{lead}{{{{t:{_key_for(core, d.strip(), j.strip())}}}}}{trail}")
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
        if href == "#":
            # legacy: "#" -> "<dir>/index.html" (de/ja), stays "#" on en
            return 'href="{{locale.indexhref}}"'
        if href.startswith("#"):
            # same-page anchor: en keeps "#frag", de/ja -> "<dir>/index.html#frag"
            return f'href="{{{{locale.indexbase}}}}{href}"'
        if ".html" not in href:
            return m.group(0)
        return f'href="{{{{locale.path}}}}{href}"'

    return re.sub(r'href="([^"]+)"', repl, s)


def use_partial(body: str, start: str, end: str, name: str) -> str:
    """Slice [start..end] into templates/_partials/<name>.html and replace it with
    {{include:<name>}}. First page to need it writes the partial; later pages whose
    (directive-ized) chrome matches reuse it. A page whose region is absent or
    differs (e.g. contact-sales' richer footer) keeps it INLINE instead."""
    try:
        i = body.index(start)
        j = body.index(end, i) + len(end)
    except ValueError:
        return body  # region not present in this page's shape -> leave inline
    block = body[i:j]
    path = PARTIALS / f"{name}.html"
    if path.exists():
        if path.read_text(encoding="utf-8") != block:
            print(f"  note: this page's {name} differs from the shared partial — keeping it inline")
            return body
    else:
        path.write_text(block, encoding="utf-8", newline="")
    return body[:i] + f"{{{{include:{name}}}}}" + body[j:]


def grab(pat: str, text: str, group: int = 1) -> str:
    m = re.search(pat, text, re.S)
    if not m:
        raise SystemExit(f"pattern not found: {pat!r}")
    return m.group(group)


def protect_code3(en_body: str, de_body: str, ja_body: str):
    """Replace each inline <script>/<style> block with an aligned placeholder in all
    three locales; return (en2, de2, ja2, en_blocks). Restoring en_blocks later makes
    de/ja carry the EN code verbatim — code is never translated/corrupted."""
    en_blocks: list[str] = []

    def repl_en(m: "re.Match[str]") -> str:
        en_blocks.append(m.group(0))
        return f"\x00CODE{len(en_blocks) - 1}\x00"

    ctr = [0]

    def repl_other(m: "re.Match[str]") -> str:
        i = ctr[0]
        ctr[0] += 1
        return f"\x00CODE{i}\x00"

    en2 = CODE_BLOCK.sub(repl_en, en_body)
    de2 = CODE_BLOCK.sub(repl_other, de_body)
    ctr[0] = 0
    ja2 = CODE_BLOCK.sub(repl_other, ja_body)
    return en2, de2, ja2, en_blocks


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
    # SEO meta: key any field the legacy translated (og:*, twitter:*, og:url).
    # A field whose de/ja value equals en stays literal (e.g. contact-sales og:url);
    # index.html's og:url DOES differ per locale, so it gets keyed.
    for attr, prop, suffix in (("property", "og:title", "ogtitle"),
                               ("property", "og:description", "ogdesc"),
                               ("name", "twitter:title", "twtitle"),
                               ("name", "twitter:description", "twdesc"),
                               ("property", "og:url", "ogurl")):
        pat = rf'<meta {attr}="{prop}" content="([^"]*)">'
        m_en = re.search(pat, en_head)
        if not m_en:
            continue
        ev = m_en.group(1)
        m_de = re.search(pat, de)
        m_ja = re.search(pat, ja)
        dv = m_de.group(1) if m_de else ev
        jv = m_ja.group(1) if m_ja else ev
        if dv == ev and jv == ev:
            continue
        record(f"seo.{stem}.{suffix}", ev, dv, jv)
        h = h.replace(f'<meta {attr}="{prop}" content="{ev}">',
                      f'<meta {attr}="{prop}" content="{{{{t:seo.{stem}.{suffix}}}}}">', 1)
    # og:locale -> per-locale directive; ja hreflang added on de/ja only (legacy).
    h = re.sub(r'(<meta property="og:locale" content=")[^"]*(">)', r'\1{{locale.og}}\2', h, count=1)
    h = re.sub(r'(<link rel="alternate" hreflang="de" href="[^"]*">)', r'\1{{locale.jahreflang}}', h, count=1)

    # ---- body: protect inline code, directive-ize switches, then key text+attrs ----
    en_body2, de_body2, ja_body2, code_blocks = protect_code3(en_body, de_body, ja_body)

    def strip_switches(body: str) -> "tuple[str, tuple[int, int]]":
        body, nm = MOBILE_SWITCH.subn("{{locale.mainlangswitch.mobile}}", body, count=1)
        body, nd = DESKTOP_SWITCH.subn("{{locale.mainlangswitch.desktop}}", body, count=1)
        return body, (nm, nd)

    en_b, counts = strip_switches(en_body2)
    de_b, _ = strip_switches(de_body2)
    ja_b, _ = strip_switches(ja_body2)
    if counts != (1, 1):
        raise SystemExit(f"language-switch blocks not found exactly once: {counts}")
    b = key_body(en_b, de_b, ja_b)
    b = add_link_directives(b)
    # Shared chrome -> partials; a page with a unique footer (contact-sales) keeps
    # it inline. <main> is always inline.
    b = use_partial(b, '    <div class="top-strip">', '    </header>', "main-header")
    b = use_partial(b, '    <footer ', '</footer>', "main-footer")
    # restore EN inline code so de/ja carry English code (fixes navItems->navArtikel)
    for idx, blk in enumerate(code_blocks):
        b = b.replace(f"\x00CODE{idx}\x00", blk)
    return h + b


def preload_keymap() -> None:
    """Seed KEYMAP/COUNTER from already-harvested keys so shared chrome reuses the
    SAME key ids on every page (partials stay byte-stable regardless of how a
    page's unique <main> shifts the counter) and new main.* keys continue past the
    current max. Idempotent across runs and across different page sets."""
    try:
        en = json.loads((I18N / "en.json").read_text(encoding="utf-8"))
        de = json.loads((I18N / "de.json").read_text(encoding="utf-8"))
        ja = json.loads((I18N / "ja.json").read_text(encoding="utf-8"))
    except FileNotFoundError:
        return
    mx = 0
    for k, v in en.items():
        if k.startswith("main."):
            KEYMAP[(v, de.get(k, ""), ja.get(k, ""))] = k
            try:
                mx = max(mx, int(k.split(".", 1)[1]))
            except (IndexError, ValueError):
                pass
    COUNTER[0] = mx


def main() -> None:
    pages = sys.argv[1:] or ["barcode-scanners.html"]
    preload_keymap()
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
    new_main = sum(1 for k in NEW["en"] if k.startswith("main."))
    new_seo = sum(1 for k in NEW["en"] if k.startswith("seo."))
    print(f"harvested {len(NEW['en'])} new keys ({new_main} new main.* + {new_seo} seo.*); max main id = {COUNTER[0]}")


if __name__ == "__main__":
    main()
