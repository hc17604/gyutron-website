import { handleContactRequest } from "./contact-handler.mjs";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContactRequest(request, env, ctx);
    }

    if (url.hostname === "shop.gyutron.com") {
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

      return env.ASSETS.fetch(new Request(assetUrl, request));
    }

    return env.ASSETS.fetch(request);
  },
};
