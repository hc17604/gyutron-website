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
