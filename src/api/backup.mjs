/**
 * Daily D1 backup → R2 (Worker Cron Trigger; zero external dependencies).
 *
 * Exports every data table as JSON to `backups/daily/YYYY-MM-DD.json`
 * (Sundays also copied to `backups/weekly/`). Retention: 30 daily / 12 weekly.
 * Each file carries a manifest (schema version, row counts, exported_at) so a
 * restore can be validated. Restore runbook: docs/cloudflare-deployment.md §8
 * + agent repo docs/PHASE6.md.
 */
import { TABLES } from "../platform/config.mjs";
import { emitEvent } from "../platform/db/events.mjs";
import { getDb } from "../platform/db/client.mjs";

const DAILY_KEEP = 30;
const WEEKLY_KEEP = 12;
const SCHEMA_VERSION = 1;

export async function runBackup(env) {
  const db = getDb(env);
  if (!db || !env.R2) {
    console.error("backup skipped: missing", !db ? "DB" : "R2");
    return { ok: false, reason: "missing binding" };
  }
  const today = new Date().toISOString().slice(0, 10);
  const tables = {};
  const counts = {};
  for (const table of Object.values(TABLES)) {
    const res = await db.prepare(`SELECT * FROM ${table}`).all();
    tables[table] = res.results || [];
    counts[table] = tables[table].length;
  }
  const payload = JSON.stringify({
    manifest: { schema_version: SCHEMA_VERSION, exported_at: new Date().toISOString(), date: today, counts },
    tables,
  });
  await env.R2.put(`backups/daily/${today}.json`, payload, { httpMetadata: { contentType: "application/json" } });
  if (new Date().getUTCDay() === 0) {
    await env.R2.put(`backups/weekly/${today}.json`, payload, { httpMetadata: { contentType: "application/json" } });
  }
  await prune(env, "backups/daily/", DAILY_KEEP);
  await prune(env, "backups/weekly/", WEEKLY_KEEP);
  await emitEvent(db, env, {
    eventType: "backup.created",
    entityType: "backup",
    entityId: today,
    payload: { counts, weekly: new Date().getUTCDay() === 0 },
  });
  return { ok: true, date: today, counts };
}

async function prune(env, prefix, keep) {
  try {
    const listing = await env.R2.list({ prefix, limit: 200 });
    const keys = (listing.objects || []).map((o) => o.key).sort(); // YYYY-MM-DD sorts chronologically
    for (const key of keys.slice(0, Math.max(0, keys.length - keep))) {
      await env.R2.delete(key);
    }
  } catch (e) {
    console.error("backup prune failed:", e && e.message);
  }
}
