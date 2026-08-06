# Homepage About office-image QA - 2026-08-06

Scope: the two 16:9 images below the existing headquarters image on the English, German, and Japanese homepages.

## Browser results

- 1440 x 900: all three About images loaded; the two replacements rendered at 265 x 149; no horizontal overflow; no console errors.
- 390 x 844: all three About images loaded; the two replacements rendered at 176 x 99; no horizontal overflow; no console errors.
- Replacement natural dimensions: 1672 x 941 for both files.
- Cache-specific URLs verified: `?v=baa468da` and `?v=d5e5eacd`.

Machine-readable measurements are in `browser-metrics.json`. Automated screenshot capture returned blank browser surfaces in this environment, so the retained evidence is image inspection plus DOM geometry, loading state, overflow, and console measurements.
