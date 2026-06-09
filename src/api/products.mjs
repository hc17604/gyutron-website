/**
 * Product catalog Data API (read-only).
 *
 *   GET /api/v1/products            ?locale=en|de|ja  &category=<slug>
 *   GET /api/v1/products/:id        (:id = slugified model, e.g. gy-a60-max)
 *   GET /api/v1/categories          ?locale=en|de|ja
 *
 * Phase 1 reads the existing file-based catalog (astro/src/data/products.*.js) and
 * normalizes it to a customer-agnostic shape with fields reserved for a later move
 * to D1/PIM (datasheet_url, shop_sku, shop_url, status). The website itself is
 * unaffected — this is an additional read view over the same data.
 */
import { apiData, apiError } from "../platform/response.mjs";

const LOCALES = ["en", "de", "ja"];

async function loadCatalog(locale) {
  switch (locale) {
    case "de":
      return import("../../astro/src/data/products.de.js");
    case "ja":
      return import("../../astro/src/data/products.ja.js");
    default:
      return import("../../astro/src/data/products.en.js");
  }
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProduct(categorySlug, category, p) {
  return {
    id: slugify(p.name),
    model: p.name,
    category: categorySlug,
    category_title: category.title || null,
    title: p.type || null,
    short_description: p.summary || null,
    kind: p.kind || null,
    specs: p.specs || {},
    tags: Array.isArray(p.tags) ? p.tags : [],
    image: p.image || null,
    // Reserved for Phase 2 (datasheet R2 + storefront link-up). Null today.
    datasheet_url: null,
    manual_url: null,
    shop_sku: null,
    shop_url: null,
    status: "active",
  };
}

function normalizeCategory(slug, category) {
  return {
    id: slug,
    title: category.title || null,
    eyebrow: category.eyebrow || null,
    nav_label: category.navLabel || null,
    intro: category.intro || null,
    hero_image: category.heroImage || null,
    product_count: Array.isArray(category.products) ? category.products.length : 0,
    redirect_to: category.redirectTo || null,
  };
}

function allProducts(catalog) {
  const out = [];
  for (const [slug, category] of Object.entries(catalog)) {
    // Skip legacy alias categories (those with `redirectTo`): they re-list products
    // that also appear under their canonical category, which would otherwise produce
    // duplicate ids and make /products/:id resolve to the stale alias slug.
    if (category.redirectTo) continue;
    if (Array.isArray(category.products)) {
      for (const p of category.products) out.push(normalizeProduct(slug, category, p));
    }
  }
  return out;
}

export async function handleProductsApi(request, env, url, path) {
  const localeParam = (url.searchParams.get("locale") || "en").toLowerCase();
  const locale = LOCALES.includes(localeParam) ? localeParam : "en";

  let mod;
  try {
    mod = await loadCatalog(locale);
  } catch (e) {
    console.error("catalog load failed:", e && e.message);
    return apiError(env, "internal_error", "Could not load the product catalog.", 500);
  }
  const catalog = mod.GYUTRON_PRODUCTS || {};

  if (path === "/categories") {
    const data = Object.entries(catalog).map(([slug, cat]) => normalizeCategory(slug, cat));
    return apiData(env, data, { limit: data.length, next_cursor: null });
  }

  // Single product: /products/:id
  if (path.startsWith("/products/")) {
    const id = decodeURIComponent(path.slice("/products/".length)).replace(/\/+$/, "");
    const product = allProducts(catalog).find((p) => p.id === id);
    if (!product) return apiError(env, "not_found", `Unknown product: ${id}`, 404);
    return apiData(env, product, null);
  }

  // Collection: /products  (optional ?category= filter)
  const categoryFilter = url.searchParams.get("category");
  let data = allProducts(catalog);
  if (categoryFilter) data = data.filter((p) => p.category === categoryFilter);
  return apiData(env, data, { limit: data.length, next_cursor: null });
}
