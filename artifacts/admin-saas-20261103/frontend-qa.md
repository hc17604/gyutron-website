# Operations workspace frontend verification

Updated 2026-11-03, final local release candidate. Scope: `src/admin/` shell, core controller, lazy quotations controller, styles and locale assets. Browser checks used the real local Worker/D1 at `http://127.0.0.1:8787`; no production customer records were created by this frontend QA session.

## Implemented and verified behavior

- Overview, customers, pipeline, tasks, inbox/conversion, activity, audit and Settings use authenticated JSON APIs. Quotations provide an independent full-page item editor, server-verified exact totals, draft/save/issue/revise/outcome/archive/restore, and authenticated print links.
- English, Simplified Chinese, German and Japanese cover core, dynamic status/role/error labels, confirmations, login and quotation UI. Locale key parity: 399 core keys and 153 quotation keys per language, with no missing/extra/empty keys or placeholder mismatch. Business record text remains unchanged.
- GYUTRON primary login remains password-only, without an account selector or password-strength warning. Explicit deployment `teamLogin === true` alone enables an optional work-email input for commercial team deployments. Four-language assertions confirm default/false/string-false render zero email inputs and one password input; explicit true renders one email input.
- CSS/JS are external, with no executable inline handlers, style attributes or native `window.confirm`. Requests use same-origin credentials and CSRF headers. Only the interface language is persisted in localStorage.
- Versioned record writes retain failed input; archives are reversible; record deep links reopen after refresh. Relationship selectors use remote search and the safe active-assignee directory. Sales cannot reassign ownership.
- Dashboard aggregation uses exact decimal strings and BigInt, separated by currency. Four-language formatter assertions preserve `9010000000004004` minor units exactly (English USD display: `$90,100,000,000,040.04`). JPY uses zero fractional digits.
- Quotation notes and terms are explicitly customer-printable. External-response notes are explicitly internal. Backend/quality agents independently verified internal response text is absent from all four-language print HTML/PDF.
- Settings show actual release, binding, migration, operational time zone, session and verified private-backup metadata. Configured bindings are not described as a full storage write probe.

## Actual local browser results

Chrome was controlled through an independent QA tab; the root agent's tab, active fixtures and shared login were preserved. The existing browser zoom stayed unchanged at 80%, so requested dimensions were adjusted and actual CSS widths recorded.

- All four languages passed Overview checks at actual CSS widths 320, 390, 767 and 1440: 16 cases, no root horizontal overflow. `locale-responsive-checks.json` records these measurements. 767 is the observed near-768 case; it is not claimed as exactly 768.
- German issued quotation passed the same four widths, displayed the correct localized `$56.75` equivalent and exposed no editing controls. Its print URL preserved `lang=de`.
- Japanese Settings at CSS 320 passed after fixing grid min-content sizing and containing absolutely positioned screen-reader table headings. Final root/body scroll width was 301px inside a 320px viewport. Team status labels were 有効/無効. Mobile quotation line items rendered as readable cards.
- Mobile navigation hid the collapsed drawer from the accessibility tree, trapped focus when open, and closed after choosing Tasks. Command search displayed Japanese UI labels while finding real customer, opportunity and quotation records.
- Created and refreshed `UI QA · Browser Customer`, reopened its record deep link, and created a linked JPY 125,000 opportunity with exact display.
- Created and saved Japanese JPY draft `QUO-2b532c3a-6b3b-46b5-9b0c-8e9734b75873` (`LOCALE-UI-JA-01`). Quantity 2 × JPY 12,345, discount 90, tax 20 and shipping 100 yielded subtotal 24,690 and total 24,720. Its Japanese HTML discard confirmation was canceled; title, quantity, price, terms and totals all remained, then saved successfully.
- Final JPY default normalization was separately reproduced and fixed: switching a new USD draft to JPY now turns only pure-zero fractional inputs (`0.00`, `100.00`) into exact whole amounts. Leaving all adjustment defaults untouched and entering quantity 2 × 12,345 yielded server-verified JPY 24,690. Nonzero fractional inputs (`12.50`, `0.01`) are preserved and rejected, never truncated or converted. The temporary verification draft was discarded through the app confirmation.
- Root independently verified quotation R01 `$56.75`, issue/immutable read view, revision R02 `$36.76`, original R01 still `$56.75`, and print flow. Root also verified task completion persistence, activity creation and a CSV download with the actual sample.
- Root discovered and independently retested a Customer→Opportunity race in New task. The final shared loader disables the opportunity/search/submit during hydration, rejects stale form/context/request results, preserves the latest selected value, and restores controls on errors. Rapid customer→opportunity→save persisted opportunity `OPP-20261103-D5D8FB8A702E40F9B279A588C7A983DD` in task `TSK-20261103-5C3FE90940AD46BB9BE26DD17CABD32D`. Core and quotation remote-search callbacks now also read selection at response time rather than restoring an earlier value.
- Final QA-tab application console contained no captured errors.

## Automated frontend checks

Run `node artifacts/admin-saas-20261103/frontend-state-checks.mjs`:

- Six relationship-loading cases pass: loading lock, latest choice, stale request rejection, correct subsequent result, failure recovery, closed/replaced dialog isolation.
- Eight JPY normalization cases pass; 61 currency parser/roundtrip/quantity/boundary assertions pass.
- Emitted core/quotation JavaScript compiles; no inline style/event attributes or `window.confirm` strings.

Earlier actual-function regressions also passed: six record/history/route stale-response cases and seven quotation dirty/calculation/customer-hydration cases. Shell rendering checks passed HTML/JSON escaping, safe principal projection, localized/case-insensitive errors, asset types and reduced-motion support. `text-contrast-review.json` is a palette review, not a screen-reader or accessibility certification.

Final Japanese JPY draft evidence is saved as `qa-ja-jpy-quotation-final.jpg`; the temporary viewport override was reset after QA. Other screenshots available: intermediate core `ui-overview-desktop-1440.jpg` / `ui-overview-mobile-390.jpg`, narrow German `qa-de-overview-css320.jpg` / `qa-de-issued-quote-css320.jpg`. The narrow Overview image predates the final mobile three-column stage-summary refinement. Some background Chrome screenshot calls timed out; those cases are backed by actual DOM geometry and visible UI observations, not invented screenshot evidence.

## Release ownership and limits

The root agent owns fresh complete API/auth/quotation/backup/aggregation suites, brand/build/CI gates, final production deploy, live asset/hash/CSP checks and production screenshots. Current release evidence belongs to the newer `local-quotes-checks.json`, `local-soak-*.json`, production verification reports, root release handoff and quality PDF reports; the earlier IAB confirmation limitation is closed by actual Chrome HTML-confirmation checks above. Do not interpret older intermediate artifacts as the final production state.

No physical touch-device, real assistive-technology or every-browser certification is claimed. Operational deployment and live monitoring remain the root release workflow.
