# GYUTRON Website Rules

- Every website change must consider desktop, iPad/tablet, and iPhone/mobile display behavior before completion.
- All new subpages must keep the same top strip, header logo, primary navigation, dropdown structure, and Contact Sales CTA as the homepage unless the user explicitly requests a global navigation redesign.
- Avoid desktop-only assumptions for navigation, dropdowns, fixed-width elements, multi-column grids, and large hero sections.
- Check that header, logo, CTA buttons, hero text, product cards, ESG/resources cards, footer, and dropdown menus remain orderly at common widths: 1440px, 1024px, 768px, 430px, and 390px.
- Prefer responsive grid/flex rules, constrained image dimensions, and earlier tablet breakpoints over simply shrinking text.
- Keep GYUTRON brand text uppercase in visible copy, while preserving lowercase URLs, emails, and file paths.
- Do not use AI-generated photos of people on the website. If a section needs people imagery, use credible real-world stock/editorial photos from a suitable public source and keep source URLs traceable.
- Product catalog work must look rigorous and professional. Within the same product line, product images must use consistent canvas ratio, background, camera angle, subject scale, direction, alignment, and baseline before shipping.
- Do not mix product photos with mismatched crops, inconsistent directions, random generated angles, or misleading repeated assets. Product model names, specs, and image assignments must read like a real industrial catalog.
- Solutions navigation should frame GYUTRON as a system-level industrial solution provider. Keep the current Solutions taxonomy unless the user requests a global redesign: Automated Vision Inspection; Electronics & Semiconductor Manufacturing; Integrated Industrial Embedded Systems; Manufacturing Intelligence & Traceability; Warehouse & Field Operations; OEM / ODM Solution Programs.
- Navigation menu images must be unique within the full desktop nav. Run a duplicate check against `url('...')` references in the nav before finishing any header/menu update.
- Use `tools/update_navigation.py` to propagate shared header navigation changes across root HTML pages and matching `public/` pages.
