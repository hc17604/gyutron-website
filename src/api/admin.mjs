/**
 * Lightweight internal Admin (NOT a customer portal). Server-rendered HTML from
 * the Worker — zero impact on the static Astro build. Single admin, protected by
 * a signed-cookie session (see security/admin-auth.mjs). Plain, on-brand, stable.
 *
 *   GET  /admin                      dashboard (counts)
 *   GET  /admin/:resource            list (?status= &cursor= &since=)
 *   GET  /admin/:resource.csv        CSV export
 *   GET  /admin/:resource/:id        detail
 *   POST /admin/:resource/:id        action: save (status+note) | spam | delete
 *   POST /admin/login   POST /admin/logout
 *
 * Resources: leads, rfqs, support, downloads, events (events is read-only).
 */
import { adminConfigured, isAuthed, verifyPassword, createSessionCookie, clearSessionCookie } from "../platform/security/admin-auth.mjs";
import { getDb } from "../platform/db/client.mjs";
import { list, count, getByPublicId, updateByPublicId, deleteByPublicId } from "../platform/db/repository.mjs";
import { STATUS_VALUES, ACCESS_TYPES } from "../platform/schemas.mjs";
import { toCsv, csvResponse } from "../platform/csv.mjs";
import { rateLimit } from "../platform/security/ratelimit.mjs";
import { requestContext } from "../platform/request.mjs";

const RESOURCES = {
  leads: { table: "leads", label: "Leads", editable: true },
  rfqs: { table: "rfqs", label: "RFQs", editable: true },
  support: { table: "support_requests", label: "Support", editable: true },
  downloads: { table: "download_requests", label: "Downloads", editable: true },
  events: { table: "events", label: "Events", editable: false, idCol: "event_id" },
};

const LIST_COLUMNS = {
  leads: ["public_id", "created_at", "name", "company", "email", "product_interest", "status"],
  rfqs: ["public_id", "created_at", "company", "email", "product_category", "quantity", "status"],
  support: ["public_id", "created_at", "company", "email", "issue_type", "status"],
  downloads: ["public_id", "created_at", "company", "email", "requested_file", "status"],
  events: ["event_id", "created_at", "event_type", "entity_type", "entity_id"],
};

/* ------------------------------ entrypoint -------------------------------- */

export async function handleAdmin(request, env, ctx, url) {
  const secure = url.protocol === "https:";
  const segments = url.pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);

  // Auth actions first.
  if (segments[0] === "login" && request.method === "POST") return doLogin(request, env, secure);
  if (segments[0] === "logout" && request.method === "POST") return doLogout(secure);

  // Everything else requires a session.
  if (!(await isAuthed(request, env))) {
    return htmlResponse(loginPage(env), 200);
  }

  const db = getDb(env);
  if (!db) return htmlResponse(page("Admin", `<p class="empty">No data store bound. Create D1 and add the <code>DB</code> binding (see docs/cloudflare-deployment.md).</p>`));

  // Dashboard.
  if (segments.length === 0) return dashboard(env, db);

  // CSV export: /admin/<resource>.csv
  let resourceKey = segments[0];
  if (resourceKey.endsWith(".csv")) {
    return exportCsv(db, resourceKey.slice(0, -4));
  }

  const resource = RESOURCES[resourceKey];
  if (!resource) return htmlResponse(page("Not found", `<p class="empty">Unknown section.</p>`), 404);

  // Detail / action: /admin/<resource>/<id>
  if (segments.length >= 2) {
    const id = decodeURIComponent(segments.slice(1).join("/"));
    if (request.method === "POST") return doAction(request, db, resourceKey, id, secure);
    return detailView(db, resourceKey, id);
  }

  // List: /admin/<resource>
  return listView(db, resourceKey, url);
}

/* ------------------------------- auth flow -------------------------------- */

