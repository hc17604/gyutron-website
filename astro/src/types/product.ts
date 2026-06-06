/**
 * Product catalog types. These mirror the existing per-locale data files
 * `src/data/products.{en,de,ja}.js` exactly — do not change the shape without updating
 * those files (and running `python tools/i18n-audit.py`).
 */

/** Key→value spec map, e.g. { OS: "Android 14", Rugged: "IP68 / 1.8 m drop" }. */
export type ProductSpec = Record<string, string>;

/** A single product model. `name` is invariant across locales (never translate it). */
export interface Product {
  name: string;
  type: string;
  summary: string;
  /** Coarse family used for layout/imagery, e.g. "pda" | "rfid" | "camera". */
  kind: string;
  /** Image path relative to the public root. */
  image: string;
  specs: ProductSpec;
  tags: string[];
}

/** A product category (one page under `/[category].html`). */
export interface ProductCategory {
  eyebrow: string;
  title: string;
  navLabel: string;
  heroImage: string;
  intro: string;
  panelMetric: string;
  panelText: string;
  products?: Product[];
  /** If set, the category page redirects here instead of rendering products. */
  redirectTo?: string;
}

/** The full catalog: category slug → category. Equals `GYUTRON_PRODUCTS`. */
export type ProductCatalog = Record<string, ProductCategory>;
