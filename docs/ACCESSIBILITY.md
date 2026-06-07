# Accessibility — gyutron.com

Lightweight, pragmatic a11y for a static brand site. No axe/Playwright dependency; a small static
scan (`npm run verify:a11y-lite`) enforces a few high-confidence basics and reports the rest.

## `npm run verify:a11y-lite`

Run from `astro/` after `npm run build` (scans `dist/**.html`). Also a **hard gate** in CI and part of
`npm run verify:all`.

- **HARD (fails the build):** every `<img>` has an `alt`; no empty `href=""`; every page `<html>` has
  `lang`. (All currently pass — so the gate now protects against regressions.)
- **REPORT (informational):** icon-only `<a>`/`<button>` with no accessible name; duplicate `id` on a
  page; more than one `<h1>` on a page; `.nav-trigger` disclosure without `aria-expanded`.

## Current state (2026-06-07)

Good, already in place: header search toggle (`aria-label`/`aria-expanded`/`aria-haspopup`), language
switcher (`aria-label`, `aria-current`), hero carousel (`aria-roledescription="carousel"`, `role="tab"`
dots with `aria-selected`, decorative layers `alt=""` + `aria-hidden`), contact form status
(`role="status" aria-live="polite"`), footer social/payment `aria-label`, logo `aria-label`/alt.

Hard scan = clean: **0** missing-alt, **0** empty-href, all pages have `<html lang>`. Report scan found
**0** icon-only-unnamed links/buttons and **0** duplicate ids. Two items remain (below).

## Known deferred items (documented, not yet changed)

These are real but touch sensitive areas; they are deferred deliberately (not silently skipped) so they
can be done carefully when prioritized. `verify:a11y-lite` keeps reporting them.

1. **Homepage has 3 `<h1>`** (one per hero slide, en/de/ja). Best practice is one `<h1>` per page.
   - *Why deferred:* the hero slider is the most-iterated, visually-sensitive component; the slide
     titles share `.hsl-title` styling, and changing the homepage's rendered HTML is high-visibility.
   - *Safe fix later:* keep `<h1>` on slide 1 only and make slides 2–3 `<h2>` (update `HeroSlider.astro`
     + the `.hsl-title` CSS selector if element-typed), then visually verify desktop+mobile and byte-diff
     the homepage; sync the 3 affected `index.html` pages.

2. **`.nav-trigger` lacks `aria-expanded`** (≈486 across all pages × 6 triggers).
   - *Why deferred:* the mega-menu open/close is JS-driven by SEPARATE scripts (Header.astro + Home.astro
     + SolutionPage.astro inline IIFEs + `public/mobile-navigation.js`). A *static* `aria-expanded="false"`
     would lie about state; doing it right means adding the attribute in `HeaderNav.astro` AND toggling it
     in every one of those scripts — changing all 81 pages' header HTML + the mobile clone. High blast
     radius for the Header (a load-bearing, byte-contracted component).
   - *Safe fix later (small steps):* add `aria-expanded="false"` (+ optional `aria-controls`) in
     `HeaderNav.astro`; update each open/close routine to set `aria-expanded` on open/close; then
     **`npm run verify:header`**, confirm the mobile load-bearing classes are unchanged, and visually
     verify desktop+mobile before deploying.

## Forms

Contact form labels currently **wrap** their inputs (implicit label association — valid + accessible),
with `required` and a live `role="status"` result region. Adding explicit `for`/`id` is a minor
enhancement (not a defect); if done, it changes the contact pages' HTML — sync those pages and keep the
field `name`s and the `/api/contact` submit logic unchanged.
