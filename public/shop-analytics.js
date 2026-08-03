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

  /* ----- shop lead forms takeover (request-quote / contact-engineer) -------
     The generated shop forms are demo stubs (shop.js shows "saved locally" and
     drops the lead). We take over in the CAPTURE phase (fires before shop.js's
     own handler) and submit to the real worker form APIs — same validation,
     honeypot, Turnstile and D1 pipeline as the brand-site forms. */
  var SITE_KEY = "0x4AAAAAADh5yZZyBs-zTw3Y"; // public Turnstile site key (this deployment)
  var PAGE = location.pathname;
  var IS_QUOTE = /request-quote/.test(PAGE);
  var IS_ENGINEER = /contact-engineer/.test(PAGE);

  function fieldValue(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function note(form, text, ok) {
    var box = form.querySelector(".gy-lead-status");
    if (!box) {
      box = document.createElement("div");
      box.className = "gy-lead-status";
      box.setAttribute("role", "status");
      box.style.cssText = "margin-top:12px;padding:10px 14px;font-size:14px;border:1px solid;";
      form.appendChild(box);
    }
    box.style.borderColor = ok ? "#2e7d32" : "#b3261e";
    box.style.color = ok ? "#2e7d32" : "#b3261e";
    box.textContent = text;
  }

  function mountTurnstile(form) {
    if (!SITE_KEY || form.querySelector(".cf-turnstile")) return;
    var holder = document.createElement("div");
    holder.className = "cf-turnstile";
    holder.setAttribute("data-sitekey", SITE_KEY);
    var submitBtn = form.querySelector('button[type="submit"], .button');
    form.insertBefore(holder, submitBtn || null);
    if (!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
      var s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true; s.defer = true;
      document.head.appendChild(s);
    }
  }

  function takeover(form) {
    var locale = location.pathname.indexOf("/de/") === 0 ? "de" : location.pathname.indexOf("/ja/") === 0 ? "ja" : "en";
    var sku = fieldValue(form, "sku");
    var email = fieldValue(form, "email");
    var company = fieldValue(form, "company");
    var token = (form.querySelector('[name="cf-turnstile-response"]') || {}).value || "";
    var endpoint, payload;
    if (IS_QUOTE) {
      var text = fieldValue(form, "requirements") || fieldValue(form, "description");
      endpoint = "/api/rfq";
      payload = {
        name: company || email, company: company, email: email,
        country: fieldValue(form, "country"),
        productModel: sku, quantity: fieldValue(form, "quantity"),
        timeline: fieldValue(form, "timeline"),
        applicationDescription: "Shop quote request" + (sku ? " for " + sku : "") + (text ? ": " + text : "."),
        sourcePage: PAGE, locale: locale, "cf-turnstile-response": token, website: ""
      };
    } else {
      var q = fieldValue(form, "question") || fieldValue(form, "application") || fieldValue(form, "description");
      endpoint = "/api/support";
      payload = {
        name: company || email, company: company, email: email,
        productModel: sku, issueType: "integration",
        message: "Shop engineer inquiry" + (sku ? " for " + sku : "") + (q ? ": " + q : "."),
        sourcePage: PAGE, locale: locale, "cf-turnstile-response": token, website: ""
      };
    }
    fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (body) {
        if (body && body.ok) {
          send("quote.requested", sku || null);
          note(form, (body.message || "Request received.") + (body.id ? " (" + body.id + ")" : ""), true);
          form.reset();
        } else {
          note(form, (body && body.message) || "Could not send right now — please email info@gyutron.com.", false);
        }
        if (window.turnstile && window.turnstile.reset) window.turnstile.reset();
      })
      .catch(function () { note(form, "Network error — please email info@gyutron.com.", false); });
  }

  if (IS_QUOTE || IS_ENGINEER) {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll("form[data-demo-form]").forEach(mountTurnstile);
    });
    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (!form || !form.matches || !form.matches("form[data-demo-form]") || form.classList.contains("account-card")) return;
      event.preventDefault();
      event.stopImmediatePropagation(); // block shop.js's "saved locally" stub
      takeover(form);
    }, true);
  }
})();
