# GYUTRON Product Catalog Guide

This site keeps product content separate from page rendering.

- Edit product names, category titles, descriptions, specs, and category membership in `product-data.js`.
- Edit product-card rendering, pagination, comparison tables, and navigation behavior in `product-catalog.js`.
- The live Cloudflare asset directory is `public/`. After changing static files, sync the matching files into `public/` before deploying.
- Product category pages are generated from `body data-category="..."`. The page filename should match the category key, for example `vision-lighting.html` uses `data-category="vision-lighting"`.

Current product groups:

- `rugged-pda`: Android PDA, RFID Handhelds, Barcode Scanners, Request Specification.
- `sensors`: Presence & Object Detection, Distance & Position, Process & Condition.
- `vision`: Smart & Area Scan Cameras, Controllers & 3D Vision, Code Reading & Verification, Vision Lighting.
- `quality`: Dimensional Gauges, Surface Inspection, Portable Testers, Calibration Tools.

Do not expose secondary product-line overview pages in product-page tabs. If a secondary entry is needed for an old URL, set `redirectTo` and keep the actual products inside the focused tertiary categories only.

Product image standards:

- Keep images within the same product line on a consistent catalog canvas, preferably the same aspect ratio, white background, product direction, visual scale, and baseline.
- Check product-line pages as a grid before committing. If one image feels larger, smaller, rotated differently, or cropped differently, normalize the asset itself instead of relying only on CSS.
- Remove stray generated edges, partial objects, dirty marks, and excessive white margins before publishing. Wide controller modules may stay physically wide, but they still need balanced scale and clean centering inside the card.
- Do not reuse the same product image for different models unless the page explicitly describes a configuration variant.
