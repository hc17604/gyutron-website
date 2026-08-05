# GYUTRON Official Store — checkout isolation design QA

Date: 2026-08-03

## Scope and restoration boundary

- Hyconext was used only for checkout information hierarchy, step progression, the persistent desktop summary, and the compact mobile summary.
- The GYUTRON logo, purple palette, square industrial surfaces, original header/footer, catalog, URLs, SKUs, cart key, static multi-page architecture, Worker routes, and en/de/ja paths were retained.
- Fifteen non-checkout templates, 90 generated non-checkout HTML files, five shared partials, all six `shop.css` copies, all six `shop.js` copies, three locale JSON files, and `public/shop-analytics.js` were verified against `d5315f9` with no diff.
- New visual and interaction code is isolated to `checkout.css`, `checkout.js`, and the checkout template. Every checkout selector is scoped by `.checkout-page`, and only checkout HTML loads those assets.
- The only intentional shared-file exception is the appended `window.GYUTRON_CHECKOUT_I18N` dictionary in `shop-i18n.js`; the original store dictionary is unchanged and non-checkout pages do not read the checkout dictionary.

## Source and implementation comparison

All evidence is stored under `artifacts/shop-qa-20260803/` on the project D: drive.

- Source captures: `reference-hyconext-customer.png`, `reference-hyconext-address.png`, `reference-hyconext-shipping.png`, `reference-hyconext-payment.png`.
- Final implementation: `corrected-checkout-en-1440.png`, `corrected-checkout-en-step4-1440.png`, `corrected-checkout-en-1024.png`, `corrected-checkout-en-768.png`, `corrected-checkout-en-430.png`, `corrected-checkout-en-390.png`, `corrected-checkout-de-390.png`, `corrected-checkout-ja-390.png`.
- Combined side-by-side evidence: `checkout-visual-comparison.png` and its source `checkout-visual-comparison.html`.

The final comparison confirms the same enterprise-checkout hierarchy: numbered collapsible steps on the left, an order summary on the right, clear completed/edit states, and a dedicated final confirmation stage. GYUTRON intentionally differs in brand chrome, purple states, square corners, denser typography, and fact-bounded trust content. Hyconext's blue/green palette, rounded cards, review claims, free-shipping claim, discount UI, gender title, account creation, marketing opt-in, and direct card/bank/PayPal controls were not copied.

Comparison iterations:

1. The first responsive pass found an English mobile singular/plural defect (`1 items`); the copy was changed to a count-neutral order-summary label.
2. The first final-step full-page capture inherited the browser's scrolled position; the capture procedure was corrected to return to the top before screenshotting. This was a QA artifact, not a page-layout defect.
3. The final combined comparison found no remaining hierarchy, spacing, typography, color, icon, content, or responsive issue requiring a code change.

## Responsive, visual, and accessibility checks

| Width | Result | Key observation |
| --- | --- | --- |
| 1440 | passed | Left workflow and sticky right summary remain aligned; no overflow. |
| 1024 | passed | Desktop summary remains usable without clipping or collision. |
| 768 | passed | Compact top summary replaces the side rail; long content wraps. |
| 430 | passed | Summary starts collapsed, expands, and closes without horizontal scroll. |
| 390 | passed | Original two-row mobile header, full-width form controls, and primary action remain usable. |

- English, German, and Japanese were exercised at 390px; there were no `????` or replacement-character failures.
- Form controls use associated labels, appropriate input types and autocomplete values, text errors, `aria-invalid`, first-error focus, and visible focus styling.
- The active/completed step treatment uses GYUTRON purple rather than green. Errors are conveyed by icon and text, not color alone.
- Motion is limited to transform/opacity/scroll behavior and respects `prefers-reduced-motion`.
- Font Awesome provides the visible UI icons; no fabricated logo, CSS illustration, inline SVG substitute, or placeholder product image was introduced.
- Browser console errors: 0.

