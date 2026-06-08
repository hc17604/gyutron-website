/**
 * Industries model.
 *
 * An industry = ONE production line shown front-to-back. Each is an entry in
 * `src/data/industries.ts` (`INDUSTRIES`); the Industries mega-menu derives its groups from that
 * registry (see `data/header-navigation.ts`), and the per-industry pages (a future production-line
 * graphic) will render from the same model. All text is referenced by i18n key (`*Key`), never
 * inlined — the strings live in `src/i18n/{en,de,ja}.json` and the build throws on a missing key.
 *
 * Mirrors the Solutions registry pattern (`types/solution.ts`); kept intentionally small.
 */

/** One production-line station: a place along the line where a vision / inspection / ID solution sits. */
export interface IndustryStation {
  /** i18n key for the station / process-step name, e.g. "Solder Paste Inspection (SPI)". */
  titleKey: string;
  /** i18n key for the short vision/inspection/ID task done at this station. */
  descKey: string;
}

/** A single industry production line, surfaced in the Industries mega-menu. */
export interface Industry {
  /** URL-safe id; also the future page slug. */
  slug: string;
  /**
   * Canonical link target for the menu entry. Until the dedicated industry page exists this points at
   * a homepage anchor; swap to `/<slug>.html` once the production-line page is built.
   */
  path: string;
  /** i18n key for the industry name (the mega-link title shown in the left rail). */
  labelKey: string;
  /** i18n key for the short positioning tagline (mega-link description; shown in the mobile drawer). */
  taglineKey: string;
  /** i18n key for the one-sentence flyout intro/blurb above the station boxes. */
  introKey: string;
  /** Background image path for the flyout banner (keep any `?v=` cache-buster). */
  image: string;
  /** Production-line stations, ordered FRONT-TO-BACK (incoming → … → end-of-line / traceability). */
  stations: IndustryStation[];
}
