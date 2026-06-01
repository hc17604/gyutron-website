# Adding a language to GYUTRON (main site + shop)

The i18n system is **data-driven**. Adding a market language is a fixed, short
checklist — you never hand-hunt scattered details. A single automated gate
(`npm run i18n:gate`) refuses to pass until the new locale is **fully** wired,
so nothing ships half-translated.

> Single source of truth: **`locales/registry.json`**. Everything (build
> pipelines, language switcher, fonts, currency, hreflang, the gate) reads it.

---

## The checklist (example: add Spanish `es`)

### 1. Register the locale — `locales/registry.json`
Add one block to `locales[]`:
```json
{
  "code": "es",
  "dir": "es",
  "htmlLang": "es",
  "ogLocale": "es_ES",
  "label": "Español",
  "short": "ES",
  "switchAria": "Seleccionar idioma y región",
  "menuAria": "Opciones de idioma",
  "cjkFont": false,
  "currency": { "code": "EUR", "rate": 0.92, "symbol": "€", "intlLocale": "es-ES", "decimals": 2, "symbolAfter": true }
}
```
- `dir` = URL/folder segment (`/es/...`). `cjkFont: true` only for CJK languages
  (loads the Noto Sans JP-style stack + line-height/weight tuning).
- `currency`: fixed-rate display. `symbolAfter` = symbol follows the number
  (European style). `decimals: 0` for yen-like currencies.

### 2. Page copy — `locales/i18n/es.json`
Copy `locales/i18n/en.json` and translate **every value** (keep the keys).
The gate fails if any key is missing or stale. Keep locked terms verbatim
(see below).

### 3. Store catalog — add an `es:` block to `shop/shop-i18n.js`
Mirror the `de:`/`ja:` blocks. Required sub-blocks (gate-enforced):
`currency, tag, category, categoryText, leadTime, products (name+summary for
EVERY SKU), specKey, specVal, ui`.

### 4. Build + gate
```bash
npm run i18n:sync     # build both pipelines + run the gate
# or just the gate:
npm run i18n:gate
```
The gate verifies, for every non-source locale:
1. registry block complete (incl. currency fields)
2. `locales/i18n/<code>.json` mirrors the source keys (no missing/extra)
3. `shop-i18n.js` has all required blocks + covers every SKU
4. generated pages exist (main + shop), no leftover `{{ }}`
5. **no residual English** in generated pages
6. all generated JS is syntactically valid

Green = launch-ready. Red = it prints the exact gaps; fix and re-run.

### 5. Commit & push
`git add -A && git commit && git push` — Cloudflare auto-deploys.

---

## Locked terms (never translated, in any language)
GYUTRON, SKU, model numbers (GY-CV220 …), RFID, NFC, PDA, MES, WMS, ERP, PLC,
API, ISO, B2B, OEM, ODM, IP67/IP65, GigE, PoE, PCIe, USB, RS232, DPM, Bluetooth,
Wi-Fi, Android, units (mm, VDC, MP). These are simply **omitted** from the
translation tables, so they pass through verbatim — do not add them as keys.

## Notes
- **Currency** is fixed-rate display, edited in one place (`registry.json`
  `rate`). Update rates periodically, or switch to true per-market pricing by
  giving each `products[sku]` a `price` in `shop-i18n.js` later.
- **Tax**: current prices are net (no VAT/consumption tax added). If a market
  needs gross display ("inkl. MwSt" / "税込"), extend `currency` with a `tax`
  field and `money()` — flagged as a future enhancement.
- The legacy main-site generator (`generate_localized_site.py`) still has some
  per-locale logic; it is being retired as the main site moves to templates.
  New languages should be added to `registry.json` regardless.
