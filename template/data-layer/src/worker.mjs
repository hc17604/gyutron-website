/**
 * Customer Data Layer — deployable template worker (forms + Data API + admin).
 *
 * A THIN entry over the shared, customer-agnostic core (`src/platform`,
 * `src/api`) — the core stays single-sourced in this repo; a customer
 * deployment is just THIS worker + its own wrangler.toml (identity via vars,
 * own D1/secrets). No static assets, no storefront, no product catalog —
 * those are site-specific concerns this template deliberately excludes.
 *
 * Routes: POST /api/{contact,rfq,support,download-request}
 *         GET  /api/v1/{health,metadata,leads,rfqs,support-requests,download-requests,events}
 *         /admin/*
 */
import { handleContactRequest } from "../../../src/contact-handler.mjs";
import { handleFormRequest } from "../../../src/api/forms.mjs";
import { handleAdmin } from "../../../src/api/admin.mjs";
import { handleDataApi } from "./data-api.mjs";
import { json } from "../../../src/platform/response.mjs";
import { dataSource } from "../../../src/platform/config.mjs";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/api/contact") return handleContactRequest(request, env, ctx);
    if (pathname === "/api/rfq") return handleFormRequest("rfq", request, env, ctx);
    if (pathname === "/api/support") return handleFormRequest("support", request, env, ctx);
    if (pathname === "/api/download-request") return handleFormRequest("download", request, env, ctx);

    if (pathname === "/api/v1" || pathname.startsWith("/api/v1/")) {
      return handleDataApi(request, env, ctx, url);
    }

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      return handleAdmin(request, env, ctx, url);
    }

    // No static site behind this worker — identify ourselves instead of 404ing blindly.
    return json(
      { service: "data-layer", source: dataSource(env).id, endpoints: ["/api/v1/health", "/api/contact", "/api/rfq", "/api/support", "/api/download-request", "/admin"] },
      pathname === "/" ? 200 : 404,
    );
  },
};
