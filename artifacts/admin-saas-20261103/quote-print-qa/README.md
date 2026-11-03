# Synthetic quotation print verification

The HTML is the actual quotation renderer output with its print stylesheet embedded for an offline browser print test. All names, addresses and contact details are synthetic; `example.test` addresses are fixtures. The document explicitly states that it is not a customer offer.

Chrome headless produced six A4 pages from 50 line items, one long description, 40 bilingual terms and printed notes. PDF text checks found every SKU and term marker, Chinese text and the exact USD total of 1,574,208.56. Poppler rendered all six pages; the contact sheet and full pages 1 and 5 were visually inspected for clipping, overlap, table headers, totals and Chinese glyphs. No such defect was found in this fixture.

`pdf-checks.json` records the text/page assertions. `manifest.json` records file hashes and the renderer hash. The continuation pages did not repeat the quotation reference or page numbers in this tested version; that remains a print usability improvement, not a financial-data failure. Re-render after any print stylesheet change.

This proves the tested offline print fixture. It does not prove authenticated application browser interactions, a production quotation release, PDF delivery to customers or a server-side PDF service.