async function doLogin(request, env, secure) {
  // Throttle login attempts per IP to blunt online brute force. No-op without a
  // RATE_LIMIT KV binding, so a strong ADMIN_PASSWORD is still required.
  const ctx = await requestContext(request, env);
  const rl = await rateLimit(env, `admin-login:${ctx.ip_hash || ctx.ip || "anon"}`, { limit: 5, windowSeconds: 300 });
  if (!rl.ok) return htmlResponse(loginPage(env, "Too many attempts. Please wait a few minutes."), 429);

  const form = await request.formData().catch(() => null);
  const password = form ? form.get("password") : "";
  if (await verifyPassword(env, password)) {
    return redirect("/admin", await createSessionCookie(env, { secure }));
  }
  return htmlResponse(loginPage(env, "Incorrect password."), 401);
}

function doLogout(secure) {
  return redirect("/admin", clearSessionCookie({ secure }));
}

/* --------------------------------- views ---------------------------------- */

async function dashboard(env, db) {
  const cards = [];
  for (const [key, r] of Object.entries(RESOURCES)) {
    let total = 0;
    let fresh = 0;
    try {
      total = await count(db, r.table);
      if (STATUS_VALUES[r.table]) fresh = await count(db, r.table, { status: "new" });
    } catch {
      /* ignore */
    }
    cards.push(`
      <a class="card" href="/admin/${key}">
        <span class="card-label">${esc(r.label)}</span>
        <span class="card-total">${total}</span>
        ${STATUS_VALUES[r.table] ? `<span class="card-sub">${fresh} new</span>` : `<span class="card-sub">stream</span>`}
      </a>`);
  }
  return htmlResponse(page("Dashboard", `<div class="cards">${cards.join("")}</div>`));
}

