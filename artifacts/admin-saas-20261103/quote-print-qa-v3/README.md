# Accepted four-language print fixture

This version replaces the failed fixed-footer candidate in `quote-print-qa-v2`. The original v1 fixture remains separately preserved.

All business content is synthetic. The 50 items, long multiline description, 40 bilingual terms, printed notes and USD 1,574,208.56 total match the original fixture. The record additionally contains a nonempty synthetic internal outcome note; that note is deliberately absent from every generated customer-facing HTML and PDF.

Current renderer exports generate the HTML, shared print CSS and quotation-reference CSS. The offline HTML maps their authenticated production URLs to adjacent CSS files; no source CSS was rewritten. Windows Chrome headless printed each language to A4, with browser headers and footers disabled. Poppler rendered every page at 96 dpi.

EN, 中文, Deutsch and 日本語 each produced six pages. Checks verified all 50 SKU markers and 40 terms markers, exact localized total, Unicode content, quotation reference and page counters on every page, and exclusion of the internal note. The smallest measured gap between body text and margin reference is 44.46 pt. All four contact sheets were visually inspected, with full-size checks of German totals and Japanese title/terms pages; no clipping, overlapping footer, missing glyph boxes or truncated labels was found in this fixture.

`verify-pdfs.py` reproduces text/position assertions and contact sheets with pypdf, PyMuPDF and Pillow. MuPDF handles the CJK identity checks because pypdf emits compatibility radicals for some Japanese font glyphs. `pdf-checks.json` and `manifest.json` record the checks, renderer hash and artifact hashes.

These are offline synthetic print tests. The separate API suite verifies authentication, no-store, HEAD, CSS escaping and internal-note exclusion. This directory does not by itself prove a production quotation deployment, external delivery or a server-side PDF service.
