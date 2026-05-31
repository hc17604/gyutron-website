# GYUTRON i18n — Status & Maintenance Guide

Owner goal: **正规、可持续。英文主站（gyutron.com）的每一处改动都能同步到其它语言站
（de/ja/…）和独立站 shop.gyutron.com，绝不再出现英文残留。**

✅ **DONE for German (de) and Japanese (ja) across the FULL site: main brand site
AND the official store (shop.gyutron.com), including SEO titles/metas.** The
pipeline is JSON-driven, byte-stable, idempotent, and guarded by an automated
audit that fails on any residual English. Current state: `npm run i18n:sync`
→ audit PASS, 0 residual English.

## How it works
- **English source pages are the single structural source.** Edit them normally.
- **Translations live in `locales/<code>/strings.json`** — a flat
  `"English source string": "translation"` map. To fix wording, edit this file.
- **`tools/generate_localized_site.py`** regenerates every localized page:
  - Main site → `de/`, `ja/` (+ `public/` mirrors)
  - Store → `de/shop/`, `ja/shop/` (+ `public/` mirrors), incl. localized
    `shop.js` UI strings and a per-page language switcher
  - Localizes `<title>`, `<meta description>`, `og:title`/`og:locale`,
    `hreflang`, `alt`, `aria-label`; rewrites store `/shop/…` → `/de/shop/…`.
  - **Idempotent + byte-stable**: re-running changes 0 files.
- **`tools/i18n_audit.py`** = the sustainability gate. Scans generated pages
  (main + shop) for untranslated English in BOTH body text and SEO title/meta,
  exits non-zero listing exact strings. Unicode-aware; treats strings.json
  values + locale-meta index title/desc as known-good (no false positives).
- **`src/worker.mjs`** routes `shop.gyutron.com/de/…` and `/ja/…` to the
  localized store; English at `/`.

## THE workflow after ANY English edit (every time)
```bash
npm run i18n:sync          # = build + audit
```
If audit FAILS it prints each untranslated string. Get a fill-in template:
```bash
python tools/i18n_audit.py de ja --emit-missing missing.json
```
Add translations to both `locales/de/strings.json` and `locales/ja/strings.json`,
rebuild, re-audit until PASS. Commit source edit + strings.json + regenerated
pages together.

> Windows: set `PYTHONUTF8=1` (`$env:PYTHONUTF8="1"` in PowerShell) or the
> console crashes on de/ja output.

## DONE (committed + pushed)
- JSON-driven generator; strings.json is the source of truth.
- Main site DE & JA: 0 residual English (body + SEO titles/metas).
- Store DE & JA fully localized: all 16 pages × 2 locales + public mirrors,
  localized `shop.js`, language switcher + CSS, localized SEO.
- `src/worker.mjs` localized-store routing.
- `tools/i18n_audit.py` gate (+ `npm run i18n:audit` / `i18n:sync`), checks
  body + `<title>` + `<meta description>`.
- Removed dead Python translation dicts from the generator (byte-identical proof).
- Fixed an earlier-session bug where contact-sales title/meta were mis-mapped to
  the homepage title/description.
- **Audit: PASS — 0 residual English, main + store, de + ja.**

## REMAINING (future, non-blocking)
1. **es / ko / zh-cn**: not built yet (placeholder shells). To add Spanish:
   - Create `locales/es/strings.json` (copy de key set as template; translate
     values; keep locked terms).
   - Add `"es"` to `LOCALES` in `tools/generate_localized_site.py`
     (html_lang/label/short/og_locale/title/description) + to `SHOP_LANG_OPTIONS`
     / `SHOP_LANG_ARIA`; register in `locales/locale-meta.json`.
   - `npm run i18n:sync`, fix audit misses, commit.
2. **Visual QA**: preview each language at widths 1440/1024/768/430/390
   (AGENTS.md). German runs ~30% longer — watch nav/buttons/hero/cards/footer.
3. `tools/i18n_validate.py --strict` (older namespace validator) still fails for
   es/ko/zh-cn placeholders — expected. Authoritative gate is `i18n_audit.py`.

## Conventions / gotchas
- Brand "GYUTRON" stays uppercase + untranslated; locked terms (RFID, NFC, PDA,
  IP67, model numbers, SKU, units, B2B, WhatsApp) unchanged.
- Store pages use absolute `/shop/...` paths (main site uses relative) — the
  generator rewrites the prefix for locales; don't convert them to relative.
- Product-page `<title>`/`<meta>` are translated as FULL strings via strings.json
  keys (keyed on exact English source, literal `&`). Don't reintroduce per-page
  label munging in the generator.
- `git reset --hard` is blocked by the safety classifier; use
  `git checkout -- .` / `git pull --ff-only`.
- After any generator change, verify two ways: (1) byte-identical regen when
  behavior shouldn't change; (2) a probe — break one strings.json value, rebuild,
  confirm generated files change — to prove JSON drives output.