## Primary interaction and data-boundary checks

An isolated headless Chrome run completed 77 assertions:

- Add one real catalog SKU through the original Buy Now control and verify the original cart badge.
- Trigger required-field validation, verify five readable errors, and verify focus moves to the first invalid field.
- Complete customer/company data, reveal and collapse the separate billing address, and advance through shipping and procurement.
- Return from step 4, re-enter the completed step, and preserve entered values.
- Select the proforma-invoice outcome and exercise the success UI through a local intercepted API response with a trackable request ID.
- Confirm mobile order-summary expand/collapse behavior.
- Confirm there are no password, card-number, CVC, CVV, bank-account, PayPal, or hosted-payment impostor fields.
- Confirm the request payload sends SKU, quantity, approved configuration data, contact/address/procurement fields, request type, locale, and idempotency key—never client price, subtotal, tax, shipping total, card, or bank fields. Nested configuration price/payment keys are removed client-side and rejected again by the Worker boundary.

The real local Worker clean paths returned 200 for en/de/ja checkout pages and all six checkout CSS/JS locale assets. A validly shaped order-intent containing `items[0].price` returned 400 with `Client-submitted prices and totals are not accepted.` No fake production order was submitted.

## Automated gates

- `npm run shop:verify`: 120 passed, 0 failed (16 pages × 3 locales; original-store baseline, checkout isolation, mirrors, payload safety, i18n, and JavaScript syntax).
- `node scripts/smoke-platform.mjs`: 34 passed, 0 failed.
- `npm run i18n:gate`: passed for de/ja.
- `npm run i18n:audit`: 0 residual-English shop segments in de/ja.
- `astro/npm run build`: 132 pages built.
- `astro/npm run verify:all`: passed all header, sitemap, route, SEO, accessibility-lite, and i18n report gates.
- `npx wrangler deploy --dry-run --config wrangler.toml --assets ./public/`: passed; 523 assets read and all DB/KV/R2/ASSETS bindings resolved.
- `git diff --check`: passed.

## Commercial status

- Payment: not connected. No charge is created and no payment credential is collected.
- Order: the Worker/D1 boundary creates a `pending_review` purchasing request, not a paid order or inventory reservation.
- Logistics: carrier, freight mode, dispatch, arrival, duties, taxes, and destination surcharges remain subject to review and formal quotation.

Final result: passed

---

# GYUTRON shared navigation scroll + back-to-top QA

Date: 2026-08-05

## Scope and implementation truth

- Root cause: `Layout.astro` already emitted the scroll-direction listener on 123 brand content pages, but the transform rules lived only in homepage-only `global.css`; the other 120 subpages changed `body.nav-hidden` without moving the Header.
- The Header transform/transition contract now lives in shared `nav-chrome.css`, loaded after every page-specific stylesheet. Homepage duplication was removed from `global.css`.
- `Layout.astro` now renders one localized, icon-only native button on every brand content page. It appears after 320px, is 50×50, hard-edged purple, and returns to the top while restoring the Header.
- Product and solution sticky rails switch to `top: 0` while the Header is hidden. The mobile and short-landscape Support rail keeps a 16–18px vertical gap from the new control.
- A new `verify:scroll-chrome` hard gate checks every non-redirect built HTML page, shared CSS, locale labels, focus state, and reduced-motion rules. Future content pages must render `Layout.astro`.

## Responsive and interaction evidence

| Case | Down scroll | Up scroll | Control / rail | Overflow |
| --- | --- | --- | --- | --- |
| Home · 1440×900 | Header hidden | Header top 34px | 224px vertical gap | 0 |
| Solution · 1024×768 | Header hidden; tabs `top:0` | Header top 34px | 165.9px gap | 0 |
| Support · 768×900 | Header hidden | Header top 34px | 224px gap | 0 |
| German form · 430×860 | mobile Header hidden | Header top 0 | 18px gap | 0 |
| Japanese news · 390×844 | mobile Header hidden | Header top 0 | 18px gap | 0 |
| Industry · 844×390 | Header hidden; tabs `top:0` | Header top 34px | 16px short-landscape gap | 0 |

