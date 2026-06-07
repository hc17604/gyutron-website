/**
 * Site image / asset registry types. The registry (`src/data/assets.ts`) is a single,
 * documented index of the SITE-LEVEL shared images (logo, social share, payment marks, hero
 * backgrounds) so a maintainer can find an image, its purpose, and where it is used. Bulk image
 * SETS that are already owned by a data layer (per-product images in `products.{en,de,ja}.js`,
 * mega-menu panels in `header-navigation.ts`, hero art in `heroSlides.ts`) are NOT duplicated
 * here — see the notes in `assets.ts`.
 */
import type { Locale } from '../i18n';

/** Who owns / is responsible for an asset (for maintenance routing). */
export type ImageOwner = 'brand' | 'product' | 'support' | 'seo';

export interface SiteImage {
  /** Stable id used to look the image up (getImage). */
  id: string;
  /** Path relative to the public root (e.g. "/gyutron-logo.svg") or an absolute URL. */
  src: string;
  /**
   * Localized alt text. For brand marks the value is locale-invariant (a proper noun).
   * For decorative images (`decorative: true`) the alt is intentionally empty in every locale.
   */
  alt: Record<Locale, string>;
  /** Human-readable list of where this image is used (component / page / feature). */
  usage: string[];
  width?: number;
  height?: number;
  owner?: ImageOwner;
  /** True if the image is purely decorative (rendered with alt="" + aria-hidden, or a CSS/meta background). */
  decorative?: boolean;
}
