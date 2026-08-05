# Shared scroll chrome QA — 2026-08-05

Scope: GYUTRON brand site only. Shop files and behavior were excluded.

## Evidence

- `desktop-1440-solution-nav-hidden.png` — solution page after downward scroll; the fixed Header is hidden and the purple back-to-top control is visible.
- `mobile-390-support-nav-hidden.png` — mobile Support page after downward scroll; the 50×50 control is separated from the two Support/Contact launchers.
- `mobile-390-support-scrolled.png` — mobile page with the Header revealed after upward scroll.
- `qa-results.json` — computed geometry and state results for 1440, 1024, 768, 430, 390, and short-landscape cases.
- `build.log` / `verify.log` — Astro build and full verification output.

## Result

- Downward scrolling past the threshold hides `.top-strip` and `.site-header` on every tested page family.
- Upward scrolling reveals both rows; the back-to-top control remains available until the page returns near the top.
- Activating the control returns to `scrollY = 0`, restores the Header, and removes the control from the tab order.
- English, German, and Japanese accessible names passed.
- Mobile menu and Support dialog states hide the back-to-top control so controls do not layer over one another.
- No horizontal overflow was found. The fresh non-form console run had zero warnings/errors. The production Turnstile key produced the expected third-party hostname error on the local `127.0.0.1` contact-form check; this is unrelated to the scroll controls and is rechecked on the live hostname after deployment.
