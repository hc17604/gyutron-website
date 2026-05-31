#!/usr/bin/env python3
"""Audit generated localized pages for residual (untranslated) English.

This is the sustainability gate. After ANY change to the English source pages:

    python tools/generate_localized_site.py      # rebuild localized pages
    python tools/i18n_audit.py de ja             # fail if English remains

It exits non-zero and lists the exact strings if any localized page still shows
English, so nothing silently ships untranslated.

Detection:
  * Body text: flag a visible segment that contains an English-only function
    word (the, and, for, with, of, to, your, ...) and no CJK / non-ASCII letter.
    German/Japanese copy never contains these, so real translations never trip.
  * SEO <title> / <meta description>: these are often pure content words
    ("Industrial Automation Products") with no function words, so they get a
    dedicated check -- a localized page whose title/meta is still pure ASCII
    English (after removing brand/locked terms) is untranslated.

Usage:
  python tools/i18n_audit.py                 # all non-source locales
  python tools/i18n_audit.py de ja           # specific locales
  python tools/i18n_audit.py de --emit-missing missing.json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES_DIR = ROOT / "locales"

# English-only function words. None are German or Japanese words, so a visible
# segment containing one (and no CJK/non-ASCII letters) is untranslated English.
EN_ONLY = {
    "the", "and", "for", "with", "of", "to", "your", "are", "this", "that",
    "from", "into", "across", "you", "our", "their", "these", "those", "when",
    "where", "which", "while", "without", "through", "between", "around",
    "before", "after", "want", "need", "needs", "send", "share", "keep",
    "built", "build", "use", "used", "using", "make", "every", "each", "both",
    "than", "then", "about", "over", "under", "they", "them", "what", "should",
    "can", "connect", "combine", "select", "clarify", "validate", "provides",
    "specializing", "including", "becomes", "happens", "ready", "only",
}

# Exact visible segments acceptable as-is (brand / locked / universal).
ALLOW_EXACT = {
    "GYUTRON", "RFID", "NFC", "PDA", "USB", "PoE", "GigE", "MES", "WMS",
    "IO-Link", "PROFINET", "EtherNet/IP", "5G", "OEM", "ODM", "DPM",
    "End-of-Line", "linkedin.com/company/gyutron", "shop.gyutron.com",
    "www.gyutron.com",
}

SCRIPT_STYLE_RE = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.DOTALL | re.IGNORECASE)
ATTR_RE = re.compile(r'(?:alt|aria-label|title|placeholder)="([^"]*)"')
TAGS_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")
# Unicode-aware word: a run of letters. Keeps "Gehäuse" whole instead of
# splitting into "Geh"+"use" (which would false-match English "use").
WORD_RE = re.compile(r"[^\W\d_]+", re.UNICODE)
CJK_RE = re.compile(r"[぀-ヿ㐀-鿿＀-￯]")
# German uses ä/ö/ü/ß, etc. A Latin segment with non-ASCII letters is localized.
NON_ASCII_LETTER_RE = re.compile(r"[^\x00-\x7f]")
TITLE_RE = re.compile(r"<title>([^<]*)</title>")
META_DESC_RE = re.compile(r'<meta name="description" content="([^"]*)"')


def load_locale_codes() -> list[str]:
    cfg = json.loads((LOCALES_DIR / "i18n.config.json").read_text(encoding="utf-8"))
    return [l["folder"] for l in cfg["locales"] if l.get("status") != "source"]


def load_known_translations(code: str) -> set[str]:
    """Known-good copy for a locale: all translated values in strings.json PLUS
    the per-locale index <title>/<meta description> configured in
    locale-meta.json (those are authored German/Japanese and may be all-ASCII,
    e.g. 'Industrielle Bildverarbeitung ...', so list them as known)."""
    known: set[str] = set()
    path = LOCALES_DIR / code / "strings.json"
    if path.exists():
        known |= set(json.loads(path.read_text(encoding="utf-8")).values())
    meta_path = LOCALES_DIR / "locale-meta.json"
    if meta_path.exists():
        meta = json.loads(meta_path.read_text(encoding="utf-8")).get(code, {})
        for key in ("title", "description"):
            if meta.get(key):
                known.add(meta[key])
    return known


def visible_segments(html: str) -> list[str]:
    body = SCRIPT_STYLE_RE.sub(" ", html)
    attrs = ATTR_RE.findall(body)
    text = TAGS_RE.sub("\n", body).replace("&amp;", "&")
    out = []
    for chunk in text.split("\n") + attrs:
        s = WS_RE.sub(" ", chunk).strip()
        if s:
            out.append(s)
    return out


def is_untranslated_english(seg: str, known: set[str] = frozenset()) -> bool:
    if seg in ALLOW_EXACT or seg in known:
        return False
    if CJK_RE.search(seg) or NON_ASCII_LETTER_RE.search(seg):
        return False
    words = [w.lower() for w in WORD_RE.findall(seg)]
    return any(w in EN_ONLY for w in words)


def metadata_leaks(html: str, known: set[str]) -> list[str]:
    """<title>/<meta description> are often pure content words the function-word
    heuristic misses. On a localized page, such a field still in pure ASCII
    English (after removing brand/locked terms) is untranslated."""
    leaks = []
    for pat in (TITLE_RE, META_DESC_RE):
        m = pat.search(html)
        if not m:
            continue
        value = m.group(1).strip()
        if not value or value in known:
            continue
        stripped = value
        for term in ALLOW_EXACT:
            stripped = stripped.replace(term, "")
        if NON_ASCII_LETTER_RE.search(stripped):
            continue
        if re.search(r"[A-Za-z]{4,}", stripped):
            leaks.append(value)
    return leaks


def audit_file(path: Path, label: str, known: set[str], findings: dict[str, list[str]]) -> None:
    html = path.read_text(encoding="utf-8", errors="replace")
    for seg in visible_segments(html):
        if is_untranslated_english(seg, known):
            findings.setdefault(seg, []).append(label)
    for seg in metadata_leaks(html, known):
        findings.setdefault(seg, []).append(label)


def audit_locale(code: str) -> dict[str, list[str]]:
    """Return {untranslated_english_segment: [files...]} for one locale."""
    locale_dir = ROOT / code
    known = load_known_translations(code)
    findings: dict[str, list[str]] = {}
    for f in sorted(locale_dir.glob("*.html")):
        audit_file(f, f.name, known, findings)
    shop_dir = locale_dir / "shop"
    if shop_dir.is_dir():
        for f in sorted(shop_dir.glob("*.html")):
            audit_file(f, "shop/" + f.name, known, findings)
    return findings


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Audit localized pages for residual English.")
    parser.add_argument("locales", nargs="*", help="locale folders (default: all non-source)")
    parser.add_argument("--emit-missing", metavar="PATH", help="write {locale:{english:''}} template")
    args = parser.parse_args()

    codes = args.locales or load_locale_codes()
    total = 0
    emit: dict[str, dict[str, str]] = {}
    for code in codes:
        if not (ROOT / code).is_dir():
            continue
        findings = audit_locale(code)
        emit[code] = {seg: "" for seg in findings}
        total += len(findings)
        print(f"\n=== {code}: {len(findings)} distinct untranslated English segments ===")
        for seg, files in sorted(findings.items(), key=lambda kv: (-len(kv[1]), kv[0]))[:200]:
            disp = seg if len(seg) <= 100 else seg[:97] + "..."
            print(f"  [{len(files):2}] {disp}")

    if args.emit_missing:
        Path(args.emit_missing).write_text(
            json.dumps(emit, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"\nWrote missing-string template -> {args.emit_missing}")

    if total:
        print(f"\nFAIL: {total} untranslated English segment(s) across {len(codes)} locale(s).")
        return 1
    print(f"\nPASS: no residual English in {len(codes)} locale(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
