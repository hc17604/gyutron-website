# Operations workspace frontend verification

Scope: `src/admin/{shell,styles,client}.mjs`. No production customer records were created during these checks.

## Implemented behavior

- External CSS/JavaScript assets; same-origin requests and `X-CSRF-Token`; no inline executable event handlers or style attributes.
- English and Simplified Chinese; language preference is the only value saved to localStorage.
- Overview, customers, sales pipeline, tasks, website intake, customer activities, audit, team and system settings use real authenticated APIs.
- Customers/opportunities/tasks support versioned writes, error preservation and field feedback. Archiving is reversible. Inbound enquiries can be converted to linked CRM records.
- Relationship selectors support remote search rather than limiting users to the latest 100 records. Active assignees use the safe directory API. Sales cannot change owners.
- Currency display uses actual currency minor units, including zero decimal places for JPY. Overview totals remain separated by currency.
- Record dialogs have refreshable URL state. Commands, dialogs and the mobile drawer have keyboard/focus behavior. Destructive/discard confirmations use HTML dialogs rather than blocking browser JavaScript dialogs.
- Settings show actual release/bindings/migration/session/credential-policy/backup metadata. Storage labels say configured; binding presence is not presented as a full R2 write probe.

## Completed browser checks

Real local Worker and D1 at `http://127.0.0.1:8787`, using a dummy development owner credential:

1. Owner sign-in through the actual CSRF-protected login form; workspace bootstrap and dashboard succeed under the response CSP.
2. Created `UI QA · Browser Customer` through the UI; save returned to the list; refresh retained the customer.
3. Opened the customer detail and refreshed its `record` deep link; the same detail reopened.
4. Created linked `UI QA · Japanese inspection project`, JPY 125,000; the pipeline displayed exactly `¥125,000`.
5. At 1440×900 and 390×844, the observed root document had no horizontal overflow.
6. At 390px, the collapsed sidebar was absent from the accessibility tree. Opening it exposed only the drawer; selecting Tasks closed it and returned focus to the menu button.
7. Opened the mobile task form; selected the real customer; matching opportunity options appeared.

Saved screenshots: `ui-overview-desktop-1440.jpg`, `ui-overview-mobile-390.jpg`. These are intermediate local QA images, before final System Settings and text contrast refinements; production screenshots belong to the root release checks.

An early native `window.confirm` discard test blocked the IAB CDP session. All `window.confirm` calls were subsequently removed and replaced with application HTML confirmation dialogs. Root is continuing browser validation in an independent Chrome session. The replacement confirmation and later System Settings require those final browser checks; this document does not claim they passed yet.

## Static and security checks

- `node --check` passed for all three modules, and the embedded browser script compiled with `new Function` as a non-executed syntax check.
- Renderer assertions passed for HTML/JSON escaping, principal projection (no internal session hash/password hash in bootstrap), login-error escaping, asset content type, no executable inline events, no inline style strings, no native `window.confirm`, and reduced-motion support.
- Artifact `text-contrast-review.json` records corrections to small text colors against the intended light/dark surfaces. It is a palette review, not an accessibility certification.
- Current source sizes at this check: browser JS approximately 100 KB, CSS approximately 31 KB, workspace shell approximately 8 KB. No browser framework dependency was added.

## Remaining release checks owned by root

- Final Chrome UI checks at 320/390/768/1440, EN/中文, latest confirmation behavior and Settings/System/backup form.
- Full create/edit/task-complete/activity/intake-conversion/archive-restore/export workflow on the final build; permission checks across roles.
- CI, root/brand build gates, production deployment, live asset hash/HTTP/CSP checks and production screenshots.
- No physical touch device or screen reader validation has been performed.
