/**
 * Resource center — file delivery (Phase 2 / P5 MVP).
 *
 *   GET /api/download/:id[?token=...]
 *
 * The manifest (astro/src/data/downloads.json) is the single source of truth,
 * shared with the download-request form. Access levels:
 *   public        → stream the R2 object directly (no token)
 *   gated         → stream only with a valid short-lived HMAC token; tokens are
 *                   issued by POST /api/download-request after the request row
 *                   is captured (see issueDownload below)
 *   manual_review → never served here; the team emails the file after review
 *
 * Degrades gracefully: no R2 binding / no signing secret / missing object →
 * JSON error, nothing crashes, the request-capture flow keeps working.
 */
import { json } from "../platform/response.mjs";
import { hmacHex, timingSafeEqual } from "../platform/security/hash.mjs";
import manifest from "../../astro/src/data/downloads.json" with { type: "json" };

const TOKEN_TTL_SECONDS = 15 * 60;

const CONTENT_TYPES = {
  pdf: "application/pdf",
  zip: "application/zip",
  png: "image/png",
  jpg: "image/jpeg",
};

const FILES = Array.isArray(manifest.files) ? manifest.files : [];

/** Manifest entry by id, or null. Exposed for the form handler. */
export async function findManifestEntry(id) {
  if (!id) return null;
  return FILES.find((f) => f.id === id) || null;
}

function signingSecret(env) {
  return env.DOWNLOAD_TOKEN_SECRET || env.ADMIN_SECRET || env.IP_HASH_SALT || "";
}

async function makeToken(env, fileId, exp) {
  return `${exp}.${await hmacHex(`${fileId}.${exp}`, signingSecret(env))}`;
}

async function verifyToken(env, fileId, token) {
  if (!token || !signingSecret(env)) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const exp = token.slice(0, dot);
  if (!/^\d+$/.test(exp) || Number(exp) * 1000 < Date.now()) return false;
  const expected = await makeToken(env, fileId, exp);
  return timingSafeEqual(token, expected);
}

/**
 * Called by the download-request form handler after the request row is stored.
 * Returns `{ status: 'ready', url }` when the file can be delivered now, else
 * `{ status: 'received' }` (manual review / R2 not active / unknown file).
 */
export async function issueDownload(env, entry) {
  if (!entry || !env.R2) return { status: "received" };
  if (entry.access_level === "public") {
    return { status: "ready", url: `/api/download/${entry.id}` };
  }
  if (entry.access_level === "gated" && signingSecret(env)) {
    const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const token = await makeToken(env, entry.id, exp);
    return { status: "ready", url: `/api/download/${entry.id}?token=${encodeURIComponent(token)}` };
  }
  return { status: "received" };
}

/** GET /api/download/:id */
export async function handleDownload(request, env, ctx, url) {
  if (request.method !== "GET") {
    return json({ ok: false, message: "Method not allowed." }, 405, { allow: "GET" });
  }
  const id = decodeURIComponent(url.pathname.slice("/api/download/".length)).replace(/\/+$/, "");
  const entry = await findManifestEntry(id);
  if (!entry) return json({ ok: false, message: "Unknown document." }, 404);

  if (entry.access_level === "manual_review") {
    return json(
      { ok: false, message: "This document is provided after review — please submit a request at /resources/download-request.html." },
      403,
    );
  }
  if (entry.access_level === "gated") {
    const valid = await verifyToken(env, entry.id, url.searchParams.get("token") || "");
    if (!valid) {
      return json(
        { ok: false, message: "This link has expired — please submit the download request again." },
        403,
      );
    }
  }

  if (!env.R2) {
    return json({ ok: false, message: "The resource center is not available yet. Please email info@gyutron.com." }, 503);
  }
  try {
    const object = await env.R2.get(entry.r2_key);
    if (!object) {
      return json({ ok: false, message: "The file is not available yet. Please email info@gyutron.com." }, 404);
    }
    const filename = String(entry.r2_key).split("/").pop() || "download";
    const headers = {
      "content-type": CONTENT_TYPES[entry.file_type] || "application/octet-stream",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
    };
    if (object.size != null) headers["content-length"] = String(object.size);
    return new Response(object.body, { status: 200, headers });
  } catch (e) {
    console.error("download serve failed:", e && e.message);
    return json({ ok: false, message: "The file could not be delivered right now." }, 500);
  }
}
