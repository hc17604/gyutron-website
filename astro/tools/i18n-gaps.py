# -*- coding: utf-8 -*-
"""i18n translation-gap finder (architecture piece for keeping de/ja real, not English placeholders).

A "gap" = a key whose de or ja value is byte-identical to en, i.e. it was shipped as an English
placeholder and still needs translating. Brand / model / pure-technical tokens that are SUPPOSED to
stay English (GYUTRON, GY-*, RFID, SPI/AOI/AXI, SDK/API, units…) are filtered out via KEEP_EN so they
don't show up as false gaps.

Usage:
  PYTHONUTF8=1 python tools/i18n-gaps.py                 # summary by namespace
  PYTHONUTF8=1 python tools/i18n-gaps.py --list ind. sol.  # list gap keys under given prefixes
  PYTHONUTF8=1 python tools/i18n-gaps.py --dump ind. > gaps.json   # {key: en_value} for translating

Rule: visible content (nav, footer, pages) must have real de+ja. New keys may ship en-real / de-ja
placeholder, but before a content area is "done" run this and translate whatever it lists.
"""
import json, os, re, sys, collections

I18N = os.path.join(os.path.dirname(__file__), "..", "src", "i18n")

# Tokens / patterns that are intentionally kept in English in de & ja (not gaps).
KEEP_EN = {
    "GYUTRON", "RFID", "NFC", "PLC", "MES", "WMS", "PDA", "DPM", "IO-Link", "SPI", "AOI", "AXI",
    "OCR", "OCV", "OCR/OCV", "OCR-OCV", "AGV", "AMR", "AGV/AMR", "SDK", "API", "SDK / API", "EMS",
    "PCB", "PCBA", "PCB / PCBA", "SMT", "SWIR", "GS1", "BGA", "QFN", "FPC", "Mura", "3D", "2D",
    "GigE", "Wi-Fi", "IP68", "FAQ", "ROI", "OEM", "ODM", "CAD", "QR", "AI", "IoT", "EV",
}

def load(loc):
    with open(os.path.join(I18N, f"{loc}.json"), encoding="utf-8") as f:
        return json.load(f)

def is_kept_english(v):
    """True if the value is something we intentionally leave in English (so not a real gap)."""
    s = v.strip()
    if s in KEEP_EN:
        return True
    # pure acronym / model number / code (no lowercase words to translate)
    if re.fullmatch(r"[A-Z0-9][A-Z0-9 ./&+-]*", s):
        return True
    if re.fullmatch(r"GY-[A-Z0-9-]+", s):
        return True
    return False

def gaps(target):
    en, tl = load("en"), load(target)
    out = collections.OrderedDict()
    for k, v in en.items():
        if not isinstance(v, str) or not v.strip():
            continue
        if tl.get(k) == v and not is_kept_english(v):
            out[k] = v
    return out

def ns(k):
    head = k.split(".")[0]
    return head if head in ("ind", "sol", "nav", "fnav", "home", "seo", "form", "pay", "pm", "ph") else head

if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "--dump":
        prefixes = tuple(args[1:]) or ("",)
        de_g, ja_g = gaps("de"), gaps("ja")
        merged = collections.OrderedDict()
        for k, v in {**de_g, **ja_g}.items():
            if k.startswith(prefixes):
                merged[k] = v
        print(json.dumps(merged, ensure_ascii=False, indent=2))
    elif args and args[0] == "--list":
        prefixes = tuple(args[1:]) or ("",)
        for loc in ("de", "ja"):
            g = {k: v for k, v in gaps(loc).items() if k.startswith(prefixes)}
            print(f"\n[{loc}] {len(g)} gap(s):")
            for k, v in g.items():
                print(f"  {k} = {v[:60]}")
    else:
        for loc in ("de", "ja"):
            g = gaps(loc)
            by = collections.Counter(ns(k) for k in g)
            print(f"[{loc}] {len(g)} translation gaps: {dict(by)}")
