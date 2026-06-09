/* GYUTRON support chat widget — client-side FAQ assistant (no backend).
 * Reads the locale FAQ embedded by components/ChatWidget.astro, answers inline,
 * and hands off to Contact Sales. Progressive enhancement: the launcher + panel
 * markup are server-rendered; this only wires interaction. */
(function () {
  var root = document.querySelector('[data-cw]');
  if (!root) return;
  var panel = root.querySelector('[data-cw-panel]');
  var openBtn = root.querySelector('[data-cw-open]');
  var closeBtn = root.querySelector('[data-cw-close]');
  var thread = root.querySelector('[data-cw-thread]');
  var scroll = root.querySelector('[data-cw-scroll]');
  var search = root.querySelector('[data-cw-search]');
  var dataEl = root.querySelector('[data-cw-faq]');
  if (!panel || !openBtn || !thread || !dataEl) return;

  var FAQ = { cats: [], items: [] };
  try { FAQ = JSON.parse(dataEl.textContent || '{}'); } catch (e) { return; }
  var catTitle = {};
  (FAQ.cats || []).forEach(function (c) { catTitle[c.id] = c.title; });

  var L = {
    pick: root.getAttribute('data-l-pick') || 'Pick a question:',
    results: root.getAttribute('data-l-results') || 'Matching answers:',
    none: root.getAttribute('data-l-none') || 'No matching answer.'
  };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function scrollDown() { if (scroll) scroll.scrollTop = scroll.scrollHeight; }

  function open() {
    panel.hidden = false;
    /* next frame so the transition runs */
    window.requestAnimationFrame(function () { root.classList.add('is-open'); root.classList.add('is-seen'); });
    setTimeout(function () { try { search.focus(); } catch (e) {} }, 160);
  }
  function close() {
    root.classList.remove('is-open');
    setTimeout(function () { panel.hidden = true; }, 240);
  }
  openBtn.addEventListener('click', function () {
    root.classList.contains('is-open') ? close() : open();
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('is-open')) close();
  });

  function addUser(text) {
    thread.appendChild(el('div', 'cw-msg cw-user', esc(text)));
    scrollDown();
  }
  function questionList(items) {
    var list = el('div', 'cw-qlist');
    items.forEach(function (it) {
      var b = el('button', 'cw-q', esc(it.q));
      b.type = 'button';
      b.setAttribute('data-q', it.id);
      list.appendChild(b);
    });
    return list;
  }

  function showCategory(catId) {
    addUser(catTitle[catId] || catId);
    var items = (FAQ.items || []).filter(function (it) { return it.cat === catId; });
    var wrap = el('div', 'cw-msg cw-bot');
    wrap.appendChild(el('p', 'cw-list-intro', esc(L.pick)));
    wrap.appendChild(questionList(items));
    thread.appendChild(wrap);
    scrollDown();
  }

  function showAnswer(id) {
    var it = (FAQ.items || []).filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    addUser(it.q);
    thread.appendChild(el('div', 'cw-msg cw-bot', it.a)); /* answer is our own trusted HTML */
    scrollDown();
  }

  function highlight(q, term) {
    var i = q.toLowerCase().indexOf(term);
    if (i < 0) return esc(q);
    return esc(q.slice(0, i)) + '<mark>' + esc(q.slice(i, i + term.length)) + '</mark>' + esc(q.slice(i + term.length));
  }

  function showSearch(raw) {
    var prev = thread.querySelector('[data-cw-results]');
    if (prev) prev.parentNode.removeChild(prev);
    var term = (raw || '').trim().toLowerCase();
    if (!term) return;
    var matches = (FAQ.items || []).filter(function (it) {
      return (it.q + ' ' + it.a).toLowerCase().indexOf(term) >= 0;
    }).slice(0, 8);
    var wrap = el('div', 'cw-msg cw-bot');
    wrap.setAttribute('data-cw-results', '');
    if (!matches.length) {
      wrap.appendChild(el('p', 'cw-list-intro', esc(L.none)));
    } else {
      wrap.appendChild(el('p', 'cw-list-intro', esc(L.results)));
      var list = el('div', 'cw-qlist');
      matches.forEach(function (it) {
        var b = el('button', 'cw-q', highlight(it.q, term));
        b.type = 'button';
        b.setAttribute('data-q', it.id);
        list.appendChild(b);
      });
      wrap.appendChild(list);
    }
    thread.appendChild(wrap);
    scrollDown();
  }

  /* event delegation: category chips + question buttons */
  root.addEventListener('click', function (e) {
    var cat = e.target.closest('[data-cw-cat]');
    if (cat) { showCategory(cat.getAttribute('data-cw-cat')); return; }
    var q = e.target.closest('[data-q]');
    if (q) { showAnswer(q.getAttribute('data-q')); }
  });

  if (search) {
    var t = null;
    search.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { showSearch(search.value); }, 180);
    });
  }
})();

/* ---- Overlay scroll containment ----------------------------------------
 * When a flyout overlay is OPEN (mega-menu / nav search / this chat panel), a
 * wheel over it must scroll only that overlay, never the page body. CSS
 * overscroll-behavior covers the at-boundary case; this also covers the
 * not-scrollable and hover-over-a-non-scroller-part cases. Inert when closed. */
(function () {
  function trap(zone, getScroller, isOpen) {
    zone.addEventListener('wheel', function (e) {
      if (isOpen && !isOpen()) return;                 // overlay closed -> normal page scroll
      var s = getScroller();
      if (!s) { e.preventDefault(); return; }
      if (s.scrollHeight <= s.clientHeight + 1) { e.preventDefault(); return; } // nothing to scroll
      var up = e.deltaY < 0;
      var atTop = s.scrollTop <= 0;
      var atBottom = s.scrollTop + s.clientHeight >= s.scrollHeight - 1;
      if (s === e.target || s.contains(e.target)) {
        if ((up && atTop) || (!up && atBottom)) e.preventDefault();    // block chaining at the edge
      } else {
        s.scrollTop += e.deltaY; e.preventDefault();                   // over a non-scroller part: drive it
      }
    }, { passive: false });
  }

  var cwRoot = document.querySelector('[data-cw]');
  var cwPanel = cwRoot && cwRoot.querySelector('[data-cw-panel]');
  if (cwPanel) trap(cwPanel,
    function () { return cwPanel.querySelector('[data-cw-scroll]'); },
    function () { return cwRoot.classList.contains('is-open'); });

  var dd = document.querySelector('.nav-search-dropdown');
  if (dd) trap(dd,
    function () { return dd.querySelector('.nav-search-results'); },
    function () { return !dd.hasAttribute('hidden'); });

  Array.prototype.forEach.call(document.querySelectorAll('.mega-menu'), function (menu) {
    trap(menu,
      function () { return menu.querySelector('.mega-links'); },
      function () { var ni = menu.closest('.nav-item'); return !!(ni && ni.classList.contains('is-open')); });
  });
})();
