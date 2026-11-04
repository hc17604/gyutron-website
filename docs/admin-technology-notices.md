# Operations technology and distribution notes

The Operations domain, authentication integration and interface were authored in this repository.
No Salesforce, HubSpot, Linear, Odoo, ERPNext, Frappe CRM or Twenty application source was imported.
Those products informed the product research; their names do not imply affiliation or compatibility.

The interface uses standard browser HTML/CSS/JavaScript. The 2026-11-03 UI redesign distributes
the official Inter variable font from https://rsms.me/inter/font-files/InterVariable.woff2, unchanged,
at `public/workspace-assets/fonts/inter-latin.woff2`. Its SIL Open Font License 1.1 is included as
`public/workspace-assets/fonts/OFL.txt`; Chinese glyphs use the operating system's CJK fallback.
The same files live under `astro/public/` so normal brand builds preserve these workspace assets.

Navigation and action icons use the official Lucide SVG paths pinned to revision
`aa0b77386c07630e5f1a9f877fd3ba4b2a4a1558` of https://github.com/lucide-icons/lucide.
The full upstream copyright/license text is embedded in `src/admin/icons.mjs`, including the
Lucide ISC notice and Feather-derived MIT notice. The 41 action icons plus two semantic navigation aliases record their upstream
filenames and original SVG SHA-256 values in `ADMIN_ICON_SOURCES`. Application aliases are
`archive-restore` → `archive-arrow-up.svg`, `trash-2` → `trash.svg`, `filter` → `funnel.svg`, and
`circle-help` → `circle-question-mark.svg`. Geometry remains the pinned upstream data; the workspace
supplies a shared 24-unit view box, current-color 2.1-unit stroke and square/miter presentation.
`ADMIN_ICON_HTML` is a trusted pre-rendered string map shared by the server and browser clients.
No icon font, remote SVG reference, runtime function serialization, or proprietary Alibaba icon
asset is included. No third-party browser framework was added. Existing GYUTRON
logos retain project ownership and branding restrictions. The login uses the same original purple
PNG wordmark as the official homepage, rather than a reconstructed SVG.
The workspace sidebar uses only that original full PNG wordmark on the same solid white background
as the official main navigation. The former company-switch text, small mark and duplicate menu have
been removed at the owner's latest request. The industrial revision applies square corners to controls,
surfaces and SVG rectangles.

The Data Adviser revision uses Apache ECharts 6.1.0 and ZRender 6.1.0, pinned in the complete
package lock. A tree-shaken Canvas-only ESM bundle is generated with `scripts/build-admin-charts.mjs`
from `src/admin/charts-runtime-entry.mjs`. The self-hosted, content-addressed asset and its upstream
Apache 2.0 LICENSE/NOTICE plus tslib license are included under `public/workspace-assets/vendor/`.
The chart runtime loads only when analysis charts are used; it does not send business data to a CDN.
The application supplies native keyboard/legend/date-range controls, exact-value readouts and
same-scope drill links. Alibaba's authenticated interface informed the analysis workflows; no
proprietary Alibaba HTML, scripts, icons, copied account data or marketing claims are distributed.

The deployed service uses the existing Cloudflare Worker/D1/R2/KV environment. Open source technology
underlies that environment (including workerd and SQLite), but Cloudflare's managed services are not
represented as an entirely open source, equivalent self-hosted service. Local tool versions remain
locked in the repository package lockfiles. Dependency license metadata and upstream license files
must be included or referenced when redistributing their actual code or binaries.

See `admin-saas-research.md` for primary product/license sources. In particular, an open source CRM's
license is not a blanket permission to redistribute that CRM under a different proprietary license;
this implementation avoids importing those codebases. Source/customer licensing of this application's
own code and use of GYUTRON trademarks are determined by the project owner, separately from runtime
dependencies. No new public source-code license is silently applied to the existing repository.


The Test mode dataset and in-memory request adapter are authored in this repository. Their customer,
commerce, license, model, backup and system records are explicitly synthetic demonstration content.
The adapter has no network or persistent-storage dependency; the maintenance/coverage contract is
included in `admin-demo-mode.md`. Original live records are never seeded or replaced by enabling it.
