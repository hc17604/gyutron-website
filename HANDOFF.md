# GYUTRON gyutron.com — Engineering Handoff (single source of truth)

> Consolidated handoff for the agent/engineer taking over. **This supersedes the older, partly-stale rules in `AGENTS.md` where they conflict** (see §10). Last updated 2026-06-03. Current live HEAD: use `git rev-parse origin/main` after `git fetch`.
> Talk to the user in **Chinese**; keep code / i18n keys / brand names verbatim.

---

## 0. TL;DR — the 5 things that BREAK the site if you get them wrong
1. **The site is now ASTRO** (everything lives in the **`astro/`** subdir). The old root-level `*.html` pages + the Python generator are DEAD/legacy.
2. **NEVER run the legacy generator** — `npm run i18n:build`, `npm run i18n:sync`, or `tools/generate_localized_site.py`. It regenerates legacy pages into `public/` and **CLOBBERS the Astro site**. *(This contradicts old AGENTS.md lines 17–18 — ignore those.)*
3. **Deploy = build Astro → copy changed output into `public/` → commit → push.** Cloudflare serves the committed `public/`. See §3.
4. **shop.gyutron.com is OUT OF SCOPE.** Never touch `public/shop`, `public/de/shop`, `public/ja/shop`, or shop i18n keys.
5. **`t(locale,key)` THROWS on a missing key** (intentional build gate). Any new visible text needs **en + de + ja** or the build fails.
6. **Write de/ja TEXT as UTF-8.** Never write Japanese/German via a Python process without `PYTHONUTF8=1` / `PYTHONIOENCODING=utf-8` — it silently corrupts the characters to `?` (mojibake). *(This exact bug hit the new 900-series products' Japanese `type`/`summary` in `products.ja.js`.)* Edit the json/data files directly as UTF-8; after any de/ja data edit, `grep -nP '\?{4,}'` the file — it must be empty.
7. **Product data must be FULLY localized; run the audit.** Every product's `type`/`summary` and every category's eyebrow/title/navLabel/panelMetric/panelText/sectionIntro need de+ja translations (this was a systemic gap — ~60 products + many category fields shipped English). **Run `python tools/i18n-audit.py`** after any `products.*.js` change (exit 0 = clean; catches untranslated / partial-English / mojibake / renamed-model-name). **NEVER translate a product model NAME** — keep `GY-CR720 Conveyor` etc. identical in all locales (and matching the `getProductsByName` refs).
8. **Dual-agent sync + long-term architecture.** Claude AND Codex both develop this repo — `git fetch` then **READ this `HANDOFF.md` before every task**, and **UPDATE it after every task** (see §4). On every change follow the **long-term architecture principles (§11)** — componentize, data-drive, static/SEO/perf/i18n-ready, industrial visual, don't over-engineer.

---

## 1. What / where
- gyutron.com main site, rewritten in **Astro 5** (`output:'static'`, `build.format:'preserve'` so URLs byte-match the legacy site). 21 pages × 3 locales (en `/`, de `/de/`, ja `/ja/`) = **63 pages**. LIVE.
- GitHub **hc17604/gyutron-website** (public). Local working copy: `D:\Codex\workspaces\2026-05-17\files-mentioned-by-the-user-gyutron\gyutron-website-repo`. Astro project = `astro/`.

## 2. Design rule (hard requirement, all gyutron.com work)
**Industrial / rugged / hard-edged — NOT a soft "software-company" look.** (The lucid.co floating-cards style was rejected.) Reference: **thinklucid.com** — dark, product-forward, hard edges (border-radius 0), uppercase technical type, real imagery, square page dots. Use GYUTRON's own copy/images + **brand purple**: `--purple-500 #8a63d2` for accents on dark (the true `--brand-purple #4b2e83` is too dark to read on near-black). Keep GYUTRON brand text uppercase in visible copy.

## 3. Deploy procedure (EVERY change)
1. Edit `astro/src/**` (components/pages/data/i18n) or `astro/public/**` (static CSS/assets).
2. **`cd astro && npx astro build`** → builds 63 pages. A missing i18n key throws here = good gate.
3. **Sync changed build output into `public/`** (only `public/` deploys; never touch shop subtrees):
   - `cp astro/dist/index.html public/index.html`
   - `cp astro/dist/de/index.html public/de/index.html`
   - `cp astro/dist/ja/index.html public/ja/index.html`
   - plus any changed `astro/dist/<file>.css` / `_astro/<hashed>` → same relative path in `public/`.
4. Guard (§4), then commit `astro/` + `public/` and push to `main` → **Cloudflare auto-deploys (~1–2 min, no build step on Cloudflare)**.
- Cloudflare Worker: `wrangler.toml` → main=`src/worker.mjs`, `[assets] directory="./public"`, `run_worker_first=true`. Worker maps `/api/contact`→`contact-handler.mjs`, `shop.gyutron.com`→`/shop/` `/de/shop/` `/ja/shop/`, everything else → `env.ASSETS.fetch`. Cloudflare Assets default `html_handling` 307-redirects `/x.html`→`/x` (clean URLs) — pre-existing, harmless.
- **Media** (png/jpg/webp) are git-tracked in BOTH `public/` (deployed) and `astro/public/` (build/preview source) — keep both in sync. 72 product renders at `public/product-images/`; transparent product cutouts at `public/product-cutouts/`.

## 4. Concurrency + commit protocol
- More than one agent (and a human) may push. **Before any edit AND immediately before every push:** `git fetch` and confirm `git rev-parse HEAD == origin/main`. Reconcile if diverged.
- Commit PROMPTLY — don't leave uncommitted work a blind `git add -A` could sweep up. Prefer **`git add -- astro/ public/`** (plus explicit doc paths), not blind `-A`.
- Never kill `node` (agent tooling runs on node). Windows quirks: git's "LF will be replaced by CRLF" warning is harmless; PowerShell shows `git push` stderr as a red error even on success — trust the `local==origin` re-check, not the red text.
- **USER PREFERENCE: deploy directly, do NOT ask "deploy now?".** Still build + visually verify (desktop + mobile) + run the guard, then commit + push autonomously.
- **🔄 DUAL-AGENT MD SYNC (Claude + Codex both develop this repo).** This `HANDOFF.md` is how the two agents hand off — keep it the LIVE source of truth, not a stale snapshot. **BEFORE every task:** `git fetch` + RE-READ this file (+ the `AGENTS.md` banner) — structure/keys/state drift between sessions (e.g. nav scrollbar CSS got centralized into `nav-chrome.css`; `Layout.astro` moved to `src/layouts/`). **AFTER every task:** UPDATE this file in the SAME commit — bump "Last updated", and reflect what changed (new/moved components, new data files, new i18n keys, new gotchas, completed/added TODOs) so the other agent never works from a stale map. Keep doc edits surgical.

## 5. Architecture
- **i18n**: dicts `astro/src/i18n/{en,de,ja}.json`; `src/i18n/index.ts` exposes `t(locale,key)` (THROWS on missing), `localizeUrl(locale,path)`, `ogLocale/htmlLang/...`. New text → **reuse existing translated `main.*` / `seo.*` / `home.*` keys** where possible; if you must add a key, add it to **all three** json files.
- **Layout**: `astro/src/layouts/Layout.astro` (per-locale canonical + hreflang + og, ja font block, loads page CSS via `pageCss` + shared chrome). **Components** (`astro/src/components/`): `Header`, `Footer`, `LangSwitch`, `Home`, `ProductPage`, `SolutionPage`, `ContactSales`, `MetaRedirect`, **`HeroSlider`**, `TabCarousel`. *(Toward the long-term structure — §11 — components may later group into common/home/product/solution subfolders; migrate incrementally + announce.)*
- **Products**: build-time from `src/data/products.{en,de,ja}.js` via `pages/[category].astro` (+ `de/` + `ja/`). Per-locale files (title/intro/summary/type translated). **`specs`/`tags` are canonical English** — the spec object KEYS double as compare-table identifiers (`s.Scan`/`s.RFID`…) so they MUST stay English — and are **localized at RENDER time by `src/lib/productI18n.ts`** (`specLabel/specVal/tagText`: maps the 85 field labels + descriptive values + descriptive tags → de/ja, with **English passthrough** for anything unlisted, incl. universal tech notation like Android 14 / IP68 / GigE / Wi-Fi 6E / mAh / MP / protocols which intentionally stays English). Used by `ProductPage.astro` + `HeroSlider.astro`. **Adding a product with a NEW descriptive value/tag → add one row to the matching map in `productI18n.ts`** (it's UTF-8 — never write its ja/de via non-UTF-8 Python). 3 redirect categories: smart-cameras→area-scan-cameras, industrial-sensors→proximity-sensors, inspection-instruments→dimensional-gauges.
- **CSS** in `astro/public/` (loaded via Layout `pageCss` plus shared chrome): `global.css`, `product-page.css`, `solution-page.css`, `contact-page.css`, `mobile-navigation.css`, `home-sections.css`, `hero-slider.css`, `nav-chrome.css`.
- **Shared chrome rule (hard):** Header/Footer/nav/language/global interaction changes must be treated as cross-locale AND cross-page-type work. The same `Header.astro` renders en/de/ja, but different page types load different CSS (`global.css`, `product-page.css`, `contact-page.css`, etc.). Do not assume an English homepage CSS fix reaches Japanese/German product pages. Either move the behavior into a truly shared stylesheet/component, or update every stylesheet that controls that shared UI, then verify at least one en page, one de page, one ja product page, and contact-sales before shipping.
- **Pages**: index, [category], automated-vision-inspection, contact-sales — each × en/de/ja.

## 6. HERO — `HeroSlider.astro` + `src/data/heroSlides.ts` + `public/hero-slider.css`
The most-iterated piece. **3 DISTINCT layouts** (field `layout` in `heroSlides.ts`), not one template. **No colored bars** (removed — old AGENTS.md line 14 is stale).
- **① `solutions`** — brand CAPABILITY overview (user: slide 1 must overview *overall capability coverage*, not one narrow solution). Left copy (kicker `main.265`, title `main.350` "Hardware that sees, senses, scans, measures, and acts.", sub `main.351`, CTAs `main.347` + `home.tc.cta`) + right **2×2 industry photo collage** (`/nav-industry-{automotive-ev,electronics-smt,semiconductor,logistics-rfid}.png`, captions `home.tc.{auto,elec,logistics}.label` + `hero.s1.semi`).
- **② `grid`** — FARSET-style product family grid. Left copy (kicker `main.004`, title `hero.s2.title`, sub `main.363`, CTA `main.347`) + right **4×3 grid of 12 transparent product cutouts** (`/product-cutouts/gy-*.png`, ≥1 per product line).
- **③ `product`** — single-product spotlight (GY-A80 Ultra). Big transparent cutout `/product-cutouts/gy-a80-ultra.png` on dark + purple radial glow (`.hsl-prod-visual::before`); eyebrow/title/summary/specs/tags pulled LIVE from `products.{locale}.js`; CTA `main.338`. **Animation: product enters FIRST (~250ms), text staggers after (`PSEQ` in HeroSlider.astro)** — user requirement "先产品后文字".
- Only **2** hero-specific i18n keys exist: `hero.s1.semi`, `hero.s2.title` (each en/de/ja). Everything else reuses existing translated keys + per-locale product data.
- **Mechanism (do NOT regress to WAAPI — it rendered all-black):** slides crossfade via `.hsl-slide.is-active` + CSS opacity/visibility; layers enter via `@keyframes hslIn` (per-layer inline `--fx/--fy/--fs/--delay/--dur`). Inline `<script is:inline>` toggles `.is-active` and autoplays (`cycle = entrance + HOLD 3300ms`); dot click navigates; **focus-pause only — hover does NOT pause** (`CONFIG.pauseOnHover:false`, user requested); `prefers-reduced-motion` respected. Accent purple; 3 square dots.
- **📱 Mobile (≤860px) = FLOW layout, not absolute.** On mobile, slides become `position:relative` + only `.is-active` shown (`display:none` for others) so `.hsl{height:auto}` sizes to the active slide's content → **zero clipping at any phone height**; dots flow below. (A fixed-height absolute-layer hero clipped tall mobile content — that was the bug, fixed in the `hero-slider.css` ≤860 media query.)

## 7. Product image cutouts — and the user's preference
- Tool: **`D:\Codex Data\_cutout.py`** (Python + Pillow + numpy). Source `gy-*.png` are white-background catalog renders. It removes the background by **unmatte-from-white**: connected-background flood-fill from the borders (thresh ~235) → alpha = 1−min(rgb) in that region → un-blend the white `F = (observed − (1−α)) / α`. Result: clean anti-aliased edges, **no white halo**, colors faithful (looks identical when placed back on white, so it stays consistent with the product pages). Run `python _cutout.py --batch` → writes to `public/product-cutouts/` + `astro/public/product-cutouts/`. Verify by compositing on DARK and viewing (transparency can't be judged on a white preview).
- ⚠️ **The user is NOT satisfied with auto-generated cutouts and prefers to own the product imagery** (or use a dedicated image tool). Do not ship questionable cutouts. Prefer asking the user for transparent / dark-background product renders, and keep imagery CONSISTENT across each product line (same canvas ratio, background, angle, subject scale, direction) — see AGENTS.md product-catalog rules (still valid).
- **2026-06-02 image rule:** for homepage product matrices and any product that will be listed in a catalog category, treat each product as its own maintainable asset. Prefer final transparent PNGs from the start. Do **not** create white-background product renders for production; if a chroma-key background is used as an intermediate, remove it locally and deploy only the final alpha PNG. Avoid one baked 12-product matrix image because the user may swap a single product later.
- **2026-06-03 product accent color rule:** generated product renders must use the official GYUTRON logo purple for physical device accents: `#4b2e83` (same as `--brand-purple` / `gyutron-logo-purple.png`). Do not let image generation drift into blue-purple, pink-purple, neon purple, or the lighter UI accent `#8a63d2`. `#8a63d2` is only for readable UI highlights/glows on dark backgrounds; product buttons, trims, rings, side rails, and brand accent panels should match `#4b2e83`.
- **Product image library (2026-06-03):** before generating, replacing, or wiring product images, read `docs/product-image-library.json` / `.md`. Rebuild it with `node tools/build_product_image_library.mjs` after any product data change. Final reusable transparent PNGs belong in `astro/public/product-library/transparent/` (and build/sync to `public/product-library/transparent/`). Chroma-key intermediates and source archives belong under `asset-workbench/product-images/`, not as live site assets. The library maps all 84 product models to category, current image, target transparent image, visual family, direction, prompt seed, and status for Codex/Claude lookup.
- **Image brief / prompt the user can hand to an image tool or designer** (also given to them directly):
  > Produce a clean **transparent-PNG cutout** of this GYUTRON industrial product render (rugged PDA / scan gun / machine-vision camera / sensor / instrument), to float on a near-black hero.
  > 1. Remove the white/light background AND the contact shadow → full alpha transparency.
  > 2. **Edges must be clean, anti-aliased, with NO white/light halo or fringe** — the white must be *decontaminated* from semi-transparent edge pixels, not merely made transparent. (This is the #1 failure to avoid.)
  > 3. **Preserve the product EXACTLY** — identical colors, materials, screen, buttons, proportions, angle and markings as the original; when placed back on white it must look identical to the catalog render. Do NOT re-render, stylize, beautify, or AI-imagine the device.
  > 4. Device accent color must match the GYUTRON logo purple `#4b2e83` exactly; do not use blue-purple, pink-purple, neon purple, or the lighter UI accent `#8a63d2`.
  > 5. Keep original (or higher) resolution; output PNG-24 with alpha, trimmed to the product's bounding box.
  > 6. Don't bake in rim lighting — that's added in CSS.
  > Within one product line, keep canvas ratio, background, camera angle, subject scale, direction, and baseline consistent.

## 8. Gotchas
- **Verify animated UI by its NATURAL settled state, not force-settled** — force-settling once masked an all-black hero. Always visually verify desktop + mobile before shipping.
- **Headless preview recipe** (no connected Chrome): build first → write `D:\Codex Data\.claude\launch.json` = `{version:"0.0.1",configurations:[{name:"gyutron-astro-preview",runtimeExecutable:"cmd",runtimeArgs:["/c","cd /d D:\\Codex\\workspaces\\2026-05-17\\files-mentioned-by-the-user-gyutron\\gyutron-website-repo\\astro && npx astro preview --port 4321"],port:4321,autoPort:false}]}` → `preview_start` → `preview_resize` 1440×900 / 390×844 → screenshot / inspect / console(level=error) → navigate via eval `location.assign('/de/index.html')` → `preview_stop` + delete launch.json. Free port 4321 first. To screenshot a *settled* slide, set the slide's OWN `opacity/visibility/transition` (not just the layers), else the 750ms crossfade leaves the shot on the previous slide. If `preview_screenshot` keeps timing out (infra) but `eval` works, verify via `getBoundingClientRect`/computed styles + offline composites instead.
- `PYTHONUTF8=1 PYTHONIOENCODING=utf-8` for any Python touching de/ja text (console is GBK). For precise JSON key edits, text-replace anchored on `"key": "value"` (assert count==1) to avoid reformatting whole dicts.
- The shell/bash tool resets cwd each call — use absolute paths or `git -C <repo>`.

## 9. Residual / TODO
- Residual English on converted pages = 0. **DEFERRED: product SPEC translation** (~85 labels + values, de/ja still English in product cards) — user will supply a glossary or approve MT; final content pass.
- TODO: CSS dedup (chrome duplicated in `global.css` + `product-page.css`); retire legacy root-level pages + dead `product-data.js`/`product-catalog.js`; `Home.astro` still has a dead pre-HeroSlider `[data-hero-carousel]` inline script (~lines 263–309) that no-ops — safe to delete that one block (keep the mega-menu nav script below it); optional sitemap.xml + per-page twitter tags.

## 10. Reconciliation with `AGENTS.md` (older; partly stale)
`AGENTS.md` still has many **VALID** rules — navigation structure, brand/logo (`gyutron-logo-purple.png`), responsive breakpoints (1440/1024/768/430/390), store/shop conventions, product-catalog consistency, micro-interactions, Cloudflare routing. Keep following those. **SUPERSEDED items:**
- **Lines 17–18 (run `npm run i18n:build` / `tools/generate_localized_site.py` after edits)** → OBSOLETE & DANGEROUS. That legacy generator clobbers the Astro site. de/ja are built by Astro from per-locale data now. Do NOT run it.
- **Line 14 (hero = colored bars / old carousel structure)** → SUPERSEDED by §6 (3 Astro layouts, no colored bars).
- **Line 16 (de is a homepage-only sample; most subpages still English)** → SUPERSEDED — all 21 pages are localized en/de/ja via Astro.
- **`tools/update_navigation.py` / editing "root HTML pages"** → those root pages are legacy; edit `astro/src/**` (shared chrome = Header/Footer components) instead.

---

## 11. Long-term architecture principles & constraints (apply on EVERY change)
> User directive 2026-06-03. The site is early but must grow into a long-extensible **industrial-tech brand site**: brand site → multilingual → product/solution library → industry-content hub → inquiry-conversion funnel → eventually backend/CRM/product-DB/CMS. **Priority right now = a clean, stable, maintainable, i18n-ready, SEO-friendly, low-maintenance Astro architecture — NOT piling on features.** These are DIRECTIONAL: apply on every change, migrate toward them **INCREMENTALLY** (never a big-bang refactor); if you find the structure messy, **tell the user first + propose SMALL steps.**

**Brand:** GYUTRON / 具创智能 — B2B industrial tech (工业自动化, 机器视觉, 智能机器人, AGV/AMR, 工业相机, 传感器, 自动化零部件); China supply chain → global; overseas B2B. NOT a plain display page, NOT pure e-commerce.

**9 hard principles**
1. **Componentize, never copy-paste.** Product card / industry case / CTA / header / footer / nav recur across home + product + industry + solution pages and all locales → build reusable components from the start.
2. **Data-drive content** → `src/data/*`, not hardcoded deep in components (so text/image/link edits stay easy).
3. **Astro file layout (gradual target):** pages→`src/pages`, components→`src/components` (group `common/ home/ product/ solution/`), layouts→`src/layouts`, data→`src/data`, styles→`src/styles`, static images→`public/images`. No mega-HTML files; no heavy lib/framework for a simple feature.
4. **Static-first.** Prefer Astro static generation; don't turn statically-renderable content into pure client-side JS render. JS only for necessary interactions.
5. **i18n-ready — don't block it.** Don't scatter text deep in components; keep content data-driven; URL structure must allow future locales; img `alt` + meta title/description translatable; Header/Footer/CTA/category names language-switchable. (Don't add a heavy i18n lib unless truly needed.) Future locales contemplated: en/zh/ja/de/es.
6. **SEO.** Exactly one `<h1>` per page; sane h1/h2/h3 hierarchy; unique `<title>` + meta description per page; img `alt`; clean readable URLs; important content output in HTML (not JS-only); home/product/solution/industry pages all indexable.
7. **Performance (global audience: CN mainland, SEA, EU, US).** Compress images; optimize above-the-fold first; no gratuitous big JS libs; CSS animation over heavy animation libs; avoid CLS; smooth mobile; keep the homepage light.
8. **Industrial-tech visual** (工业 / 专业 / 克制 / 硬核 / 国际化 / B2B / 科技但不花哨). Reference QUALITY (never copy assets/copy/logo): Keyence, Cognex, Basler, LUCID Vision Labs, ABB Robotics, OMRON, SICK, ifm. AVOID: 电商大促风 / 小红书风 / 过度霓虹·粒子科技风 / 普通 SaaS 模板风 / 国内低端工业站风. (= existing §2 thinklucid rule + brand purple.)
9. **Don't over-engineer.** User is NOT a programmer; keep the project understandable + AI-maintainable. Avoid needless abstraction, heavy toolchains, unnecessary state management, premature backend/microservices, over-complex TS types, refactor-for-show. **Test: genuinely improves future maintenance → do it; just looks advanced + adds complexity → don't.**

**Future content columns (anticipate, don't build one-off-for-today):** Home · Products · Solutions · Industries · Resources · About · Contact.
- **Products:** Machine Vision · Industrial Cameras · Lenses · Lighting · 3D Vision · Robotics · AGV/AMR · Sensors · Automation Components.
- **Solutions:** Vision Inspection · Vision-Guided Robotics · Warehouse Automation · Factory Automation · Industrial AI · Cross-border Sourcing.
- **Industries:** Automotive · Electronics · Battery · Food & Packaging · Logistics · Metal Processing · Medical Devices · Agriculture.
- **Resources:** Blog · Application Notes · Case Studies · Technical Guides · Downloads · FAQ.

**Backend / forms:** stay an Astro static site for now; **no backend unless explicitly needed** (user system, auth, complex product filtering, CMS, payments, customer-data, CRM, form automation, product DB). Future options when needed: Supabase / PostgreSQL / Airtable / Sanity / Strapi / Directus / HubSpot / custom API — never added "to look advanced." **Inquiry forms** (Contact / Inquiry / Request Quote / Download Datasheet): clear fields, NOT fake front-end-only, ONE reusable component, leave hooks for email/CRM/DB/webhook, carry per-product source + trackable lead-source. Future fields: Name, Company, Email, Phone/WhatsApp, Country/Region, Industry, Interested Product, Project Description, Expected Quantity, Application Scenario. (Contact form already posts `/api/contact` → `contact-handler.mjs`.)

**✅ Pre-change checklist (run before EVERY edit):** 1) which component does this belong in? 2) should this content live in `src/data`? 3) reused later? 4) multilingual impact? 5) SEO impact? 6) mobile impact? 7) slows the homepage? 8) fits the industrial-brand visual? 9) harder to maintain? — **If existing structure is messy: tell the user first + propose SMALL incremental refactors, never a big uncontrolled rewrite.**

