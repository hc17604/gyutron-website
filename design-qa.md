# GYUTRON homepage product mosaic — design QA

Date: 2026-10-18
Status: PASS for the changed product module.

## Selected reference and scope

The user superseded the one-row Cognex direction with the CYCODE composition in
`artifacts/home-products-20261018/reference-cycode-selected.png` (2635 x 1612).
The exact original module was found at
`D:/CYCODE/redesign-v2/editable-modules/categories/index.html` and `online-source.html`.
It uses four columns with 1+1+2 / 2+1+1 spans, two featured diagonal surfaces,
and whole-card hover: translateY(-4px), scale(1.018), .36s cubic-bezier(.22,1,.36,1).
The newer Alibaba inline version exports the same diagonal as a PNG; the original CSS
surface is appropriate here. GYUTRON retains its approved purple tokens, hard edges,
font system, actual matrix imagery, category destinations and concise localized copy.

## Comparison and evidence

The selected reference and `mosaic-desktop-1440.jpg` were viewed together in the same
comparison input. Content regions were aligned by width; the reference viewport/DPR is
unknown. Header/browser chrome, competitor products, blue colors, rounded corners and
chat overlays are excluded from fidelity scoring because the user requested GYUTRON styling.

- Structure: matched four small + two wide cards, with wide handheld top-right and paired
  fixed readers bottom-left. Two-column tablet/mobile adaptation retains full-width featured cards.
- Imagery: seven distinct slot-owned WebP exports from existing GYUTRON catalog sources;
  complete silhouettes, transparent backgrounds, contain-fit and no distorted proportions.
  Fixed readers show GY-CR900 and the catalog's distinct GY-CR120. Total 337,438 bytes.
  Product-specific aspect ratios differ intentionally from CYCODE's products.
- Typography/copy: short title, one concise descriptor, one product entry. Wide badges and
  larger titles follow the reference hierarchy. All three locales have complete keys.
- Colors/surfaces: white cards, quiet borders, fixed soft shadow, square corners, #4b2e83
  labels/CTA/badges and #efe8ff diagonal. Diagonal is the source's real CSS technique.
- Motion: exact original whole-card transform/duration/easing under fine-pointer hover.
  No automatic product floating or carousel. Reduced-motion CSS removes transform/transition.
  Loaded browser CSS and matching desktop media queries were inspected. Browser automation
  did not expose a pointer-move/hover operation; synthetic right-click did not establish
  :hover, so no claim of recorded hover-frame playback is made.

## Checks and iterations

- Initial one-row implementation was rejected by the user; archived in `one-row-design-qa.md`.
- The mosaic supersedes it. Added two featured cards, paired reader imagery, brief descriptions,
  labels, localized links and exact source hover. Removed added scroll-reveal to retain the
  source behavior and keep mobile content continuously visible.
- An oversized paired-image experiment caused internal image-box overflow; reverted to
  57% widths with a 14% transparent-canvas overlap. Final desktop card scrollWidth==clientWidth.
- Rendered checks: English 1920/1440/1024/768/390, German 1440/320, Japanese 320.
  Titles wrap without truncation, all seven images load, page overflow is zero.
  See `mosaic-browser-metrics.json`, `mosaic-mobile-390.jpg`, and final desktop capture.
  Mobile full-section captures can include fixed header/Support controls at their viewport
  position; these are existing site-wide overlays, not product layout content.
- Semantic h2/h3 structure and one anchor per card are retained. Decorative images have
  empty alt to avoid duplicate linked names. Purple focus-visible outline is retained.
- Astro build: 132 pages. `verify:all` passes hard gates; informational legacy reports remain
  3 multi-H1 homepages, 615 JS-driven nav triggers and 42 pages/143 suspect i18n tokens.
- Independent source review found no substantive issues. Link/image HTTP results are in
  `mosaic-link-checks.json`. Shop, Worker, catalog source illustrations and navigation unchanged.

## Known limits and verdict

No remaining P0/P1/P2 issue in the changed product module. The existing fixed Support/Contact
rail may overlap right-column phone content; this is an unchanged global control already noted
in the prior QA. Native-language editorial review remains separate. Publication is explicitly
authorized by the user; CI and production results are recorded in HANDOFF.md after release.