- English `Back to top`, German `Nach oben`, and Japanese `ページ上部へ` accessible names passed.
- Near the top the control computes `visibility:hidden`, `aria-hidden=true`, and `tabIndex=-1`; while visible it computes `visibility:visible`, `aria-hidden=false`, and `tabIndex=0`.
- Pointer activation returned to `scrollY=0`, removed `nav-hidden`, restored the Header, and hid the control.
- Opening the mobile navigation or Support dialog hides and disables the control; no fixed-control overlap was found.
- Desktop search geometry was rechecked after removing permanent `will-change: transform`: the fixed result layer again meets the Header without the 34px containing-block gap, and the regression gate now rejects that declaration.
- Fresh Japanese news-page console check: zero warnings/errors. Local contact-form QA recorded the expected Cloudflare Turnstile `110200` hostname error from using the production key on `127.0.0.1`; it is not emitted by this feature and is checked again on production.
- Evidence: `artifacts/scroll-chrome-20260805/`.

## Automated gates

- Astro build: 132 pages.
- `npm run verify:all`: passed, including the new 123-page `verify:scroll-chrome` gate.
- Content-icon policy: 172 brand / 192 all checks passed.
- 9 intentional `MetaRedirect` pages remained outside the Layout contract.
- Exactly 123 HTML and 3 shared CSS outputs were synchronized; Shop diff stayed zero.

Final result: passed

# GYUTRON checkout step shadow-separation QA

Date: 2026-08-05

## Scope and source truth

- Scoped annotation: replace the straight divider lines between checkout step surfaces with restrained shadows and whitespace; preserve numbering, copy, layout, fields, controls, colors, and responsive behavior.
- User feedback capture: `artifacts/figma-purple-frame-redesign/feedback-step-dividers.png` (1110 × 735).
- Same-state desktop baseline: `artifacts/figma-purple-frame-redesign/design-qa-implementation-checkout.png` (2118 × 1440).
- Same-state mobile baseline: `artifacts/figma-purple-frame-redesign/design-qa-implementation-mobile.png` (390 × 844).

## Implementation evidence

- Desktop implementation: `artifacts/figma-purple-frame-redesign/design-qa-shadow-checkout-desktop.png` (2118 × 1440, CSS viewport represented at 1× density).
- Mobile implementation: `artifacts/figma-purple-frame-redesign/design-qa-shadow-checkout-mobile.png` (390 × 844, CSS viewport represented at 1× density).
- Focused steps 2–4: `artifacts/figma-purple-frame-redesign/design-qa-shadow-steps-focused.png` (1374 × 346).
- Combined before/after evidence: `artifacts/figma-purple-frame-redesign/design-qa-shadow-comparison.png` (1600 × 2200), generated from the equal-size desktop and mobile captures.
- State: checkout step 1 active; steps 2–4 collapsed on desktop, steps 2–3 visible collapsed on the 390px mobile crop.

## Findings and comparison history

1. Earlier P2: the continuous top/bottom borders made the collapsed stages read like spreadsheet rows and created the hard horizontal lines identified in the feedback capture.
2. Fix: the desktop step stack now uses a 14px gap; each white surface uses a neutral shadow with 5–8px vertical offset, 18–24px blur, and 5.5–7% opacity. All step borders were removed.
3. Fix: mobile surfaces use a 10px gap and a lighter 4px/12px shadow at 5.5–6% opacity. Mobile step borders were removed.
4. Post-fix comparison: the stages remain easy to scan while the separation is carried by whitespace and quiet elevation rather than a continuous rule. No actionable P0/P1/P2 visual issue remains.

## Required fidelity surfaces