**📤 Report after EVERY change:** 1) files changed; 2) components added; 3) where data is maintained; 4) where image assets live; 5) mobile impact; 6) SEO impact; 7) `npm run build` passes?; 8) how to extend it next.

**Ideal vs CURRENT state (gradual; several deliberate — prefer ideal for NEW code, migrate existing only in small ANNOUNCED steps):**
- **Layouts:** `Layout.astro` already in `src/layouts/` ✓.
- **Components:** currently FLAT in `src/components/`; target = group into `common/ home/ product/ solution/`.
- **Styles:** CSS currently in `astro/public/*.css` (loaded via `pageCss`), not `src/styles/` — legacy-extracted; low-priority gradual target.
- **Data:** products in per-locale `products.{en,de,ja}.js` (DELIBERATE — drives build-time per-locale pages + `i18n-audit.py`; keep). `heroSlides.ts` exists; `navigation/solutions/industries/site` not yet extracted to `src/data` — extract when next touched.
- **URLs/i18n:** `/` (en) + `/de/` + `/ja/`, `build.format:'preserve'` byte-matching legacy. **Do NOT blindly switch to `/en/…`** — breaks indexed URLs / needs redirects.
- **Images:** product imagery at `public/product-images/` + cutouts `public/product-cutouts/` (user owns product imagery himself).
