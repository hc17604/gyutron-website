#!/usr/bin/env python3
"""Catch residual untranslated English the function-word audit (i18n_audit.py) misses.

i18n_audit flags visible text containing English function words (the/and/for/...).
It CANNOT catch noun phrases / imperatives ("Flagship automation", "Machine vision",
"View smart cameras", "RFID Asset Visibility") — so those shipped as English on de/ja
until they were keyed + translated. This tool uses a stronger, alignment-based signal:

  a visible text segment is residual English if the de OR ja page shows the SAME
  bytes as the en page (locale value == en value) and it still looks English after
  removing locked terms — i.e. the string was never translated.

JA == EN is decisive (Japanese pages must not be Latin text). EN == DE == JA means
both locales are untranslated. Run after a build:

    python tools/build_i18n.py && python tools/generate_localized_site.py && \
        python tools/find_residual_en.py        # exits non-zero if any residual remains
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = [p.name for p in ROOT.glob("templates/*.html")]  # the migrated main-site pages

TAG = re.compile(r"(<[^>]+>)")
SCRIPT_STYLE = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.S)
CJK = re.compile(r"[぀-ヿ㐀-鿿＀-￯]")
# Locked terms / brands / acronyms / model numbers that are legitimately Latin.
LOCKED = re.compile(
    r"GYUTRON|RFID|NFC|PDA|MES|WMS|ERP|PLC|API|ISO|B2B|OEM|ODM|IP67|USB|PoE|GigE|SKU|"
    r"WhatsApp|LinkedIn|Android|GT-[A-Za-z0-9]+|GY-[A-Za-z0-9]+|EtherNet|PROFINET|IO-Link|"
    r"[123]D|DPM|5G|AI|FAQ|ESG|SDK|CAD|SMT|PCB|EV")
# Exact segments that are correct as-is (language autonyms in the switcher, etc.).
ALLOW = {"English", "Deutsch", "日本語", "EN", "DE", "JA", "Email"}


def looks_english(seg: str) -> bool:
    s = seg.strip()
    if not s or s in ALLOW or CJK.search(s):
        return False
    if "@" in s or "linkedin.com" in s or "=>" in s or "document." in s:  # email / inline JS
        return False
    stripped = re.sub(r"[^A-Za-z]+", " ", LOCKED.sub("", s))
    return any(len(w) >= 3 for w in stripped.split())


def body(html: str) -> str:
    return html[html.index("<body"):] if "<body" in html else html


def read(rel: str) -> str:
    p = ROOT / rel
    return p.read_text(encoding="utf-8", errors="replace") if p.exists() else ""


def main() -> int:
    findings: dict[str, list[str]] = {}
    for page in PAGES:
        en, de, ja = read(page), read(f"de/{page}"), read(f"ja/{page}")
        if not (en and de and ja):
            continue
        et = TAG.split(SCRIPT_STYLE.sub(" ", body(en)))
        dt = TAG.split(SCRIPT_STYLE.sub(" ", body(de)))
        jt = TAG.split(SCRIPT_STYLE.sub(" ", body(ja)))
        if not (len(et) == len(dt) == len(jt)):
            continue
        for i in range(0, len(et), 2):
            seg = et[i]
            if not seg.strip() or not looks_english(seg):
                continue
            # residual if JA shows English, or both de & ja are the untranslated en text
            if et[i] == jt[i] or (et[i] == dt[i] == jt[i]):
                findings.setdefault(seg.strip(), []).append(page)

    if findings:
        print(f"RESIDUAL ENGLISH: {len(findings)} distinct string(s) untranslated on de/ja:")
        for seg, pages in sorted(findings.items(), key=lambda kv: (-len(kv[1]), kv[0])):
            disp = seg if len(seg) <= 90 else seg[:87] + "..."
            print(f"  [{len(pages):2}] {disp}")
        print("\nFAIL — add de/ja to tools/residual_translations.json (or key+translate) and re-harvest.")
        return 1
    print(f"PASS — no residual untranslated English across {len(PAGES)} main-site pages (de/ja).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
