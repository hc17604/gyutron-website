import { handleContactRequest } from "./contact-handler.mjs";
import { handleFormRequest } from "./api/forms.mjs";
import { handleDataApi } from "./api/data.mjs";
import { handleAdmin } from "./api/admin.mjs";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const isShopHost = url.hostname === "shop.gyutron.com";

    // Shop behavior beacon — available on BOTH hosts (the shop posts same-origin).
    if (pathname === "/api/shop-event") {
      const { handleShopEvent } = await import("./api/shop-events.mjs");
      return handleShopEvent(request, env);
    }

    // Backend routes apply on the brand host only; the storefront host is
    // handled entirely by the shop block below.
    if (!isShopHost) {
      // ---- Form submission API ----
      if (pathname === "/api/contact") return handleContactRequest(request, env, ctx);
      if (pathname === "/api/rfq") return handleFormRequest("rfq", request, env, ctx);
      if (pathname === "/api/support") return handleFormRequest("support", request, env, ctx);
      if (pathname === "/api/download-request") return handleFormRequest("download", request, env, ctx);

      // ---- Resource center file delivery (manifest + R2; see src/api/downloads.mjs) ----
      if (pathname.startsWith("/api/download/")) {
        const { handleDownload } = await import("./api/downloads.mjs");
        return handleDownload(request, env, ctx, url);
      }

      // ---- Read-only Data API (consumed by the Agent Workspace) ----
      if (pathname === "/api/v1" || pathname.startsWith("/api/v1/")) {
        return handleDataApi(request, env, ctx, url);
      }

      // ---- Internal admin (single-admin, password-gated) ----
      if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        return handleAdmin(request, env, ctx, url);
      }
    }

    // ---- Localized storefront on shop.gyutron.com (UNCHANGED) ----
    if (isShopHost) {
      const assetUrl = new URL(request.url);

      // Localized store: a leading /de or /ja maps to that locale's store
      // directory (/de/shop/..., /ja/shop/...). English stays at /shop/...
      const localeMatch = url.pathname.match(/^\/(de|ja)(?=\/|$)/);
      const localePrefix = localeMatch ? localeMatch[0] : "";
      let path = localePrefix ? url.pathname.slice(localePrefix.length) || "/" : url.pathname;
      const shopRoot = `${localePrefix}/shop`;

      const lastPathSegment = path.split("/").pop() || "";
      const hasFileExtension = /\.[a-z0-9]+$/i.test(lastPathSegment);

      if (path === "/" || path === "") {
        assetUrl.pathname = `${shopRoot}/`;
      } else if (hasFileExtension && !path.endsWith(".html") && !path.startsWith("/shop/")) {
        return env.ASSETS.fetch(request);
      } else if (path.startsWith("/shop/")) {
        assetUrl.pathname = `${localePrefix}${path}`;
      } else {
        assetUrl.pathname = `${shopRoot}${path}`;
      }

      if (assetUrl.pathname.endsWith(".html")) {
        assetUrl.pathname = assetUrl.pathname.slice(0, -5);
      }

      // Inject the minimal behavior beacon into shop HTML (zero edits to the
      // generated shop files; analytics lives in /shop-analytics.js).
      const shopResponse = await env.ASSETS.fetch(new Request(assetUrl, request));
      const contentType = shopResponse.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        return new HTMLRewriter()
          .on("head", {
            element(el) {
              el.append('<script src="/shop-analytics.js"></script>', { html: true });
            },
          })
          .transform(shopResponse);
      }
      return shopResponse;
    }

    return env.ASSETS.fetch(request);
  },

  // Daily D1 → R2 backup (see src/api/backup.mjs; [triggers] in wrangler.toml).
  async scheduled(event, env, ctx) {
    const { runBackup } = await import("./api/backup.mjs");
    ctx.waitUntil(runBackup(env));
  },
};
