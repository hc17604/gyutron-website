# Operations technology and distribution notes

The Operations domain, authentication integration and interface were authored in this repository.
No Salesforce, HubSpot, Linear, Odoo, ERPNext, Frappe CRM or Twenty application source was imported.
Those products informed the product research; their names do not imply affiliation or compatibility.

The interface uses standard browser HTML/CSS/JavaScript and application-owned geometric SVG controls.
There is no newly bundled icon, chart, browser-framework or font package. Existing GYUTRON logos and
brand assets retain their project ownership and branding restrictions; they are not licensed by a
third-party runtime license. The system font stack does not distribute Inter font binaries.

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
