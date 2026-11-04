# Workspace UI detail and maintenance map

Scope: GYUTRON Operations workspace `/admin`, English by default and Chinese only. All surfaces keep square edges and original GYUTRON identity. The source application is `2026.11.04.16`; release evidence and ongoing work are in `HANDOFF.md`.

## Verified product reference

The authenticated [Alibaba seller portal](https://i.alibaba.com) was inspected directly. Its publicly served navigation component version0.0.38 was read only to understand behavior; its implementation and account assets are not copied into this product.

| Detail | Reference and resulting behavior | Source |
|---|---|---|
| Primary/secondary navigation | Alibaba: persistent current column, separate hover preview, combined pointer region; our authored60/240/208px variant | `src/admin/layout-client.mjs`, `navigation-menus.mjs` |
| Hover vs current selection | Alibaba: preview never navigates or replaces current selection;10ms switching/200ms dismissal | `layout-client.mjs` |
| Navigation density | Alibaba: consistent icon/row rhythm, text hierarchy, thin independent scrolling; GYUTRON keeps square selected surfaces and licensed Lucide icons | `saas-styles.mjs`, `analytics-styles.mjs`, `icons.mjs` |
| Saved report filters | Authored correction: coverage overlap and exact saved scope, inline invalid-range recovery | `operations-client.mjs`, `platform/operations/reports.mjs` |
| Sales stage numbers | Authored correction: complete filtered totals alongside loaded rows, one batched read | `platform/crm/repository.mjs`, `client.mjs` |
| Record scanability | Authored refinement: action semantics, activity ordering, actual message excerpts and tabular quote amounts | `client.mjs`, `crm-experience-client.mjs`, `quotes-client.mjs` |
| Assistant workspace | Authored responsive layout: reachable composer, optional local starters, correct conversation identity and visible model target | `intelligence-client.mjs`, `saas-styles.mjs` |

The other refinements are described as authored behavior, not attributed to products that were not directly inspected. Inter, Lucide and self-hosted Apache ECharts remain the open-source presentation foundation; notices are in `admin-technology-notices.md`.

## Maintenance checks

Admin and isolated Test mode share one maintenance contract. Any field, navigation, query or action change must update synthetic behavior in the same change. Demo results must remain explicitly synthetic and never fall back to production business APIs. Saved report scope and monetary integers are not reconstructed by the UI.

Run `npm run check:admin-polish`, `npm run check:admin-demo`, `npm run check:admin-adviser` and `npm run check:admin-startup` plus the repository build/deploy gates. The polishing suites execute actual emitted handlers and real SQLite, and do not replace rendered browser checks. Preserve EN/ZH keyboard, phone, reduced-motion, inline errors and dirty-state recovery.

The count/page/stage packet uses a single prepared-statement batch, consistent with the [Cloudflare D1 batch contract](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch); the independent SQLite suite also checks an interleaved-write scenario. This is read validation, not a production load test.
