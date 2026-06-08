/**
 * Industries model.
 *
 * Each industry is a sector GYUTRON serves, with a short list of the areas it COVERS. Entries live in
 * `src/data/industries.ts` (`INDUSTRIES`); the Industries mega-menu derives its groups from that
 * registry (see `data/header-navigation.ts`), and the per-industry pages (later) render from the same
 * model. All text is referenced by i18n key (`*Key`), never inlined — the strings live in
 * `src/i18n/{en,de,ja}.json` and the build throws on a missing key.
 *
 * Mirrors the Solutions registry pattern (`types/solution.ts`); kept intentionally small.
 */

/** One coverage area within an industry (a sub-domain / application keyword, e.g. "PCB / PCBA"). */
export interface IndustryCoverage {
  /** i18n key for the coverage term. */
  labelKey: string;
}

/** A single industry, surfaced in the Industries mega-menu. */
export interface Industry {
  /** URL-safe id; also the future page slug. */
  slug: string;
  /**
   * Canonical link target for the menu entry. Until the dedicated industry page exists this points at
   * a homepage anchor; swap to `/<slug>.html` once the page is built.
   */
  path: string;
  /** i18n key for the industry name (the mega-link title shown in the left rail). */
  labelKey: string;
  /** i18n key for the short positioning tagline (mega-link description; shown in the mobile drawer). */
  taglineKey: string;
  /** i18n key for the one-sentence flyout intro/blurb above the coverage list. */
  introKey: string;
  /** i18n key for a longer description paragraph shown UNDER the coverage chips (fills the flyout). */
  detailKey: string;
  /** Background image path for the flyout banner (keep any `?v=` cache-buster). */
  image: string;
  /** The areas this industry covers (sub-domains / applications), shown as the flyout list. */
  coverage: IndustryCoverage[];
}