- Fonts and typography: unchanged; hierarchy, wrapping, weight, line height, and optical density match the prior approved prototype.
- Spacing and layout rhythm: intentional 14px desktop and 10px mobile gaps replace the former zero-gap divider stack; checkout alignment and order-summary geometry are unchanged.
- Colors and visual tokens: shadows are neutral charcoal rather than purple; purple remains limited to active state, number markers, focus, links, and actions.
- Image quality and assets: GYUTRON logo and product image are unchanged and render without broken assets.
- Copy and content: checkout copy and data are unchanged; only the design-board rule label was updated from neutral lines to quiet elevation.

## Interaction and technical checks

- Straight bottom-divider count across desktop and mobile step surfaces: 0.
- All four desktop and three visible mobile step surfaces computed with neutral box shadows.
- First-name input focus still uses a uniform purple border and soft external focus outline; no decorative inset stripe or shadow was introduced.
- Horizontal layout, primary action placement, and mobile summary remain unchanged.
- Local preview and comparison-page console warnings/errors: 0.
- Broken comparison-page images: 0.

Final result: passed

---

# GYUTRON minimal enterprise styling revision QA

Date: 2026-08-05

## Scope

- Revised only the design study in `artifacts/figma-purple-frame-redesign/`; no production website or checkout source file was changed.
- Replaced padded step labels (`01`, `02`, `03`, `04`) with single digits inside compact circular markers.
- Removed decorative purple left bars from the product composition, desktop and mobile active steps, form focus treatment, and the payment-status note.
- Kept purple only for clear state and action cues; structural borders remain neutral gray.

## Visual truth and implementation evidence

- Prior source state: `artifacts/figma-purple-frame-redesign/design-qa-source-before.png` (3200px design board before this feedback pass).
- Revised overview: `artifacts/figma-purple-frame-redesign/final-board.png` (3200 × 1200 crop; mirrored as `final-board-minimal-preview.png`).
- Revised brand composition: `artifacts/figma-purple-frame-redesign/design-qa-implementation-brand.png` (1460 × 821).
- Revised desktop checkout: `artifacts/figma-purple-frame-redesign/design-qa-implementation-checkout.png` (2118 × 1440).
- Revised mobile checkout: `artifacts/figma-purple-frame-redesign/design-qa-implementation-mobile.png` (390 × 844).

## Comparison history

1. The earlier study used padded numbers inside square outlines. This created a presentation-template feel and was replaced with `1–4` in circular markers.
2. The earlier study repeated vertical purple bars on several text and state containers. All standalone purple left bars were removed.
3. The focused form field formerly used a purple inset left stripe. It now uses a uniform border and a soft external focus outline, preserving keyboard visibility without decoration.
4. The active step uses one filled purple circle; inactive steps use thin purple outlines. No additional colored rail is present.

## Final checks

- Sequence marker values: `1, 2, 3, 4`; no padded `01–04` values remain.
- Circular marker geometry: 12 of 12 checked markers use `border-radius: 50%`.
- Standalone purple left borders: 0.
- Broken images: 0.
- Local preview warnings and errors: 0.
- Typography and copy hierarchy remain intact; only numbering and the board date format changed.
- Desktop and 390px mobile checkout states were visually inspected after the final CSS update.

Final result: passed

---

# GYUTRON production minimal-enterprise rollout QA

Date: 2026-08-05

## Production scope

- Brand site source: `astro/public/global.css`, `home-sections.css`, `product-page.css`, `solution-page.css`, and `news-page.css`.
- Shop source: `shop/shop.css`, `shop/checkout.css`, and `shop/checkout.js`, plus generated en/de/ja source and `public` mirrors.
- Regression contract: `scripts/smoke-shop.mjs` now pins store structure/behavior to the prior baseline while explicitly permitting the intentional shared CSS source and the single circular checkout-step marker rule.
- No HTML information architecture, visible copy, URLs, SKUs, cart storage, i18n dictionary, Worker route, order payload, payment boundary, logistics rule, or account behavior changed.

