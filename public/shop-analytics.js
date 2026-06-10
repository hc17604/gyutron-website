/* GYUTRON shop behavior beacon — STRICTLY minimal (privacy by design):
   product views + cart additions only. No cookies, no session, no IP, no
   fingerprinting, no personal data. Injected by the Worker on shop pages. */
(function () {
  "use strict";
  function send(event, handle) {
    try {
      var locale = location.pathname.indexOf("/de/") === 0 ? "de" : location.pathname.indexOf("/ja/") === 0 ? "ja" : "en";
      var body = JSON.stringify({ event: event, product_handle: handle || null, locale: locale });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/shop-event", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/shop-event", { method: "POST", headers: { "content-type": "application/json" }, body: body, keepalive: true });
      }
    } catch (e) { /* analytics must never break the shop */ }
  }

  // product.viewed — product detail pages use product(.html)?sku=<SKU>
  try {
    var sku = new URLSearchParams(location.search).get("sku");
    if (sku && /product/.test(location.pathname)) send("product.viewed", sku);
  } catch (e) { /* noop */ }

  // cart.added — the shop cart lives in localStorage; wrap setItem and diff the
  // cart array (no shop.js changes needed; runs before shop.js via injected order).
  try {
    var origSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      try {
        if (/cart/i.test(String(key))) {
          var before = [];
          try { before = JSON.parse(this.getItem(key)) || []; } catch (e) { before = []; }
          var after = [];
          try { after = JSON.parse(value) || []; } catch (e) { after = []; }
          if (Array.isArray(after) && Array.isArray(before) && after.length > before.length) {
            var added = after[after.length - 1] || {};
            send("cart.added", added.sku || null);
          }
        }
      } catch (e) { /* noop */ }
      return origSet.apply(this, arguments);
    };
  } catch (e) { /* noop */ }
})();
