# GYUTRON Product Catalog Guide

This site keeps product content separate from page rendering.

- Edit product names, category titles, descriptions, specs, and category membership in `product-data.js`.
- Edit product-card rendering, pagination, comparison tables, and navigation behavior in `product-catalog.js`.
- The live Cloudflare asset directory is `public/`. After changing static files, sync the matching files into `public/` before deploying.
- Product category pages are generated from `body data-category="..."`. The page filename should match the category key, for example `vision-lighting.html` uses `data-category="vision-lighting"`.

Current product groups:

- `rugged-pda`: Android PDA, RFID Handhelds, Barcode Scanners, Request Specification.
- `sensors`: Sensing & I/O, Presence & Object Detection, Distance & Position, Process & Condition.
- `vision`: Machine Vision Systems, Smart & Area Scan Cameras, Controllers & 3D Vision, Code Reading & Verification, Vision Lighting & Optics.
- `quality`: Quality & Test Instruments, Dimensional Gauges, Surface Inspection, Portable Testers, Calibration Tools.
