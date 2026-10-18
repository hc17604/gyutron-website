# GYUTRON approved compact product mosaic — design QA

Date: 2026-10-18
Final result: passed
Scope: homepage product module in EN/DE/JA.

## Exact selected target

User attachment codex-clipboard-6a43d565-42d8-443b-a168-f34946f6d83e.png,
archived as artifacts/home-products-approved-20261018/selected-reference.png.
This supersedes the prior six-card CYCODE diagonal composition. Previous QA is archived
in the same evidence folder as previous-design-qa.md.

## Comparison

The exact selected screenshot and final desktop-final.jpg were viewed together in the
same comparison input. Compare the product regions by width; the supplied design has
no browser/header context, while the final native capture includes the existing site header.

- Structure: nine entries in the approved order, with staggered seams and 8px gutters.
  Top spans 10+10+16+10+10, bottom spans 16+10+10+20 on a 56-track desktop grid.
  Handheld stays a wide text-left/image-right card. Fixed readers and controllers each
  show two real distinct models above one shared caption. No duplicate RFID/PDA entry.
- Surface: square corners, quiet gray media, white compact captions, near-black headings,
  shared brand purple links. Removed the old diagonals, badges and card shadows.
- Images: 11 real catalog-derived slot-owned WebPs, 528,898 bytes total. Contain-fit,
  transparent canvases and measured per-slot sizing preserve silhouette clearance.
  Lighting was reduced after initial inspection. Real product angles differ from the
  generated concept; hardware accuracy takes precedence over inventing product geometry.
- Type: existing Inter / Noto Sans JP, brief localized names and one descriptor.
  Desktop title and caption sizes scale responsively. Wider localization copy wraps
  inside its card; phone layouts have two columns and full-row wide cards.
- Interaction: entire card remains the category link. Native All products disclosure
  exposes 18 actual catalog categories rather than linking back to the same section.
  Font Awesome arrows use the existing dependency and are explicitly authorized by
  the arrow-bearing selected visual, a local exception to the older CTA-icon guideline.
- Motion: existing fine-pointer whole-card translateY(-4px)/scale(1.018), 360ms
  cubic-bezier(.22,1,.36,1), preserved. hover-card.jpg records the purple border,
  raised/scaled handheld card and link underline after native pointer placement during
  scrolling. No new automatic or image-only animation. Reduced-motion CSS disables
  transform/transition; OS preference playback was not emulated by the browser tool.

## Browser and functional QA

- EN viewport checks: 1920, 1440, 1280, 1024, 768, 390; DE: 1440, 320; JA: 320.
  Nine cards and 11 loaded images, no horizontal page/card/title overflow.
- Enter toggles native disclosure; 18 links are present. Tab reaches a category with a
  visible purple outline and reaches the next card. Japanese Smart Cameras navigation
  opens the localized category page with the correct H1.
- Fixed after first pass: German long category labels overlapped adjacent index columns;
  overflow-wrap/hyphenation now yields zero overflowing index links. Japanese handheld
  title now has two lines at 320px rather than an orphan final character.
- Console warnings/errors: zero.
- Independent HTTP check: 54 category destinations across three locales and all 11 images
  return 200. Image dimensions all match markup; nine primary categories are unique.
- Screenshot tool viewport overrides have inconsistent crop/physical sizing; the final
  desktop capture uses the reset native viewport. Wider breakpoint results are DOM checks
  plus earlier captures, not claimed to be pixel-identical physical screenshots.
- Existing fixed support/contact rail can cover part of right-column phone content.
  It predates this task and was not changed. No product text itself overflows.

## Verification and release

132-page Astro build, verify:all hard gates, agent:check, deploy:check and git diff --check pass.
Existing advisory reports remain three multi-H1 homepages, 615 JS navigation triggers,
and 42 pages/143 heuristic i18n tokens outside this module. Three homepages/CSS and four
new assets selectively synced; 131 public-only files preserved. Shop/backend/header untouched.
Production publication was explicitly authorized earlier. Released 034aca11bfa97c7794012d707c05fdffa4fd5d34.
GitHub verification run 39134283453 completed successfully:
https://github.com/hc17604/gyutron-website/actions/runs/39134283453

Production 2026-10-18 22:06 Singapore: 43/43 HTTP/content/hash checks pass. All three balanced
product modules exactly equal local public files (9 cards / 11 images / 18 index links each).
All 27 localized card destinations are 200; CSS normalized-LF and all 11 image hashes match;
/api/v1/health is 200/status ok. Evidence: production-checks.json and check-production.ps1.
Live desktop browser has nine cards, eleven loaded images and working native disclosure;
390px mobile has nine cards, eleven loaded images and no page/product-text overflow. Console
warnings/errors remain zero. Initial asynchronous images were allowed to finish before the
final loaded-image check and production-mobile.jpg. The selected section is visible in
production-desktop.jpg. Browser viewport override was reset after testing.
