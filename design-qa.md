# GYUTRON Official Store — Design QA

Date: 2026-08-03
Result: **PASS**

## Visual target and boundaries

- Hyconext was used only as a structural reference for the four-stage checkout, persistent order summary, and enterprise purchasing hierarchy.
- The implementation retains GYUTRON branding, the existing logo, product catalog, static multi-page architecture, Cloudflare Worker, cart key, clean URLs, and English/German/Japanese paths.
- Visible styling uses the GYUTRON purple system (`#4b2e83`, `#8a63d2`, `#efe8ff`) with neutral surfaces, square corners, explicit borders, and no copied Hyconext assets, text, icons, colors, or code.
- Payment remains explicitly unavailable. The final step submits a review-only order request or proforma-invoice request and never collects card, CVC, PayPal, bank, or purchase-order payment data.

## Screenshot comparison

Reference captures and final captures are stored in `artifacts/shop-qa-20260803/` on the project D: drive.

- Reference: `reference-hyconext-customer.png`, `reference-hyconext-address.png`, `reference-hyconext-shipping.png`, `reference-hyconext-payment.png`
- Final: `final-checkout-en-1440.jpg`, `final-checkout-en-390.jpg`, `final-checkout-de-430.jpg`, `final-product-en-1024.jpg`, `final-product-en-390.jpg`, `final-home-en-1440.jpg`, `final-products-ja-768.jpg`

The final checkout was compared side-by-side with the reference. It preserves the useful information hierarchy while replacing the reference's rounded cards, green completion states, free-shipping claim, discount control, account creation, gender title, newsletter default, payment fields, and review claims with GYUTRON's hard-edged purchasing flow and fact-bounded content.

## Responsive and interaction checks

| Width | Pages checked | Result |
| --- | --- | --- |
| 1440 | Home, catalog, product, cart, checkout, account, DE/JA checkout | PASS |
| 1024 | Home, catalog, product, cart, checkout, account, DE/JA checkout | PASS |
| 768 | Home, catalog, product, cart, checkout, account, DE/JA checkout | PASS |
| 430 | Home, catalog, product, cart, checkout, account, DE/JA checkout | PASS |
| 390 | Home, catalog, product, cart, checkout, account, DE/JA checkout | PASS |

- 40 browser page/viewport combinations had no document-level horizontal overflow.
- Desktop/tablet checkout keeps a sticky right-side order summary; 430/390 use a 62px collapsed top summary that expands and collapses without page overflow.
- Mobile checkout progress uses a 2x2 grid, so all four steps remain visible without horizontal scrolling.
- Mobile product detail shows the name, SKU, series, applications, availability status, estimated price, configuration, quantity, and Add to Cart within the first 900px; the product image no longer dominates the first screen.
- Required-field errors provide text, `aria-invalid`, and focus the first invalid field. Separate billing-address validation was exercised.
- Completed steps can be opened for editing, and entered values persist when continuing again.
- Search suggestions expose a combobox/listbox relationship; Escape closes suggestions and restores focus. Mobile navigation and language menus also close with Escape and restore focus.
- At 768px the compact header exposes the menu trigger; the panel opens, contains all navigation links, and closes with Escape while returning to its collapsed state.
- Locale-independent application filters return non-empty product sets for inspection, robotics, traceability, and warehouse in English, German, and Japanese (12 routes checked).
- Request Quote, Contact Engineer, and Contact Us use associated labels, POST fallbacks, Turnstile-enhanced same-origin endpoints, and never place contact details in the page URL.
- Local end-to-end submission returned `pending_review` with intent `OI-20260803-6PP7HK`; D1 stored the request and item without price, total, or payment fields.
- Order-intent DLP tests reject payment/pricing keys, valid PANs supplied as text or JSON numbers, valid IBANs, and nested configuration/source-page values while accepting benign phone, PO, and checksum-invalid references.
- Browser console log after the responsive and interaction pass: no errors.

## Automated gates

- `npm run shop:verify`: 121 passed, 0 failed.
- `node scripts/smoke-platform.mjs`: 34 passed, 0 failed.
- `npm run i18n:gate`: English/German/Japanese shop wiring passed.
- `npm run i18n:audit`: no residual English in generated German/Japanese shop pages.
- `astro/npm run build` then `astro/npm run verify:all`: passed.
- Wrangler asset/Worker dry run: passed.
