# Workspace UI detail and maintenance map

Scope: GYUTRON Operations workspace `/admin`, English by default and Chinese only. All surfaces keep square edges and original GYUTRON identity. The source application is `2026.11.04.22`; release evidence and ongoing work are in `HANDOFF.md`.

## Verified product reference

The authenticated [Alibaba seller portal](https://i.alibaba.com) was inspected directly. Its publicly served navigation component version0.0.38 was read only to understand behavior; its implementation and account assets are not copied into this product.

| Detail | Reference and resulting behavior | Source |
|---|---|---|
| Primary/secondary navigation | Alibaba: persistent current column, separate hover preview, combined pointer region; our authored60/240/208px variant | `src/admin/layout-client.mjs`, `navigation-menus.mjs` |
| Hover vs current selection | Alibaba: preview never navigates or replaces current selection;10ms switching/200ms dismissal | `layout-client.mjs` |
| Navigation density | Alibaba: consistent icon/row rhythm, text hierarchy, thin independent scrolling; GYUTRON keeps square selected surfaces and licensed Lucide icons | `saas-styles.mjs`, `analytics-styles.mjs`, `icons.mjs` |
| Primary navigation tone/default | GYUTRON user-directed refinement: deep purple-gray base #211a2e with coordinated hover/selection/icon tones; Administration starts expanded while native manual collapse remains available | `saas-styles.mjs`, `shell.mjs` |
| Compact rail overflow | Authored correction: compact scrolling remains available while its scrollbar cannot squeeze glyphs; square unread indicators keep full counts accessible and restore numeric counts when expanded. Original compact logo grows32→36px | `saas-styles.mjs` |
| Analysis filter hierarchy | Alibaba Data Overview, Shop Analysis and Trade Analysis: compact scope bar before indicators and chart; GYUTRON uses native date/advanced disclosures and an explicit applied-scope summary | `analytics-client.mjs`, `analytics-styles.mjs` |
| Selectable indicators | Alibaba: choose a business indicator and inspect its series in the same workspace; GYUTRON keeps exact drill/export scope while changing the chart | `analytics-client.mjs` |
| Currency families | Authored adaptation: one business measure groups separate ISO values, without exchange, cross-currency totals or numeric ranking between currencies | `analytics-client.mjs` |
| Partial coverage | Authored correction: reported dates and unavailable comparisons stay explicit even when the missing-metric list is empty | `analytics-client.mjs` |
| Period snapshots | Authored correction: one full-period unique observation is a compact exact snapshot, not an inferred daily curve | `analytics-chart-adapter.mjs` |
| Chart range actions | Authored correction: categorical charts retain visual zoom and drill; only actual date axes offer Apply chart dates | `analytics-chart-adapter.mjs` |
| Record editor scrolling | Authored refinement: header and actions stay visible while the form body scrolls; modal background scroll locks and restores | `saas-styles.mjs` |
| Editor recovery | Authored correction: dismissed/replaced forms cannot be reopened by delayed option errors; error descriptions preserve field help | `client.mjs` |
| Notification reading | Authored refinement: category glyphs, fixed header/actions, one scroller, preserved refresh position and exact shown/total counts | `notifications-client.mjs`, `saas-styles.mjs` |
| Saved report filters | Authored correction: coverage overlap and exact saved scope, inline invalid-range recovery | `operations-client.mjs`, `platform/operations/reports.mjs` |
| Sales stage numbers | Authored correction: complete filtered totals alongside loaded rows, one batched read | `platform/crm/repository.mjs`, `client.mjs` |
| Record scanability | Authored refinement: action semantics, activity ordering, actual message excerpts and tabular quote amounts | `client.mjs`, `crm-experience-client.mjs`, `quotes-client.mjs` |
| Assistant workspace | Authored responsive layout: reachable composer, optional local starters, correct conversation identity and visible model target | `intelligence-client.mjs`, `saas-styles.mjs` |
| First-screen analysis | Alibaba-informed scope → indicator → chart hierarchy; the chart selector moves to the page heading and positive source metadata stays accessible without a duplicate visible panel title. Partial coverage remains visible; desktop Canvas retains 320px height | `analytics-client.mjs`, `analytics-styles.mjs` |
| Table context | Authored refinement: bounded data scrolling, fixed headers and identity/action columns, a keyboard-focusable named region, and a low-height page-scroll fallback that keeps pagination reachable | `client.mjs`, `quotes-client.mjs`, `saas-styles.mjs` |
| Selection and columns | Authored correction: native 44px checkbox labels, identity columns always retained through old views and column configurations, and one-line scrolling saved-view tabs with full accessible names | `crm-experience-client.mjs`, `saas-styles.mjs` |
| Long record names | Authored refinement: two-line visual clamp with full DOM text, escaped title and unchanged record details | `client.mjs`, `quotes-client.mjs`, `saas-styles.mjs` |
| Square chart controls | Authored industrial styling: explicit straight-segment slider/grip paths replace ECharts' rounded defaults; chart data symbols retain their statistical meaning | `analytics-chart-adapter.mjs` |
| View recovery | Authored correction: a missing saved view offers Reset view; ordinary record404 and authentication failures retain their original behavior | `client.mjs` |
| Phone task rows | Authored refinement: separate44px selection and completion controls, full accessible action names, more width for two-line task titles, and visible desktop Complete/Reopen wording | `saas-styles.mjs` |
| Current quote recipient | Authored correction: new/explicitly changed recipients use the active primary contact, retain deliberate blank channels and preserve existing drafts/issued snapshots | `quotes-client.mjs`, `platform/quotes/repository.mjs`, `demo-client.mjs` |
| Import preview integrity | Authored correction: later valid rows retain all fields after an invalid first row; canonical exact money appears once, zero stays visible, and row/validation/error columns have stable positions | `operations-client.mjs` |
| Phone list toolbars | Authored refinement:44px filter/column/search glyph controls retain complete names and tooltips; Save view keeps its text, native selects retain complete options, and search-only forms stay on one row. Desktop wording remains visible | `client.mjs`, `crm-experience-client.mjs`, `saas-styles.mjs` |

The actual analysis pages inspected were [Data Overview](https://data.alibaba.com/), [Shop Analysis](https://data.alibaba.com/traffic/overview) and [Trade Analysis](https://data.alibaba.com/transaction/analysis). Their account screenshots stay outside Git and the distributable package. Only layout and interaction observations are used.

The other refinements are described as authored behavior, not attributed to products that were not directly inspected. Inter, Lucide and self-hosted Apache ECharts remain the open-source presentation foundation; notices are in `admin-technology-notices.md`.

## Maintenance checks

Admin and isolated Test mode share one maintenance contract. Any field, navigation, query or action change must update synthetic behavior in the same change. Demo results must remain explicitly synthetic and never fall back to production business APIs. Saved report scope and monetary integers are not reconstructed by the UI.

Run `npm run check:admin-polish`, `npm run check:admin-demo`, `npm run check:admin-adviser` and `npm run check:admin-startup` plus the repository build/deploy gates. The polishing suites execute actual emitted handlers and real SQLite, and do not replace rendered browser checks. Preserve EN/ZH keyboard, phone, reduced-motion, inline errors and dirty-state recovery.

The count/page/stage packet uses a single prepared-statement batch, consistent with the [Cloudflare D1 batch contract](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch); the independent SQLite suite also checks an interleaved-write scenario. This is read validation, not a production load test.