## Visual comparison

- Approved rule reference: `artifacts/figma-purple-frame-redesign/design-qa-shadow-steps-focused.png`.
- Implemented desktop steps: `artifacts/enterprise-design-live-20260805/after-local-shop-checkout-steps-1280.png`.
- Combined target-versus-implementation input: `artifacts/enterprise-design-live-20260805/target-vs-implementation.png` and `target-vs-implementation.html`.
- Brand implementation: `after-local-brand-home-1280.png`, `after-local-brand-products-1280.png`, `responsive-brand-cards-390.png`.
- Shop implementation: `after-local-shop-home-1280.png`, `responsive-shop-products-de-390.png`, `responsive-shop-products-de-768.png`.
- Checkout implementation: `after-local-shop-checkout-1280.png`, `after-local-shop-checkout-step4-1280.png`, and `responsive-checkout-{1440,1024,768,430,390}.png`.

The combined comparison confirms the selected logic survived production constraints: single-digit circular markers, no decorative purple rails, whitespace plus quiet elevation between steps, purple reserved for active/action/focus semantics, and the existing right-side order summary retained. The production layout is denser than the design study because it includes the real header, active form, order summary, trust facts, and footer; no corrective visual mismatch remains.

## Responsive and localization results

| Width | Result | Key observation |
| --- | --- | --- |
| 1440 | passed | Left checkout flow and sticky order summary remain aligned; no root horizontal overflow. |
| 1024 | passed | Checkout side summary remains visible; brand header and hero retain hierarchy. |
| 768 | passed | Checkout switches to the compact top summary; German shop header and filters wrap/scroll within their own controls. |
| 430 | passed | Mobile two-row Shop header, compact summary, circular marker, and primary form area remain clear. |
| 390 | passed | Brand and Shop mobile layouts have no root horizontal overflow; long German titles wrap without clipping. |

- English checkout was exercised through steps 1–4 with valid test data; completed steps retained `1`, `2`, and `3`, and step 4 displayed `4`.
- German product-list and checkout surfaces and Japanese generated mirrors were checked through build/i18n gates; no `????` or replacement-character issue was introduced.
- Fresh direct-page console checks for brand home, German Shop products, and populated checkout returned 0 warnings/errors.
- The mobile order summary remained collapsed by default and did not consume the first screen.

## Automated gates

- `npm run shop:verify`: 120 passed, 0 failed.
- `node scripts/smoke-platform.mjs`: 34 passed, 0 failed.
- `npm run i18n:gate`: passed for de/ja.
- `npm run i18n:audit`: 0 residual-English Shop segments in de/ja.
- `astro/npm run build`: 132 pages built.
- `astro/npm run verify:all`: all hard gates passed; the existing report-only i18n heuristics remain non-blocking.
- `npx wrangler deploy --dry-run --config wrangler.toml --assets ./public/`: passed; 523 assets read and all configured bindings resolved.
- `git diff --check`: passed.

## Commercial capability boundary

- Payment: not connected; no card, CVC, bank-account, PayPal, or payment credential is collected.
- Order: remains an order-intent / `pending_review` purchasing request, not a paid or inventory-reserved order.
- Logistics: remains reviewed and confirmed by sales; no real-time carrier rate, fixed ETA, or free-shipping rule was introduced.
- Account: remains guest checkout; no login or account backend was introduced.

Final result: passed

---

# GYUTRON decorative content icon removal QA

Date: 2026-08-05

## Scope and design decision

- Removed decorative small pictograms from brand-site content, Shop purchasing content, account benefits, and checkout trust/state content.
- Removed CTA arrows, checklist/square pseudo-icons, icon data fields, footer social placeholders, chat launcher/avatar pictograms, and the greeting emoji.
- Kept only controls that communicate or operate real behavior: search, language, navigation hierarchy, account/cart, cart removal, checkout edit/error feedback, mobile disclosure state, and news back navigation.
- Rebalanced every affected grid, gap, padding, and reserved icon column; no replacement icon set was introduced.

