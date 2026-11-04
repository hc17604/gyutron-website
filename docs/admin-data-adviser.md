# Data Adviser implementation and reference map

Data implementation release: `2026.11.04.12`; navigation revision: `2026.11.04.15`. Release verification is recorded separately in `HANDOFF.md`.
The authenticated Alibaba Data Adviser was inspected directly on 2026-11-04. Screenshots are
private local reference evidence under `outputs/admin-data-adviser-20261104/references` outside Git.
Its account data and proprietary assets are not included in this implementation.

| Alibaba reference | Observed workflow | GYUTRON implementation |
| --- | --- | --- |
| Data Overview | Real-time/history, KPI strip, traffic/product/market sections | Overview with dated commerce/enquiry KPIs, selectable trends, market distributions, exact underlying records |
| Data Map | Day/week/custom dates, 7/30 days, board/table, searchable 27-indicator dialog and reorder | Custom indicator board/table, searchable metric catalog, ordered selection up to 12, scope retained in URL |
| Shop Analysis | Store/product tabs, device/date/industry filters, selectable KPI, own/average/leader lines | Product event trends, device/source filters, metric selection, imported matched peer observations |
| Trade Analysis | Draft/paid orders and values, AOV, 30/90-day scope | Imported orders, paid value before refunds, AOV, independent payment balance, status distribution and records |
| Deliver Analysis | Refund/dispute KPIs and selectable three-series trend | Fulfillment state, valid payment-to-fulfillment time, missing dates, dated order records |
| Sub-accounts Analysis | Sortable account product/exposure/inquiry/reply/order table and exports | Permission-scoped team activities and task completion, active identities, exact task/activity records |
| Visitor Details | Buyer/date/region/owner filters and behavior table | Aggregate visitor/session/page-view observations; enquiries are separately labelled contact addresses |
| Market Analysis | Category/country modes, demand/growth/ratio/conversion rankings, product comparisons | Country-level enquiry/order distributions and measured imported industry observations |
| Product Trends | Analysis/discovery/model modes; product search, filters, index selection and product table | Product-scoped event/order analysis, SKU filters, rankings and same-scope exact records |
| Keyword Adviser | Store keywords/industry index/thesaurus, keyword search and export | Measured keyword impressions/clicks/weighted CTR, keyword scope, trends and export |
| Flow Analysis | Source/assistant/destination tabs; source table with a Trend popup and peer curves | Channel/source/device filters, imported impressions/clicks/sessions, exact ratios and drill |
| Visitor profiles | Store/industry buyers; behavior/type/category/source/country distributions | Imported customer completeness, repeat-order references, country and enquiry distributions |
| AI Showcase | SmartWindow managed product quota and exclusions; agreement before activation | Evidence-based product candidate review, browser-local review/hide/restore; no publishing or agreement activation |
| Campaign/resources | Keyword Advertising, Data School, searchable Data Dictionary | Aggregate advertising report, analysis guide, metric definitions and formulas |

This mapping identifies the actual reference and the implemented scope. It does not assert that
GYUTRON has Alibaba's proprietary industry dataset, anonymous-person tracking, advertising execution,
RFQ/TM identity graph, recommendation engine, or every nested Alibaba business feature.

Charts use the pinned self-hosted Apache ECharts 6.1.0 Canvas renderer. Application controls expose
series toggles, crosshair/tooltip, zoom/reset, explicit date-range application, keyboard point
inspection and same-filter drill. Underlying tables retain exact integer/decimal values; plotted
coordinates are approximate for very large integers. Missing measurements remain unavailable.

Aggregate imports use an enabled `csv_generic` source. Preview precedes atomic commit, exact integers
remain text (up to 30 digits), file hashes prevent duplicate commits, ratios retain numerator and
denominator, and UV requires an observation for the exact selected period. Peer data must match
source, dimensions, currency where relevant and reported dates. Native enquiries have no currency;
selecting USD must not remove them. Different currency amounts are never added together.

The new migration `0011_analytics_observations.sql` adds only aggregate observation/import tables,
indexes and validation triggers. Apply it before this Worker release. Backup format 5 includes both
tables; prior formats 2, 3 and 4 remain verified/restore-compatible within their original table sets.
No public-site tracking, host routing, payment, binding or credential changes are part of this work.

Test mode is an in-memory implementation of the same catalog, filters, charts, records, CSV import
and export contracts. New fields/actions/views must be updated there and independently validated in
the same change. Network, persistent storage and fallback to live business endpoints are prohibited.

The .13 navigation follows the supplied Alibaba expanded/rail references: graphite primary rail,
224px independent white secondary panel, Store / Data analysis / Data AI / Campaigns / Resources,
14px text-only links, neutral square selected rows, stable navigation nodes and independent scrolling.
The main rail expands/restores the same 22 routes; responsive analysis selection keeps all 16 views.
Below 1101px the existing native grouped selector avoids nested mobile drawers. KPI columns follow
available content width, including when both desktop menus are expanded. Automatic pointer/focus state is
in-memory; the shared UI behaves the same in live and Test mode without business requests or storage.

Desktop primary navigation expands automatically on pointer entry or keyboard Tab focus and collapses on leave or route selection. The 72px rail reservation remains fixed while the 232px panel overlays it; mobile keeps its drawer. No manual collapse button is required.

Navigation .15 replaces the single expanding rail with the verified Alibaba interaction: current secondary navigation stays fixed, while an expanded primary and a contextual secondary preview form a temporary shared region. Hover does not navigate or replace current selection. Both pointer and keyboard users can enter the preview; leaving dismisses it after200ms and selection uses normal existing hash routes. Authored metadata reuses all16 analysis views; all22 original primary anchors remain. GYUTRON uses60/240/208px dimensions,36px mouse rows,44px coarse-pointer targets and square surfaces.
