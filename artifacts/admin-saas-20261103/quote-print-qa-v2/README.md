# Failed print-layout candidate — diagnostic evidence

This directory preserves the first four-language print attempt after adding fixed footers. It is **not an accepted final print layout**.

Chrome rendered page counters correctly, but `footer { position:fixed; bottom:-11mm }` did not place the reference in the bottom margin: the first page omitted the footer, and pages 2–6 placed it near the repeated table header at about 62 pt from the top. The English page 2 PNG shows the defect. It was reported to the document owner, who is replacing fixed footers with authenticated quotation-specific CSS and `@page` margin boxes.

The fixture retains the v1 synthetic body content and exact total. All contacts use synthetic test data. Any later accepted result is stored in a separate version directory; these images must not be presented as final-print acceptance evidence.