async function listView(db, resourceKey, url) {
  const resource = RESOURCES[resourceKey];
  const cols = LIST_COLUMNS[resourceKey];
  let status = url.searchParams.get("status") || undefined;
  if (status && STATUS_VALUES[resource.table] && !STATUS_VALUES[resource.table].includes(status)) {
    status = undefined; // ignore an out-of-vocabulary filter rather than show an empty list
  }
  const cursor = url.searchParams.get("cursor") || undefined;
  const since = url.searchParams.get("since") || undefined;

  const { rows, nextCursor } = await list(db, resource.table, {
    select: [...cols, "id"],
    status,
    cursor,
    since,
    limit: 50,
  });

  const idCol = resource.idCol || "public_id";
  const head = cols.map((c) => `<th>${esc(c)}</th>`).join("");
  const body = rows
    .map((row) => {
      const cells = cols
        .map((c) => {
          let v = row[c];
          if (c === idCol && resource.editable) {
            return `<td><a href="/admin/${resourceKey}/${encodeURIComponent(String(v))}">${esc(short(v))}</a></td>`;
          }
          if (c === "status") return `<td>${statusPill(v)}</td>`;
          return `<td>${esc(short(v))}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const statusFilter = STATUS_VALUES[resource.table]
    ? `<form method="get" class="filterbar">
         <select name="status" onchange="this.form.submit()">
           <option value="">All statuses</option>
           ${STATUS_VALUES[resource.table].map((s) => `<option value="${s}"${s === status ? " selected" : ""}>${s}</option>`).join("")}
         </select>
       </form>`
    : "";

  const nextLink = nextCursor
    ? `<a class="button" href="/admin/${resourceKey}?cursor=${nextCursor}${status ? `&status=${encodeURIComponent(status)}` : ""}">Next →</a>`
    : "";

  const tools = `<div class="toolbar">${statusFilter}<a class="button ghost" href="/admin/${resourceKey}.csv">Export CSV</a></div>`;
  const table = rows.length
    ? `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>${nextLink}`
    : `<p class="empty">No records.</p>`;

  return htmlResponse(page(resource.label, tools + table, resourceKey));
}

async function detailView(db, resourceKey, id) {
  const resource = RESOURCES[resourceKey];
  const row = await getByPublicId(db, resource.table, id);
  if (!row) return htmlResponse(page("Not found", `<p class="empty">Record not found.</p>`, resourceKey), 404);

  const fields = Object.entries(row)
    .filter(([k]) => k !== "id")
    .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join("");

  let actions = "";
  if (resource.editable) {
    const statuses = STATUS_VALUES[resource.table] || [];
    const accessSelect =
      resourceKey === "downloads"
        ? `<label>Access type
             <select name="access_type">
               ${ACCESS_TYPES.map((a) => `<option value="${a}"${a === row.access_type ? " selected" : ""}>${a}</option>`).join("")}
             </select>
           </label>`
        : "";
    actions = `
      <form method="post" class="actions" action="/admin/${resourceKey}/${encodeURIComponent(id)}">
        <input type="hidden" name="action" value="save" />
        <label>Status
          <select name="status">
            ${statuses.map((s) => `<option value="${s}"${s === row.status ? " selected" : ""}>${s}</option>`).join("")}
          </select>
        </label>
        ${accessSelect}
        <label>Internal note
          <textarea name="internal_note" rows="4">${esc(row.internal_note)}</textarea>
        </label>
        <div class="action-buttons">
          <button class="button" type="submit">Save</button>
          <button class="button ghost" type="submit" name="action" value="spam">Mark spam</button>
          <button class="button danger" type="submit" name="action" value="delete"
            onclick="return confirm('Delete this record permanently?')">Delete</button>
        </div>
      </form>`;
  }

  const back = `<p><a href="/admin/${resourceKey}">← ${esc(resource.label)}</a></p>`;
  return htmlResponse(page(`${resource.label} · ${short(id)}`, `${back}<table class="detail">${fields}</table>${actions}`, resourceKey));
}

async function doAction(request, db, resourceKey, id, secure) {
  const resource = RESOURCES[resourceKey];
  if (!resource.editable) return redirect(`/admin/${resourceKey}`);
  const form = await request.formData().catch(() => null);
  const action = form ? form.get("action") : "";

  if (action === "delete") {
    await deleteByPublicId(db, resource.table, id).catch((e) => console.error("admin delete failed", e && e.message));
    return redirect(`/admin/${resourceKey}`);
  }

  const patch = { updated_at: new Date().toISOString() };
  if (action === "spam") {
    patch.status = "spam";
  } else {
    const status = form ? String(form.get("status") || "") : "";
    if (status && (STATUS_VALUES[resource.table] || []).includes(status)) patch.status = status;
    if (form && form.has("internal_note")) patch.internal_note = String(form.get("internal_note") || "");
    if (resourceKey === "downloads" && form && form.has("access_type")) {
      const at = String(form.get("access_type") || "");
      if (ACCESS_TYPES.includes(at)) patch.access_type = at;
    }
  }
  await updateByPublicId(db, resource.table, id, patch).catch((e) => console.error("admin update failed", e && e.message));
  return redirect(`/admin/${resourceKey}/${encodeURIComponent(id)}`);
}

async function exportCsv(db, resourceKey) {
  const resource = RESOURCES[resourceKey];
  if (!resource) return htmlResponse(page("Not found", `<p class="empty">Unknown section.</p>`), 404);
  const { rows } = await list(db, resource.table, { limit: 200 });
  // Drop the internal numeric id from exports; keep everything else.
  const cleaned = rows.map(({ id, ...rest }) => rest);
  const stamp = new Date().toISOString().slice(0, 10);
  return csvResponse(`${resourceKey}-${stamp}.csv`, toCsv(cleaned));
}

/* ------------------------------ presentation ------------------------------ */

function statusPill(v) {
  const s = String(v || "");
  return `<span class="pill pill-${esc(s)}">${esc(s)}</span>`;
}

function short(v) {
  const s = String(v ?? "");
  return s.length > 60 ? `${s.slice(0, 57)}…` : s;
}

function loginPage(env, error) {
  const note = adminConfigured(env)
    ? ""
    : `<p class="empty">Admin is not configured. Set the <code>ADMIN_PASSWORD</code> secret to enable it.</p>`;
  return page(
    "Sign in",
    `<form method="post" action="/admin/login" class="login">
       ${note}
       ${error ? `<p class="error">${esc(error)}</p>` : ""}
       <label>Password<input type="password" name="password" autofocus required /></label>
       <button class="button" type="submit">Sign in</button>
     </form>`,
    null,
    false,
  );
}

function navBar(active) {
  const links = Object.entries(RESOURCES)
    .map(([key, r]) => `<a href="/admin/${key}"${key === active ? ' class="active"' : ""}>${esc(r.label)}</a>`)
    .join("");
  return `<nav class="adminnav">
    <a class="brand" href="/admin">GYUTRON · Admin</a>
    <span class="links">${links}</span>
    <form method="post" action="/admin/logout" class="logout"><button type="submit">Sign out</button></form>
  </nav>`;
}

function page(title, body, active = null, authed = true) {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${esc(title)} · GYUTRON Admin</title>
<style>${STYLE}</style>
</head><body>
${authed ? navBar(active) : ""}
<main class="wrap">
  <h1>${esc(title)}</h1>
  ${body}
</main>
</body></html>`;
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}

function redirect(location, cookie) {
  const headers = { location };
  if (cookie) headers["set-cookie"] = cookie;
  return new Response(null, { status: 303, headers });
}

const STYLE = `
:root{--ink:#17151d;--purple:#4b2e83;--purple-500:#8a63d2;--line:#e6e0ee;--bg:#faf9fc;--muted:#6f687a}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg)}
a{color:var(--purple);text-decoration:none}
a:hover{text-decoration:underline}
.adminnav{display:flex;align-items:center;gap:18px;background:var(--purple);color:#fff;padding:0 20px;height:52px}
.adminnav a{color:#fff}
.adminnav .brand{font-weight:700;letter-spacing:.02em}
.adminnav .links{display:flex;gap:14px;flex:1}
.adminnav .links a.active{text-decoration:underline}
.adminnav .logout button{background:transparent;border:1px solid rgba(255,255,255,.5);color:#fff;padding:6px 12px;cursor:pointer}
.wrap{max-width:1080px;margin:0 auto;padding:24px 20px 64px}
h1{font-size:22px;margin:8px 0 18px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}
.card{display:flex;flex-direction:column;gap:4px;border:1px solid var(--line);background:#fff;padding:18px}
.card-label{color:var(--muted);font-size:13px;text-transform:uppercase;letter-spacing:.04em}
.card-total{font-size:32px;font-weight:700}
.card-sub{color:var(--purple-500);font-size:13px}
.toolbar,.filterbar{display:flex;gap:10px;align-items:center;margin-bottom:14px}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);font-size:14px}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
thead th{background:#f3eefb;font-size:12px;text-transform:uppercase;letter-spacing:.03em;color:var(--muted)}
table.detail th{width:200px;color:var(--muted);font-weight:600}
.button{display:inline-block;background:var(--purple);color:#fff;border:0;padding:9px 16px;cursor:pointer;font-size:14px}
.button:hover{text-decoration:none;background:#3c2569}
.button.ghost{background:#fff;color:var(--purple);border:1px solid var(--purple)}
.button.danger{background:#b3261e}
select,input,textarea{font:inherit;padding:8px;border:1px solid var(--line);background:#fff;width:100%}
.actions{margin-top:20px;display:flex;flex-direction:column;gap:12px;max-width:560px}
.action-buttons{display:flex;gap:10px}
.actions label{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--muted)}
.login{max-width:320px;display:flex;flex-direction:column;gap:12px}
.login label{display:flex;flex-direction:column;gap:6px}
.empty{color:var(--muted)}
.error{color:#b3261e}
.pill{display:inline-block;padding:2px 8px;font-size:12px;border:1px solid var(--line);background:#f3eefb}
.pill-new{background:#e7f0ff;border-color:#bcd4ff}
.pill-spam{background:#fde7e7;border-color:#f3b4b4}
.pill-closed,.pill-lost,.pill-rejected{background:#eee;color:var(--muted)}
.pill-won,.pill-fulfilled,.pill-replied,.pill-quoted{background:#e7f7ee;border-color:#b4e3c6}
code{background:#f3eefb;padding:1px 5px}
`;
