/**
 * Partner / ecosystem types. Rendered as a logo wall on the homepage. `name` is a brand/standard
 * name (locale-invariant). If `logo` is set it renders the image; otherwise the name renders as a
 * text tile — so the section works before real partner logos are supplied.
 */
export interface Partner {
  id: string;
  name: string;
  /** Public path to a logo image; omit/'' → render `name` as a text tile. */
  logo?: string;
  /** Optional external URL. */
  url?: string;
}
