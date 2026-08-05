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
