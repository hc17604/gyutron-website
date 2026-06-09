/**
 * Generic D1 repository. ONE place that builds SQL, so injection defenses live in
 * ONE place:
 *   - Table names are checked against a fixed allow-list (`TABLE_COLUMNS`).
 *   - Column identifiers are filtered to that table's allow-list before they touch
 *     the SQL string — a caller can never inject an arbitrary identifier.
 *   - All VALUES are bound parameters (`?`), never string-interpolated.
 *
 * Cursor model for incremental sync: rows are ordered by the autoincrement `id`
 * ascending; `cursor` = the last id seen. This is stable under concurrent inserts
 * (unlike timestamp paging), so the Agent Workspace never misses or double-reads.
 */
import { TABLE_COLUMNS, UPDATABLE_COLUMNS } from "../schemas.mjs";

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

function assertTable(table) {
  if (!Object.prototype.hasOwnProperty.call(TABLE_COLUMNS, table)) {
    throw new Error(`Unknown table: ${table}`);
  }
}

/** Columns that may be SELECTed for a table (insertable columns + the internal id). */
function selectable(table) {
  return [...TABLE_COLUMNS[table], "id"];
}

/** Keep only valid column keys whose value is defined. */
function pickColumns(table, row) {
  const allowed = TABLE_COLUMNS[table];
  return Object.keys(row).filter((c) => allowed.includes(c) && row[c] !== undefined);
}

/** INSERT one row. Returns the D1 run result. */
export async function insert(db, table, row) {
  assertTable(table);
  const cols = pickColumns(table, row);
  if (!cols.length) throw new Error("No valid columns to insert");
  const placeholders = cols.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`;
  return db.prepare(sql).bind(...cols.map((c) => row[c])).run();
}

/**
 * Paged list with incremental-sync filters.
 * @param {object} opts { select?, cursor?, since?, status?, limit? }
 * @returns {{ rows: object[], nextCursor: number|null, limit: number }}
 */
export async function list(db, table, opts = {}) {
  assertTable(table);
  const allowed = selectable(table);
  let select = (opts.select && opts.select.length ? opts.select : allowed).filter((c) => allowed.includes(c));
  if (!select.includes("id")) select = ["id", ...select]; // id required for the cursor

  const limit = Math.min(Math.max(1, Number(opts.limit) || DEFAULT_LIMIT), MAX_LIMIT);
  const where = [];
  const binds = [];

  if (opts.cursor != null && Number.isFinite(Number(opts.cursor))) {
    where.push("id > ?");
    binds.push(Number(opts.cursor));
  }
  if (opts.since) {
    where.push("created_at >= ?");
    binds.push(String(opts.since));
  }
  if (opts.status && allowed.includes("status")) {
    where.push("status = ?");
    binds.push(String(opts.status));
  }

  const whereSql = where.length ? ` WHERE ${where.join(" AND ")}` : "";
  const sql = `SELECT ${select.join(", ")} FROM ${table}${whereSql} ORDER BY id ASC LIMIT ?`;
  binds.push(limit);

  const res = await db.prepare(sql).bind(...binds).all();
  const rows = res.results || [];
  const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;
  return { rows, nextCursor, limit };
}

/** Fetch a single row by its public id. */
export async function getByPublicId(db, table, publicId, select) {
  assertTable(table);
  const allowed = selectable(table);
  let cols = (select && select.length ? select : allowed).filter((c) => allowed.includes(c));
  if (!cols.length) cols = allowed;
  const sql = `SELECT ${cols.join(", ")} FROM ${table} WHERE public_id = ? LIMIT 1`;
  return (await db.prepare(sql).bind(String(publicId)).first()) || null;
}

/** Patch admin-editable columns of a row. Patch keys are allow-listed per table. */
export async function updateByPublicId(db, table, publicId, patch) {
  if (!Object.prototype.hasOwnProperty.call(UPDATABLE_COLUMNS, table)) {
    throw new Error(`Table not updatable: ${table}`);
  }
  const allowed = UPDATABLE_COLUMNS[table];
  const cols = Object.keys(patch).filter((c) => allowed.includes(c) && patch[c] !== undefined);
  if (!cols.length) return { success: false, meta: { changes: 0 } };
  const setSql = cols.map((c) => `${c} = ?`).join(", ");
  const binds = cols.map((c) => patch[c]);
  binds.push(String(publicId));
  const sql = `UPDATE ${table} SET ${setSql} WHERE public_id = ?`;
  return db.prepare(sql).bind(...binds).run();
}

/** Hard-delete a row by public id (used by the admin "delete" action). */
export async function deleteByPublicId(db, table, publicId) {
  assertTable(table);
  return db.prepare(`DELETE FROM ${table} WHERE public_id = ?`).bind(String(publicId)).run();
}

/** COUNT(*) with an optional status filter. */
export async function count(db, table, opts = {}) {
  assertTable(table);
  let sql = `SELECT COUNT(*) AS n FROM ${table}`;
  const binds = [];
  if (opts.status && selectable(table).includes("status")) {
    sql += " WHERE status = ?";
    binds.push(String(opts.status));
  }
  const res = await db.prepare(sql).bind(...binds).first();
  return res ? res.n : 0;
}

/** Shallow projection — drop any column not in `fields`. */
export function project(row, fields) {
  if (!row) return row;
  const out = {};
  for (const f of fields) if (f in row) out[f] = row[f];
  return out;
}
