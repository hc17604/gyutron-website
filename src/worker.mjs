import { handleContactRequest } from "./contact-handler.mjs";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContactRequest(request, env, ctx);
    }

    if (url.hostname === "shop.gyutron.com") {
      const assetUrl = new URL(request.url);
      assetUrl.hostname = "gyutron-website.muddy-disk-1397.workers.dev";
      assetUrl.protocol = "https:";

      if (url.pathname === "/") {
        assetUrl.pathname = "/shop/index.html";
      } else if (!url.pathname.startsWith("/shop/")) {
        assetUrl.pathname = `/shop${url.pathname}`;
      }

      if (!assetUrl.pathname.includes(".") && !assetUrl.pathname.endsWith("/")) {
        assetUrl.pathname = `${assetUrl.pathname}.html`;
      }

      return fetch(new Request(assetUrl, request));
    }

    return env.ASSETS.fetch(request);
  },
};
