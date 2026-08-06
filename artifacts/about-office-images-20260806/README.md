# Homepage About office-image QA - 2026-08-06

Scope: the two 16:9 images below the existing headquarters image on the English, German, and Japanese homepages.

## Browser results

- 1440 x 900: all three About images loaded; the two stock replacements rendered at 262 x 147; no horizontal overflow; no console errors.
- 390 x 844: all three About images loaded; the two replacements rendered at 176 x 99; no horizontal overflow; no console errors.
- Replacement natural dimensions: 1672 x 941 for both files.
- Final stock-photo cache URLs verified: `?v=6f85ceee` and `?v=dc56733d`.

Machine-readable measurements are in `browser-metrics.json`. Automated screenshot capture returned blank browser surfaces in this environment, so the retained evidence is image inspection plus DOM geometry, loading state, overflow, and console measurements.
