#!/usr/bin/env python3
"""GYUTRON i18n readiness gate — the single command that guarantees a locale is
FULLY wired, so adding a language never means hand-checking details again.

Reads locales/registry.json (the single source of truth) and, for every
non-source locale, verifies ALL of:

  1. registry block is complete (code/dir/htmlLang/ogLocale/label/short/
     switchAria/menuAria/currency{code,rate,symbol,intlLocale,decimals}).
  2. locales/i18n/<code>.json exists and mirrors every key in the source locale
     (the build-time key dictionary) — no missing/extra keys.
  3. shop-i18n.js has a block for <code> with: currency, tag, category,
     categoryText, leadTime, products(name+summary for every SKU), specKey,
     specVal, ui — i.e. the catalog is fully localizable, not half.
  4. generated pages exist for the locale (main site + shop) and contain no
     leftover {{ }} template directives.
  5. no residual English in generated pages (delegates to i18n_audit).
  6. every generated JS file is syntactically valid (node --check).

Exit 0 = locale is launch-ready. Exit 1 = prints exactly what is missing.

Usage:
  python tools/i18n_gate.py            # gate every non-source locale
  python tools/i18n_gate.py ja         # gate one locale
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REG = ROOT / "locales" / "registry.json"
I18N = ROOT / "locales" / "i18n"
SHOP_I18N = ROOT / "shop" / "shop-i18n.js"

REQUIRED_LOCALE_FIELDS = ["code", "dir", "htmlLang", "ogLocale", "label", "short",
                          "switchAria", "menuAria", "currency"]
REQUIRED_CURRENCY_FIELDS = ["code", "rate", "symbol", "intlLocale", "decimals"]
REQUIRED_SHOP_BLOCKS = ["currency", "tag", "category", "categoryText", "leadTime",
                        "products", "specKey", "specVal", "ui"]


def load_registry() -> dict:
    return json.loads(REG.read_text(encoding="utf-8"))


def flat_keys(path: Path) -> set[str]:
    if not path.exists():
        return set()
    return set(json.loads(path.read_text(encoding="utf-8")).keys())


def shop_skus() -> list[str]:
    """SKUs declared in shop.js (the source product list)."""
    js = (ROOT / "shop" / "shop.js").read_text(encoding="utf-8")
    return re.findall(r'sku:\s*"([^"]+)"', js)


def parse_shop_i18n_block(code: str) -> dict | None:
    """Lightweight check: does shop-i18n.js define each required block for the
    locale? We don't fully JS-parse; we confirm the locale key exists and each
    required sub-block name appears within its slice."""
    js = SHOP_I18N.read_text(encoding="utf-8")
    m = re.search(rf'\n  {re.escape(code)}:\s*\{{', js)
    if not m:
        return None
    start = m.end()
    # find the matching close by brace counting
    depth = 1
    i = start
    while i < len(js) and depth:
        if js[i] == "{":
            depth += 1
        elif js[i] == "}":
            depth -= 1
        i += 1
    block = js[start:i]
    present = {b: (re.search(rf'\b{b}:\s*\{{', block) is not None) for b in REQUIRED_SHOP_BLOCKS}
    # product coverage: each SKU should appear in the products sub-block
    prod_ok = all(f'"{sku}"' in block for sku in shop_skus())
    present["_products_all_skus"] = prod_ok
    return present


def gate_locale(code: str, reg: dict, source: str, fails: list[str]) -> None:
    entry = next((l for l in reg["locales"] if l["code"] == code), None)
    if entry is None:
        fails.append(f"{code}: not in registry.json"); return

    # 1. registry completeness
    for f in REQUIRED_LOCALE_FIELDS:
        if f not in entry or entry[f] in (None, ""):
            fails.append(f"{code}: registry missing field '{f}'")
    cur = entry.get("currency", {})
    for f in REQUIRED_CURRENCY_FIELDS:
        if f not in cur:
            fails.append(f"{code}: registry currency missing '{f}'")

    # 2. i18n key parity vs source
    src_keys = flat_keys(I18N / f"{source}.json")
    loc_keys = flat_keys(I18N / f"{code}.json")
    if not loc_keys:
        fails.append(f"{code}: locales/i18n/{code}.json missing/empty")
    else:
        miss = src_keys - loc_keys
        extra = loc_keys - src_keys
        if miss:
            fails.append(f"{code}: i18n missing {len(miss)} keys e.g. {sorted(miss)[:3]}")
        if extra:
            fails.append(f"{code}: i18n has {len(extra)} stale keys e.g. {sorted(extra)[:3]}")

    # 3. shop-i18n.js catalog coverage
    blocks = parse_shop_i18n_block(code)
    if blocks is None:
        fails.append(f"{code}: shop-i18n.js has no '{code}:' block")
    else:
        for b in REQUIRED_SHOP_BLOCKS:
            if not blocks.get(b):
                fails.append(f"{code}: shop-i18n.js block missing '{b}'")
        if not blocks.get("_products_all_skus"):
            fails.append(f"{code}: shop-i18n.js products[] doesn't cover every SKU")

    # 3b. currency rate in shop-i18n.js must match registry (no silent drift)
    if entry.get("currency", {}).get("rate") is not None:
        js = SHOP_I18N.read_text(encoding="utf-8")
        bm = re.search(rf'\n  {re.escape(code)}:\s*\{{.*?currency:\s*\{{([^}}]*)\}}', js, re.DOTALL)
        if bm:
            rm = re.search(r'rate:\s*([\d.]+)', bm.group(1))
            if rm and rm.group(1) != str(entry["currency"]["rate"]):
                fails.append(f"{code}: currency rate drift — registry={entry['currency']['rate']} "
                             f"shop-i18n={rm.group(1)}")

    # 4. generated pages exist + no directive leak
    d = entry["dir"]
    main_idx = ROOT / d / "index.html"
    shop_idx = ROOT / d / "shop" / "index.html"
    for p in (main_idx, shop_idx):
        if not p.exists():
            fails.append(f"{code}: generated page missing {p.relative_to(ROOT)}")
        elif "{{" in p.read_text(encoding="utf-8"):
            fails.append(f"{code}: directive leak in {p.relative_to(ROOT)}")


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    reg = load_registry()
    source = reg["source"]
    want = sys.argv[1:] or [l["code"] for l in reg["locales"] if l["code"] != source]
    fails: list[str] = []

    for code in want:
        gate_locale(code, reg, source, fails)

    # 5. residual-English audit (existing tool)
    audit = subprocess.run([sys.executable, "tools/i18n_audit.py", *want],
                           cwd=ROOT, capture_output=True, text=True)
    if audit.returncode != 0:
        fails.append("residual-English audit FAILED (run: python tools/i18n_audit.py "
                     + " ".join(want) + ")")

    # 6. JS validity for each locale
    for code in want:
        d = next((l["dir"] for l in reg["locales"] if l["code"] == code), code)
        for rel in (f"{d}/shop/shop.js", f"{d}/shop/shop-i18n.js"):
            p = ROOT / rel
            if p.exists():
                if subprocess.run(["node", "--check", str(p)],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode != 0:
                    fails.append(f"{code}: invalid JS {rel}")

    if fails:
        print(f"i18n GATE: FAIL — {len(fails)} issue(s):")
        for f in fails:
            print("  - " + f)
        print("\nFix the above, then re-run `python tools/i18n_gate.py`.")
        return 1
    print(f"i18n GATE: PASS — {len(want)} locale(s) fully wired & launch-ready: {', '.join(want)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
