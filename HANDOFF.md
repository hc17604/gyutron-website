# GYUTRON gyutron.com — Engineering Handoff (single source of truth)

> Consolidated handoff for the agent/engineer taking over. **This supersedes the older, partly-stale rules in `AGENTS.md` where they conflict** (see §10). Last updated 2026-06-02. Current live HEAD: **ff60466**.
> Talk to the user in **Chinese**; keep code / i18n keys / brand names verbatim.

---

## 0. TL;DR — the 5 things that BREAK the site if you get them wrong
1. **The site is now ASTRO** (everything lives in the **`astro/`** subdir). The old root-level `*.html` pages + the Python generator are DEAD/legacy.
2. **NEVER run the legacy generator** — `npm run i18n:build`, `npm run i18n:sync`, or `tools/generate_localized_site.py`. It regenerates legacy pages into `public/` and **CLOBBERS the Astro site**. *(This contradicts old AGENTS.md lines 17–18 — ignore those.)*
3. **Deploy = build Astro → copy changed output into `public/` → commit → push.** Cloudflare serves the committed `public/`. See §3.
4. **shop.gyutron.com is OUT OF SCOPE.** Never touch `public/shop`, `public/de/shop`, `public/ja/shop`, or shop i18n keys.
5. **`t(locale,key)` THROWS on a missing key** (intentional build gate). Any new visible text needs **en + de + ja** or the build fails.

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

## 5. Architecture
- **i18n**: dicts `astro/src/i18n/{en,de,ja}.json`; `src/i18n/index.ts` exposes `t(locale,key)` (THROWS on missing), `localizeUrl(locale,path)`, `ogLocale/htmlLang/...`. New text → **reuse existing translated `main.*` / `seo.*` / `home.*` keys** where possible; if you must add a key, add it to **all three** json files.
- **Components** (`astro/src/components/`): `Layout`, `Header`, `Footer`, `LangSwitch`, `Home`, `ProductPage`, `SolutionPage`, `ContactSales`, `MetaRedirect`, **`HeroSlider`**, `TabCarousel`.
- **Products**: build-time from `src/data/products.{en,de,ja}.js` via `pages/[category].astro` (+ `de/` + `ja/`). Per-locale files (title/intro/summary translated; `specs`/`tags` are technical English). 3 redirect categories: smart-cameras→area-scan-cameras, industrial-sensors→proximity-sensors, inspection-instruments→dimensional-gauges.
- **CSS** in `astro/public/` (loaded via Layout `pageCss`): `global.css`, `product-page.css`, `solution-page.css`, `contact-page.css`, `mobile-navigation.css`, `home-sections.css`, `hero-slider.css`.
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
- **Image brief / prompt the user can hand to an image tool or designer** (also given to them directly):
  > Produce a clean **transparent-PNG cutout** of this GYUTRON industrial product render (rugged PDA / scan gun / machine-vision camera / sensor / instrument), to float on a near-black hero.
  > 1. Remove the white/light background AND the contact shadow → full alpha transparency.
  > 2. **Edges must be clean, anti-aliased, with NO white/light halo or fringe** — the white must be *decontaminated* from semi-transparent edge pixels, not merely made transparent. (This is the #1 failure to avoid.)
  > 3. **Preserve the product EXACTLY** — identical colors, materials, screen, buttons, proportions, angle and markings as the original; when placed back on white it must look identical to the catalog render. Do NOT re-render, stylize, beautify, or AI-imagine the device.
  > 4. Keep original (or higher) resolution; output PNG-24 with alpha, trimmed to the product's bounding box.
  > 5. Don't bake in rim lighting — that's added in CSS.
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
