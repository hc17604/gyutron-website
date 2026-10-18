# GYUTRON homepage product families — design QA

Date: 2026-10-18

## Scope and visual target

Replace the homepage's text-heavy featured-capabilities block with concise product-family cards.
The user's primary visual target is `artifacts/home-products-20261018/reference-cognex.png`
(3498 x 1015 source pixels); secondary reference is `reference-cycode.png` (2635 x 1612).
`reference-before.png` records the original GYUTRON module. The user explicitly requested GYUTRON
colors/style and products from its existing matrix: the Cognex yellow products/rounded corners
and CYCODE blue treatments were not intended for reproduction.

The implementation remains the existing Astro brand site. Source: HomeProducts.astro,
data/homeProducts.ts, home.products.* dictionary keys and home-sections.css. All three locales
use the same six real category destinations. Slot-owned images are technical WebP exports from
existing matrix illustrations, not new evidence of physical specifications.

## Evidence and normalization

Evidence folder: `artifacts/home-products-20261018/`.

- Primary final implementation: `products-desktop.jpg`, 1633 x 469 pixels, captured from the
  product section at a 1920 x 1000 CSS viewport, approximately devicePixelRatio 1.
- Whole viewport/context: `desktop-1440.png`, `desktop-1920.png` (browser JPEG bytes despite the
  historical .png suffix). These show the section and its neighboring modules.
- Additional section captures: `tablet-1024.jpg`, `tablet-768.jpg` (657 x 660),
  `mobile-390.jpg` (377 x 824), `de-desktop-1440.jpg` (1221 x 402).
- Japanese narrow phone: `ja-mobile-320.jpg` (305 x 833 rendered pixels at 320 x 900 CSS).
- `browser-metrics.json` preserves viewport, image/media/card/title bounds and loading results;
  native in-app screenshot surfaces exclude scrollbars and may capture less than the emulated viewport.
- The original source CSS viewport/DPR is unknown. Comparison therefore aligns the product-content
  regions by width and judges hierarchy/proportions, not absolute pixels. Browser chrome, competitor
  chatbot overlays and the wider GYUTRON page margins are excluded from fidelity scoring.
- The primary reference and final implementation were opened together in the same comparison input.
  Parent and independent reviewer assessed both. A focused product-section crop is used because the
  surrounding site is not being redesigned; labels, borders and all six products are readable there.
- Initial iteration evidence: `desktop-initial.png`. Prior root design QA is preserved as
  `prior-design-qa.md`, not discarded.

## Comparison history and findings

1. Initial render: [P2] the portrait PDA intrinsic height expanded its media area by about 69px at
   1440px, pushing its title below the other five titles. Fixed by making every media wrapper an
   independent square with an absolutely positioned contain-fit image. Also shortened English
   “Handheld Barcode Scanners” to “Handheld Scanners”.
2. Final render: the six media squares and title starting positions align. At 1440px, media boxes
   are about 139.3 x 139.3px and all English labels fit two lines. Final 1920px crop confirms the
   fix and preserves complete, undistorted product silhouettes. No remaining P0/P1/P2 findings in
   the changed product section.

## Required fidelity surfaces

- Typography: retained the site's existing font and strong industrial heading weight. One short
  heading replaces the former marketing sentence; purple labels use 18–24px desktop type and
  16–18px phone type. German/Japanese wrap without truncation; Japanese technical “エリアスキャン”
  is retained. Different localized line counts are intentional.
- Spacing/layout: six equal desktop columns, three below 1200px, two below 601px; uniform image
  areas, heading-to-grid spacing, borders and padding. Existing page container alignment remains.
- Colors/tokens: white canvas, quiet neutral borders and GYUTRON purple labels/focus. Buttons and
  card interactions reference the existing semantic purple tokens. Square corners are intentional.
- Image quality: six distinct, recognizable existing matrix subjects; full silhouettes, transparency
  and correct aspect ratios. No invented product imagery, new logos, gradients or decorative icons.
- Copy/content: heading plus six names only; no badges, marketing paragraphs, specification list or
  repeated CTA. Each whole card links to its category. The neighboring SolutionExplorer is preserved.

## Browser and functional verification

Local Worker preview: http://127.0.0.1:8788/#products (not deployed).

- English 1920/1440/1024/768/390px, German 1440/320px, Japanese 320px checked in the in-app browser.
- Six images loaded, media areas square, card edges within viewport, zero root horizontal overflow.
- Click on Handheld Scanners opened its category; keyboard Tab selected the German 3D card with
  a visible purple outline and Enter opened the localized category. The local Worker canonicalizes
  these navigations to its existing clean route representation.
- All 18 category links and 18 image references returned HTTP 200; see `link-checks.json`.
- SolutionExplorer By industry still selects exactly one matching active panel.
- Browser console warnings/errors: none observed.
- Reduced-motion rule removes card transition; cards are visible without JS and rely on native links.
- Astro built 132 pages. verify:all hard gates, agent:check, deploy:check and diff whitespace checks passed.
  Existing informational reports remain: 3 multi-H1 homepages, 615 JS-driven nav disclosure triggers,
  42 localized pages / 143 heuristic English tokens, and 148 legacy images above 1 MB.

## Open questions and follow-up polish

- The existing site-wide floating Support/Contact rail overlaps part of right-column content at
  narrow phone widths. This unchanged control is outside the requested module and is not counted as
  a new section regression. A separate mobile launcher placement pass can address it.
- Native German/Japanese editorial review is not claimed. No production deployment or CI run occurred.

## Implementation checklist

- [x] Existing matrix products and valid category links selected.
- [x] Dedicated optimized assets with source provenance.
- [x] Sparse reference hierarchy with GYUTRON style and all locales.
- [x] Portrait-image alignment corrected and visually rechecked.
- [x] Desktop/tablet/phone and link/keyboard checks.
- [x] Selective public sync; Shop/backend unchanged; handoff updated.

final result: passed
