// Static site search for the main nav. Fetches /search-index.json (per locale) once, ranks client-side.
// Exposes window.GyutronSearch = { getIndex, rank } so the mobile drawer can reuse the same logic.
(() => {
  "use strict";
  const cache = {};
  const indexUrl = (locale) => (locale === "en" ? "/search-index.json" : "/" + locale + "/search-index.json");

  async function getIndex(locale) {
    if (cache[locale]) return cache[locale];
    try {
      const res = await fetch(indexUrl(locale), { credentials: "same-origin" });
      const data = await res.json();
      cache[locale] = Array.isArray(data) ? data : [];
    } catch (e) {
      cache[locale] = [];
    }
    return cache[locale];
  }

  const norm = (s) => (s || "").toString().toLowerCase();

  function rank(records, query, limit) {
    const q = norm(query).trim();
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    const out = [];
    for (const r of records) {
      const title = norm(r.t), kind = norm(r.k), desc = norm(r.d);
      const hay = title + " " + kind + " " + desc;
      let score = 0, ok = true;
      for (const term of terms) {
        if (hay.indexOf(term) === -1) { ok = false; break; }
        if (title.indexOf(term) === 0) score += 8;
        else if (title.indexOf(term) !== -1) score += 5;
        else if (kind.indexOf(term) !== -1) score += 2;
        else score += 1;
      }
      if (ok) out.push({ r, score });
    }
    out.sort((a, b) => b.score - a.score || a.r.t.length - b.r.t.length);
    return out.slice(0, limit || 8).map((s) => s.r);
  }

  const escapeHtml = (s) => (s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function hitHtml(r) {
    return (
      '<a class="nav-search-hit" role="option" href="' + escapeHtml(r.u) + '">' +
      '<span class="nav-search-hit-title">' + escapeHtml(r.t) + "</span>" +
      '<span class="nav-search-hit-kind">' + escapeHtml(r.k) + "</span>" +
      "</a>"
    );
  }

  window.GyutronSearch = { getIndex, rank, hitHtml, escapeHtml };

  // ---- Desktop nav search (icon in header → full-width dropdown below the header) ----
  const root = document.querySelector(".nav-search");
  if (!root) return;
  const locale = root.getAttribute("data-locale") || "en";
  const noresults = root.getAttribute("data-noresults") || "No results for";
  const toggle = root.querySelector(".nav-search-toggle");
  const dropdown = root.querySelector(".nav-search-dropdown");
  const input = root.querySelector(".nav-search-input");
  const results = root.querySelector(".nav-search-results");
  const closeBtn = root.querySelector(".nav-search-close");
  let activeIdx = -1, currentHits = [];

  function positionDropdown() {
    const header = document.querySelector(".site-header") || document.querySelector("header");
    const bottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 64;
    dropdown.style.top = bottom + "px";
  }

  function open() {
    if (!dropdown.hidden) return;
    positionDropdown();
    dropdown.hidden = false;
    root.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    getIndex(locale);
    window.requestAnimationFrame(() => input.focus());
  }
  function close() {
    if (dropdown.hidden) return;
    dropdown.hidden = true;
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    activeIdx = -1;
  }

  function render(hits, q) {
    currentHits = hits; activeIdx = -1;
    if (!q.trim()) { results.innerHTML = ""; results.classList.remove("has-content"); return; }
    results.classList.add("has-content");
    if (!hits.length) {
      results.innerHTML = '<div class="nav-search-empty">' + escapeHtml(noresults) + ' “' + escapeHtml(q.trim()) + '”</div>';
      return;
    }
    results.innerHTML = hits.map(hitHtml).join("");
  }

  async function onInput() {
    const q = input.value;
    const idx = await getIndex(locale);
    render(rank(idx, q), q);
  }

  function move(delta) {
    const els = results.querySelectorAll(".nav-search-hit");
    if (!els.length) return;
    activeIdx = (activeIdx + delta + els.length) % els.length;
    els.forEach((el, i) => el.classList.toggle("is-active", i === activeIdx));
    els[activeIdx].scrollIntoView({ block: "nearest" });
  }

  toggle.addEventListener("click", () => (dropdown.hidden ? open() : close()));
  if (closeBtn) closeBtn.addEventListener("click", () => { close(); toggle.focus(); });
  input.addEventListener("input", onInput);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") {
      const els = results.querySelectorAll(".nav-search-hit");
      if (activeIdx >= 0 && els[activeIdx]) window.location.href = els[activeIdx].getAttribute("href");
      else if (currentHits[0]) window.location.href = currentHits[0].u;
    } else if (e.key === "Escape") { close(); toggle.focus(); }
  });

  document.addEventListener("click", (e) => { if (!dropdown.hidden && !root.contains(e.target)) close(); });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); dropdown.hidden ? open() : close(); }
  });
  window.addEventListener("resize", () => { if (!dropdown.hidden) positionDropdown(); }, { passive: true });
  window.addEventListener("scroll", () => { if (!dropdown.hidden) positionDropdown(); }, { passive: true });
})();
