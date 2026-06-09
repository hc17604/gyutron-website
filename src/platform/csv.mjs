/**
 * RFC-4180 CSV export. Reusable across every admin list view.
 */

function escapeCell(value) {
  if (value == null) return "";
  const s = String(value);
  // Quote if the cell contains a comma, quote, CR or LF; double embedded quotes.
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * @param {Array<Record<string, unknown>>} rows
 * @param {string[]} columns  Ordered column keys. Defaults to the union of keys.
 * @returns {string} CSV text (with a UTF-8 BOM so Excel reads non-ASCII correctly).
 */
export function toCsv(rows, columns) {
  const cols = columns && columns.length ? columns : unionKeys(rows);
  const header = cols.map(escapeCell).join(",");
  const body = rows.map((row) => cols.map((c) => escapeCell(row[c])).join(",")).join("\r\n");
  return `﻿${header}\r\n${body}`;
}

function unionKeys(rows) {
  const seen = new Set();
  for (const row of rows) for (const k of Object.keys(row)) seen.add(k);
  return [...seen];
}

/** Wrap CSV text in a downloadable Response. */
export function csvResponse(filename, csv) {
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