## Before/after evidence

- Combined comparison: `artifacts/icon-removal-audit-20260805/10-comparison.png` and `comparison.html`.
- Brand: `01-brand-before.png` → `04-brand-after.png`; 390px implementation: `07-brand-mobile-after.png`.
- Shop: `02-shop-before.png` → `05-shop-after.png`; 390px implementation: `08-shop-mobile-after.png`.
- Checkout: `03-checkout-before.png` → `06-checkout-after.png`; 390px implementation: `09-checkout-mobile-after.png`.
- All accepted screenshots were opened and visually inspected; the comparison board has six loaded images and no broken asset.

## Responsive and localization results

| Width | Brand | Shop | Checkout |
| --- | --- | --- | --- |
| 1440 | no content icons or overflow | no content icons or overflow | no decorative checkout icons or overflow |
| 1024 | no content icons or overflow | desktop navigation stable | desktop summary mode stable |
| 768 | no content icons or overflow | layout remains contained | compact mobile summary active |
| 430 | text-only support launchers contained | two-row mobile header/menu active | compact summary and step form contained |
| 390 | Core capabilities remains readable | mobile Shop content remains readable | primary checkout step remains readable |

- German Shop at 390px: 0 root overflow, 0 heading text overflow, mobile menu active.
- English/German/Japanese generation and UTF-8 scans passed; no `????` or replacement characters were introduced.
- Fresh local browser console entries across the audited brand, Shop, checkout, and German mobile states: 0.

## Automated gates

- Brand decorative-content icon policy: 171 passed, 0 failed.
- Shop decorative-content icon policy: 20 passed, 0 failed.
- `npm run shop:verify`: 120 passed, 0 failed.
- Astro build: 132 pages; `npm run verify:all`: passed.
- Platform smoke: 34 passed, 0 failed.
- i18n gate/audit and UTF-8 scan: passed.
- Wrangler deploy dry-run: 523 assets read; Worker bindings resolved.
- `git diff --check`: passed.

Final result: passed

---

# GYUTRON functional contact icon restoration QA

Date: 2026-08-05

## Scope and visual target

- User feedback identified two over-corrected surfaces: the homepage Email / WhatsApp / LinkedIn contact band and the fixed right-edge Support / Contact rail.
- The exact target was the pre-`24c51d2` structure for those surfaces only: channel-identification tiles and compact 50×50 launcher buttons with labels revealed on hover or keyboard focus.
- The support-panel interior, emoji greeting, CTA arrow, ordinary content cards, Shop, and Checkout remained unchanged.

## Visual and interaction comparison

- Homepage contact band renders three white channel tiles with envelope, WhatsApp, and LinkedIn identifiers; the text grid and original spacing are restored.
- Support / Contact launchers render as two 50×50 icon controls by default. Keyboard focus expands the active label to 92px at full opacity without horizontal overflow.
- Support opens the existing FAQ dialog and Close returns to the compact rail; Contact keeps its localized `/support.html` destination.
- English, German, and Japanese render the same component structure; launcher labels remain `Support / Contact`, `Support / Kontakt`, and `サポート / 連絡先`.

## Responsive results

| Requested width | Result |
| --- | --- |
| 1440 | three contact icons, two 50px launchers, no root or card overflow |
| 1024 | restored grid remains contained; launchers remain compact |
| 768 | restored grid remains contained; launchers remain compact |
| 430 | contact text and icon columns fit; no horizontal overflow |
| 390 | contact cards stack cleanly; link overflow 0; launcher width 50px |

- Japanese keyboard-focus state at 390px expanded to the intended 92px label width with 0 root overflow.
- Browser console warning/error entries: 0.

## Automated gates

