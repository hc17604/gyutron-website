#!/usr/bin/env python3
"""Audit generated localized pages for residual (untranslated) English.

This is the sustainability gate: after ANY change to the English source pages,
run `npm run i18n:build` then `npm run i18n:audit`. The audit fails (exit 1) if
any localized page still shows English, and tells you exactly which strings need
a translation added to locales/<lang>/strings.json.

Detection uses *English-only* stop words (the, and, for, with, of, to, your, ...)
that do not exist in German; combined with a "no CJK" check this cleanly
separates untranslated English from correct German/Japanese copy, so it never
false-flags real translations.

Usage:
  python tools/i18n_audit.py                # audit all configured locales
  python tools/i18n_audit.py de ja          # audit specific locales
  python tools/i18n_audit.py --emit-missing missing.json   # write template
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES_DIR = ROOT / "locales"

# English-only function words. None of these are German or Japanese words, so a
# visible segment containing one (and no CJK) is untranslated English.
EN_ONLY = {
    "the", "and", "for", "with", "of", "to", "your", "are", "this", "that",
    "from", "into", "across", "you", "our", "their", "these", "those", "when",
    "where", "which", "while", "without", "through", "between", "around",
    "before", "after", "want", "need", "needs", "send", "share", "keep",
    "built", "build", "use", "used", "using", "make", "every", "each", "both",
    "than", "then", "about", "over", "under", "they", "them", "what", "should",
    "can", "connect", "combine", "select", "clarify", "validate", "provides",
    "specializing", "including", "becomes", "happens",
}

# Exact visible segments that are acceptable as-is (brand / locked / universal).
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
# Unicode-aware: a "word" is a run of letters. This keeps "Gehäuse" whole
# instead of splitting it into "Geh"+"use" (which would false-match English).
WORD_RE = re.compile(r"[^\W\d_]+", re.UNICODE)
CJK_RE = re.compile(r"[぀-ヿ㐀-鿿＀-￯]")
# ASCII-only check: German uses ä/ö/ü/ß, so a Latin segment with non-ASCII
# letters is almost always already localized (German), not English.
NON_ASCII_LETTER_RE = re.compile(r"[^\x00-\x7f]")


def load_locale_codes() -> list[str]:
    cfg = json.loads((LOCALES_DIR / "i18n.config.json").read_text(encoding="utf-8"))
    return [l["folder"] for l in cfg["locales"] if l.get("status") != "source"]


def visible_segments(html: str) -> list[str]:
    body = SCRIPT_STYLE_RE.sub(" ", html)
    attrs = ATTR_RE.findall(body)
    text = TAGS_RE.sub("\n", body)
    text = text.replace("&amp;", "&")
    out = []
    for chunk in text.split("\n") + attrs:
        s = WS_RE.sub(" ", chunk).strip()
        if s:
            out.append(s)
    return out


def load_known_translations(code: str) -> set[str]:
    """Translated values from strings.json are known-good copy by definition."""
    path = LOCALES_DIR / code / "strings.json"
    if not path.exists():
        return set()
    return set(json.loads(path.read_text(encoding="utf-8")).values())


def is_untranslated_english(seg: str, known: set[str] = frozenset()) -> bool:
    if seg in ALLOW_EXACT or seg in known:
        return False
    if CJK_RE.search(seg):
        return False
    # Contains German-specific letters (ä ö ü ß ...) -> already localized.
    if NON_ASCII_LETTER_RE.search(seg):
        return False
    words = [w.lower() for w in WORD_RE.findall(seg)]
    return any(w in EN_ONLY for w in words)


def audit_locale(code: str) -> dict[str, list[str]]:
    """Return {residual_english_segment: [files...]} for one locale."""
    locale_dir = ROOT / code
    known = load_known_translations(code)
    findings: dict[str, list[str]] = {}
    for f in sorted(locale_dir.glob("*.html")):
        for seg in visible_segments(f.read_text(encoding="utf-8", errors="replace")):
            if is_untranslated_english(seg, known):
                findings.setdefault(seg, []).append(f.name)
    # also audit shop pages if localized shop exists
    shop_dir = locale_dir / "shop"
    if shop_dir.is_dir():
        for f in sorted(shop_dir.glob("*.html")):
            for seg in visible_segments(f.read_text(encoding="utf-8", errors="replace")):
                if is_untranslated_english(seg, known):
                    findings.setdefault(seg, []).append("shop/" + f.name)
    return findings


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("locales", nargs="*", help="locale folders (default: all non-source)")
    parser.add_argument("--emit-missing", metavar="PATH", help="write {locale: {english: ''}} template")
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
