# Operations technology and distribution notes

The Operations domain, authentication integration and interface were authored in this repository.
No Salesforce, HubSpot, Linear, Odoo, ERPNext, Frappe CRM or Twenty application source was imported.
Those products informed the product research; their names do not imply affiliation or compatibility.

The interface uses standard browser HTML/CSS/JavaScript. The 2026-11-03 UI redesign distributes
the official Inter variable font from https://rsms.me/inter/font-files/InterVariable.woff2, unchanged,
at `public/workspace-assets/fonts/inter-latin.woff2`. Its SIL Open Font License 1.1 is included as
`public/workspace-assets/fonts/OFL.txt`; Chinese glyphs use the operating system's CJK fallback.
The same files live under `astro/public/` so normal brand builds preserve these workspace assets.

Navigation icons use the official Lucide SVG paths pinned to revision
`aa0b77386c07630e5f1a9f877fd3ba4b2a4a1558` of https://github.com/lucide-icons/lucide.
The full upstream copyright/license text is embedded in `src/admin/icons.mjs`, including the
Lucide ISC notice and Feather-derived MIT notice. No third-party browser framework or chart library
was added. Existing GYUTRON logos retain project ownership and branding restrictions. The login uses the same original purple PNG wordmark as the official homepage, rather than a reconstructed SVG.
The workspace sidebar uses only that original full PNG wordmark on the same solid white background
as the official main navigation. The former company-switch text, small mark and duplicate menu have
been removed at the owner's latest request. The industrial revision applies square corners to controls,
surfaces and SVG rectangles.

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
