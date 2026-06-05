# -*- coding: utf-8 -*-
"""GYUTRON product i18n completeness audit (Astro era).

Run after ANY change to astro/src/data/products.*.js:
    python tools/i18n-audit.py        (exit 1 if problems found)

Flags, for de + ja:
  - category fields (eyebrow/title/navLabel/panelText/sectionIntro/intro)
    and product type/summary that are MISSING, == the English value (untranslated),
    or contain '?' mojibake (non-UTF-8 write — see HANDOFF.md / AGENTS.md).
  - leftover ENGLISH prose, incl. PARTIAL translations
    (ja: 4+ consecutive Latin words; de: English-only marker words).
  - product model NAMES that differ across locales (names must stay brand-invariant,
    e.g. "GY-CR720 Conveyor" everywhere — do NOT translate the model name).

Redirect-only categories (industrial-sensors / smart-cameras / inspection-instruments)
are not rendered; their fields are reported under a separate, non-fatal heading.
"""
import os, re, sys

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "astro", "src", "data")
CATF = ("eyebrow", "title", "navLabel", "sectionTitle", "panelText", "sectionIntro", "intro")
REDIRECT = {"industrial-sensors", "smart-cameras", "inspection-instruments"}
# (category, field) pairs intentionally kept as the English/brand term (allowed to == en):
WHITELIST = {("android-pda", "navLabel")}
JA_ENG = re.compile(r"[A-Za-z]+ [A-Za-z]+ [A-Za-z]+ [A-Za-z]+")
DE_ENG = re.compile(r"\b(the|and|with|jobs|keeps|buyers|think|stay|mixing|without|devices|together|instead|need|away|while|both|covers|workflows|tools)\b")


def read(loc):
    return open(os.path.join(DATA, "products.%s.js" % loc), encoding="utf-8").read()


def cat_fields(txt):
    out = {}
    for m in re.finditer(r'"([\w-]+)":\s*\{(.*?)products\s*:', txt, re.S):
        cat, body, f = m.group(1), m.group(2), {}
        for fm in re.finditer(r"\b(" + "|".join(CATF) + r')\s*:\s*"((?:[^"\\]|\\.)*)"', body):
            f.setdefault(fm.group(1), fm.group(2))
        out[cat] = f
    return out


def prods(txt):
    out = {}
    for m in re.finditer(r'name:\s*"([^"]+)"\s*,\s*type:\s*"((?:[^"\\]|\\.)*)"\s*,\s*summary:\s*"((?:[^"\\]|\\.)*)"', txt):
        out[m.group(1)] = {"type": m.group(2), "summary": m.group(3)}
    return out


def main():
    en_t, de_t, ja_t = read("en"), read("de"), read("ja")
    en_c, de_c, ja_c = cat_fields(en_t), cat_fields(de_t), cat_fields(ja_t)
    en_p, de_p, ja_p = prods(en_t), prods(de_t), prods(ja_t)
    fatal, soft = [], []

    def check(loc_c, loc_p, loc, eng):
        for cat in en_c:
            bucket = soft if cat in REDIRECT else fatal
            for f in CATF:
                e = en_c[cat].get(f)
                if e is None:
                    continue
                v = loc_c.get(cat, {}).get(f)
                if v is None or (v == e and (cat, f) not in WHITELIST) or v.count("?") >= 3 or eng.search(v):
                    bucket.append("%s [%s.%s]" % (loc, cat, f))
        for name in en_p:
            for f in ("type", "summary"):
                e = en_p[name][f]
                v = loc_p.get(name, {}).get(f)
                if v is None or v == e or v.count("?") >= 3 or eng.search(v):
                    fatal.append("%s product [%s.%s]" % (loc, name, f))

    check(ja_c, ja_p, "JA", JA_ENG)
    check(de_c, de_p, "DE", DE_ENG)

    # model-name consistency (names must match across locales)
    for name in en_p:
        if name not in ja_p:
            fatal.append("JA product NAME missing/renamed: %s" % name)
        if name not in de_p:
            fatal.append("DE product NAME missing/renamed: %s" % name)

    if fatal:
        print("i18n AUDIT — %d problems (RENDERED pages):" % len(fatal))
        for x in fatal:
            print("  -", x)
    else:
        print("i18n AUDIT: rendered pages OK (de + ja fully localized).")
    if soft:
        print("\n(redirect-only categories, not rendered — non-fatal): %d" % len(soft))
    sys.exit(1 if fatal else 0)


if __name__ == "__main__":
    main()
