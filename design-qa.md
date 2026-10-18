# GYUTRON solution explorer — design QA

Date: 2026-10-18
final result: passed
Scope: homepage SolutionExplorer in English, German and Japanese.

## Selected visual truth

User selected displayed option3, then explicitly requested fewer separator and leader lines,
background-tone hierarchy, direct publication and compact mobile adaptation.
Revised source: artifacts/solutions-explorer-20261018/selected-reference.png (1663x946).
Original option: design-drafts/2026-10-18-solution-explorer/03-system-configuration.png outside repo.
Implementation: desktop-final.jpg (1265x713 native capture,1280x720 CSS viewport) in the same artifact folder.
State: Applications, first assembly entry selected; both source and implementation show this state.

The source and final implementation were opened together in one comparison input. Product content above
and existing support rail are outside the source crop. Main content is normalized by region width
(source1606px, native implementation1050px), not by browser chrome. Browser reports approximately1xDPR;
its viewport override sometimes crops physical screenshots inconsistently, so native/reset viewport is
used for final desktop evidence. Wide-breakpoint results are DOM checks, not pixel-fidelity claims.
Focused navigation crops were also opened together: reference-index-focus.png normalized to378px wide,
and implementation-index-focus.png at378px. Text, spacing, selected background and state icons are legible.

## Five fidelity surfaces

- Fonts/type: existing Inter, Japanese Noto Sans JP, strong black headings, restrained regular body copy.
  Responsive title/row scale and line-height retain reference hierarchy without cramming. Longer locale
  strings wrap; concise mobile option labels replace desktop-length accordion headings. Antialiasing and
  exact source font pixels are not asserted. Final focused crop shows no malformed or clipped text.
- Spacing/layout:36percent light-gray choice region,64percent charcoal model region, white active inset.
  Removed all row separators, panel borders, shadows, lower rule/slogan and image callout leaders.
  The only rule is the selected mode underline. Native1280 module height547px after spacing correction.
  At900px and below, a44px native selector replaces all closed accordion rows; one integrated dark
  model/copy panel remains, no multi-card stack. EN390 module519px; DE/JA320 fit comfortably in one view.
- Colors/tokens: white, #f1f3f3 index, white active content, #1c2026 stage, near-black headings. Interactive
  purple consumes only shared --button-purple-deep/light tokens. Mobile copy uses light text on dark;
  no neon, generic gradient or added decorative cards.
- Imagery:11 distinct slot-owned RGB WebP1200x800 engineering renders,607,364bytes total, checked via
  model-contact-sheet.jpg and individual asset-worker inspections. Their geometry is illustrative;
  no factory-photo background, human-readable annotations, performance metrics or installation claim.
  Full-canvas contain-fit preserves rig silhouettes. Several source cable loops have2percent margins,
  noted in provenance; the consuming viewport adds clearance and does not crop hardware.
- Copy/content:6 applications and5 industries keep brief task-specific text, localized alt and illustrative
  configuration caption. Removed old unsupported accuracy/full-speed language. All CTAs lead to relevant
  existing pages/real fragments, including automotive/manufacturing; no self-jump to generic home cards.

Icons use the already-loaded Font Awesome library: plus/minus are essential disclosure state controls;
CTA arrows are a narrow user-directed exception to the old CTA-icon rule because they are in the selected
visual. No custom SVG, pseudo-art or new dependency. Images are generated assets, not div/code drawings.

## Comparison history / fixes

1. [P2] Static review found mode URLs ignored #hx-explore-ind on initialization. Fixed initial mode from
   recognized hash, mode-address replacement and hashchange handling. Browser direct DE Industries hash
   now opens Industries; mode keyboard Left/Right/Home/End works, URL remains coherent.
2. [P2] First focused comparison showed excess active-copy whitespace moving the closed rows downward.
   Evidence: desktop-before-spacing.jpg. Reduced desktop CTA minimum36to24px and copy bottom20to14px;
   mobile36px CTA remains. Group shrank488to471px at1280. Re-captured desktop-final.jpg and compared
   both full view and focused navigation against the selected source in the same input: passed.
3. [P2] JA320 assembly description left a short orphan final fragment. Shortened the translation without
   losing meaning, rebuilt and re-captured mobile-ja-320.jpg; description now fits one concise line.

## Functional and responsive evidence

- Browser: EN1920/1440/1280/1024 plus compact900/768/430/390/360/320. DE320 and JA320 screenshots inspected.
  No page/header/text horizontal overflow. Current only: one visible choice on compact widths.
- All6 desktop applications and5 industries opened with exactly one details item open per group;
  all11 active scene images loaded. All11 compact selector changes show exactly one entry.
- Native summary selection, mode keyboard arrows, summary Up/Down/Home, focus outline and mode
  switching tested. Deep-link state verified. Desktop and mobile category state are synchronized.
- All33 localized CTA files/fragments and HTTP200 responses verified;11 image responses and hashes match.
  All11 image/provenance records match dimensions, bytes and unique hashes. local-checks.json records it.
- Original9-card product modules match baseline c4782a0 exactly in all3locales; Shop/backend unchanged.
- Browser console warnings/errors:0. browser-checks.json records results and limitations.
- Progressive fallback: source/native-details inspection shows both groups and all11destinations remain
  available before enhancement. JavaScript-disabled browser execution was not emulated.
- Reduced motion: fade only exists inside prefers-reduced-motion:no-preference. No OS-preference playback
  emulation. Native select interaction checked responsively; no physical touchscreen/screenreader audit.

## Gates / release

132-page Astro build and verify:all hard gates PASS. Existing reports remain3multi-H1 homepages,
615JS navigation triggers and42pages/143heuristic i18n tokens outside this work. Root deploy:check PASS,
131public-only files preserved. Only three homepages, matching CSS and11new media files synced.
User explicitly authorized production publication. Released7b44f55af9f357beb6c61a08176d0d6bf83670de.
GitHub verify run39142761021 completed successfully:
https://github.com/hc17604/gyutron-website/actions/runs/39142761021

Production2026-10-18 23:59 Singapore:first-attempt49/49checks passed. Three complete balanced
explorer modules exactly equal current public/ (11items/images/CTA and6+5options each), as do the
unchanged product modules. All33CTA URLs200 and18fragments present. LF-normalized CSS and all11
image binary hashes match. Health200/statusok. production-checks.json and check-production.ps1
record reproducible evidence. Live desktop switches applications with loaded model;390px mobile
selects identification, shows exactlyone entry with a loaded image, no page/header overflow and a
495px module. Console0warnings/errors. production-desktop.jpg and production-mobile.jpg capture
those actual states. Browser viewport override reset. Final records completed2026-10-19.

## Follow-up polish

P3: exact generated-model hardware details and very small source antialiasing differences are intentionally
not treated as validated product CAD. Existing floating contact rail is unchanged; inspected module controls
and copy remain usable at the captured phone positions. No actionable P0/P1/P2 finding remains.
