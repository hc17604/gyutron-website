import { handleContactRequest } from "./contact-handler.mjs";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContactRequest(request, env, ctx);
    }

    if (url.hostname === "shop.gyutron.com") {
      const assetUrl = new URL(request.url);
      const lastPathSegment = url.pathname.split("/").pop() || "";
      const hasFileExtension = /\.[a-z0-9]+$/i.test(lastPathSegment);

      if (url.pathname === "/") {
        assetUrl.pathname = "/shop/";
      } else if (hasFileExtension && !url.pathname.endsWith(".html") && !url.pathname.startsWith("/shop/")) {
        return env.ASSETS.fetch(request);
      } else if (!url.pathname.startsWith("/shop/")) {
        assetUrl.pathname = `/shop${url.pathname}`;
      }

      if (assetUrl.pathname.endsWith(".html")) {
        assetUrl.pathname = assetUrl.pathname.slice(0, -5);
      }

      return env.ASSETS.fetch(new Request(assetUrl, request));
    }

    return env.ASSETS.fetch(request);
  },
};
