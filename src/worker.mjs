import { handleContactRequest } from "./contact-handler.mjs";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContactRequest(request, env, ctx);
    }

    if (url.hostname === "shop.gyutron.com") {
      const rootAssetPrefixes = [
        "/product-images/",
        "/favicon",
        "/apple-touch-icon",
        "/gyutron-logo",
        "/hero-industrial-automation.png",
        "/product-hero-",
      ];
      const isRootAsset = rootAssetPrefixes.some((prefix) => url.pathname.startsWith(prefix));

      if (!isRootAsset) {
        if (url.pathname === "/") {
          url.pathname = "/shop/index.html";
        } else if (!url.pathname.startsWith("/shop/")) {
          url.pathname = `/shop${url.pathname}`;
        }

        if (!url.pathname.includes(".") && !url.pathname.endsWith("/")) {
          url.pathname = `${url.pathname}.html`;
        }
      }

      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  },
};