- Astro build: 132 pages.
- `npm run verify:all`: passed.
- Brand content-icon policy: 171 passed, 0 failed.
- All-site content-icon policy: 191 passed, 0 failed.
- Platform smoke: 34 passed, 0 failed.
- i18n gate and `git diff --check`: passed.

Final result: passed

---

# GYUTRON Support hero metadata-row QA

Date: 2026-08-05

## Source visual truth and intended change

- Source screenshot: `artifacts/support-meta-row-20260805/source-support-hero.png` (`2031 x 659` pixels).
- User-directed delta: move the `Help & Support` eyebrow onto the first line, immediately after the `Home / Support` breadcrumb; preserve every other Support hero choice.
- Normalized source: `source-support-hero-normalized-1001.png` (`1001 x 325`, Lanczos downsample from the supplied high-density capture).
- Implementation screenshot: `implementation-en-1016-full.png` (`1001 x 709`) at a `1016 x 720` browser viewport; the page client width was `1001` CSS pixels because of the browser scrollbar.
- Focused hero crop: `implementation-en-hero-1001.png` (`1001 x 305`).
- Combined comparison, source left / implementation right: `comparison-source-left-implementation-right.png` (`2018 x 325`).
- State: English `/support.html`, initial page state, no menu or support panel open.

## Full-view and focused comparison

- The supplied hero composition, background image, purple palette, heading, intro copy, and hard-edged styling remain unchanged.
- The focused comparison confirms the requested hierarchy change: breadcrumb and eyebrow share one baseline; the heading moves upward by the space released from the removed standalone eyebrow row.
- Focused geometry at the comparison viewport: breadcrumb top `192px`, eyebrow top `192px`, horizontal gap `28px`, row height `18.6px`, root overflow `0px`.
- A second focused crop was sufficient because the requested change touches only the hero metadata row; body cards, header, footer, and fixed support rail were outside the requested delta and remained visually unchanged.

## Required fidelity surfaces

- Fonts and typography: existing family, weights, uppercase treatment, sizes, line heights, and letter spacing are unchanged.
- Spacing and layout rhythm: the former two-row metadata stack is now one flex row with a 28px gap and 20px separation before the H1; no decorative divider was introduced.
- Colors and visual tokens: existing white, muted white, and `--purple-500` treatments are unchanged.
- Image quality and asset fidelity: the existing industrial hero asset and overlay are unchanged; no new or generated asset was introduced.
- Copy and content: English, German, and Japanese strings remain unchanged and continue to come from their existing per-locale page props.

## Responsive and localization evidence

| Width | English | German | Japanese |
| --- | --- | --- | --- |
| 1440 | one line, no overflow | one line, no overflow | one line, no overflow |
| 1024 | one line, no overflow | one line, no overflow | one line, no overflow |
| 768 | one line, no overflow | one line, no overflow | one line, no overflow |
| 430 | one line, no overflow | one line, no overflow | one line, no overflow |
| 390 | one line, no overflow | one line, no overflow | one line, no overflow |

- Long German shipping/legal crumbs at 390px wrap inside the same metadata group to a 47px two-line row with zero root overflow; this is an intentional responsive fallback rather than truncation.
- Mobile implementation evidence: `implementation-en-390-full.png`.
- Browser console warning/error entries: `0`.
- Breadcrumb semantics remain intact: one `<nav aria-label="Breadcrumb">`, localized Home link, one main H1.

## Findings and comparison history

- Pass 1: no actionable P0/P1/P2 mismatch. The requested one-line metadata relationship is present at every Support landing breakpoint and all untouched visual surfaces remain consistent with the source.
- No post-comparison visual fixes were required.
- P3 follow-up: none required for this focused adjustment.

## Automated gates

- Astro build: 132 pages.
- `npm run verify:all`: passed, including header, routes, SEO, accessibility, and brand icon policy.
- Platform smoke: 34 passed, 0 failed.
- i18n gate: passed.
- `git diff --check`: passed.

Final result: passed
