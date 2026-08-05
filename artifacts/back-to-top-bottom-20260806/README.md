# Back-to-top final placement QA — 2026-08-06

Scope: shared brand-site Support page, with Shop explicitly excluded.

- Desktop 1440×900: standalone 50×50 button fixed 18px above the viewport bottom; Support/Contact rail remains two items at its established side position.
- Mobile 390×844 and 430×932: standalone button fixed 16px above the viewport bottom; two-item Support/Contact rail ends 84px above the bottom, leaving an 18px gap.
- Back-to-top contains no visible or expandable text (`.cw-launcher-label` count 0); localized `aria-label` and `title` remain.
- Button appears after the scroll threshold, returns to `scrollY=0`, restores the Header, and becomes unfocusable again.
- Opening Support hides and disables the standalone button.
- Root horizontal overflow: 0px. Browser console errors: 0.
- Evidence: `desktop-1440.png`, `mobile-390.png`.
