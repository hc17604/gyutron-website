import { mkdir, readFile, writeFile } from "node:fs/promises";
import { GYUTRON_PRODUCTS } from "../astro/src/data/products.en.js";

const OUT_DIR = new URL("../docs/", import.meta.url);
const JSON_OUT = new URL("./product-image-library.json", OUT_DIR);
const MD_OUT = new URL("./product-image-library.md", OUT_DIR);
const STATUS_IN = new URL("./product-image-status.json", OUT_DIR);

const BRAND = {
  deviceAccentPurple: "#4b2e83",
  uiAccentPurple: "#8a63d2",
  finish: "matte black / graphite industrial hardware with restrained #4b2e83 physical accents",
  background: "final production assets must be transparent PNGs; chroma-key sources are intermediate only"
};

const CATEGORY_VISUALS = {
  "android-pda": {
    family: "rugged-mobile-computers",
    direction: "locked PDA family XYZ direction-angle template: keep the same product/camera X/Y/Z rotation angles across SKUs; do not flip, randomly rotate, or change lean/camera-side angle",
    designNotes: "Zebra-style rugged handheld proportions, rubberized bumpers, recessed screen, optional keypad/scan handle variants; front-face ratio, side thickness, scanner shape, and baseline may vary by model, but the 3D orientation angle must stay consistent"
  },
  "rfid-handhelds": {
    family: "rfid-handheld-readers",
    direction: "locked handheld RFID XYZ direction-angle template: keep the same product/camera X/Y/Z rotation angles across SKUs; antenna/handle geometry may vary",
    designNotes: "long-range UHF handheld reader silhouette with balanced trigger grip and circular/flat antenna module; do not flip orientation or change 3D camera angle between models"
  },
  "barcode-scanners": {
    family: "barcode-scanners",
    direction: "locked barcode-scanner XYZ direction-angle template: keep the same product/camera X/Y/Z rotation angles across handheld scanner SKUs",
    designNotes: "ultra-rugged handheld scanner and fixed/hands-free scanner variants; avoid consumer retail toy-like forms; do not flip orientation or change 3D camera angle between models"
  },
  "request-specification": {
    family: "configuration-kits",
    direction: "organized kit composition, 3/4 product view with accessories grouped cleanly",
    designNotes: "sample/procurement kit visual with PDA/scanner, dock, charger, and optional RFID/DPM accessories"
  },
  "proximity-sensors": {
    family: "presence-and-safety-sensors",
    direction: "3/4 technical product view, connector and sensing face visible",
    designNotes: "SICK/Omron-style compact sensor housings, M12 connectors, aluminum or stainless bodies, safety curtains as paired bars"
  },
  "laser-measurement": {
    family: "distance-position-sensors",
    direction: "3/4 front view, laser aperture or ultrasonic face visible",
    designNotes: "compact laser displacement and ultrasonic blocks with industrial mounting points and cable/connector detail"
  },
  "environmental-sensing": {
    family: "process-condition-modules",
    direction: "3/4 front view, display/ports visible where applicable",
    designNotes: "digital pressure sensors, condition modules, and IP67 network hubs with readable industrial form logic"
  },
  "area-scan-cameras": {
    family: "industrial-vision-cameras",
    direction: "3/4 front view, lens mount/sensor face visible, landscape camera body",
    designNotes: "Cognex/Basler/Keyence-inspired machine vision cameras: metal cube bodies, C-mount lenses, heat fins, trigger/I/O ports"
  },
  "smart-vision-sensors": {
    family: "vision-controllers-3d-systems",
    direction: "3/4 front view, optical window or controller ports visible",
    designNotes: "smart cameras, 3D profile modules, edge controllers, frame grabbers, and I/O modules with consistent black industrial casing"
  },
  "code-reading-cameras": {
    family: "fixed-code-readers-verifiers",
    direction: "3/4 front view, lens/light window visible; conveyor modules can be wider",
    designNotes: "Cognex/Zebra fixed reader cues: front optics, integrated illumination, rugged metal housings, clear mounting geometry"
  },
  "vision-lighting": {
    family: "vision-lighting",
    direction: "front 3/4 view, illuminated face geometry obvious",
    designNotes: "ring lights, bar lights, dome lights, backlights, and line lights with finned aluminum housings"
  },
  "dimensional-gauges": {
    family: "dimensional-metrology",
    direction: "3/4 benchtop/instrument view, measurement stage/probe/display visible",
    designNotes: "metrology-grade gauges and vision measuring instruments; stable bases, precision stages, measurement probes"
  },
  "surface-inspection": {
    family: "surface-test-instruments",
    direction: "3/4 handheld or bench view, sensor aperture/display visible",
    designNotes: "finish testers, gloss meters, and coating gauges with practical handheld industrial proportions"
  },
  "portable-testers": {
    family: "portable-industrial-testers",
    direction: "3/4 front view, display and controls visible",
    designNotes: "electrical/loop/thermal testers with rugged handheld instrument bodies and restrained button layouts"
  },
  "calibration-tools": {
    family: "calibration-reference-tools",
    direction: "organized 3/4 product view, reference surface/pattern/case visible",
    designNotes: "calibration targets, gauge blocks, and light-reference kits; clean precision accessory styling"
  },
  "robot-workcells": {
    family: "secondary-robot-workcells",
    direction: "locked robot-workcell XYZ direction-angle template: front-left 3/4 technical product view with a slightly downward camera; do not flip, mirror, or change side-angle between cell SKUs",
    designNotes: "plausible cobot/robot workcell platforms with conveyors, fixtures, inspection cameras, safety scanners, controller modules, and practical cable routing; each SKU must be a dedicated scene/product asset, never a crop from a shared matrix"
  },
  "edge-controllers": {
    family: "secondary-edge-controllers",
    direction: "locked edge-controller XYZ direction-angle template: front-left 3/4 technical product view with front I/O face and right-side heat fins/depth visible; do not flip, mirror, or change side-angle between controller SKUs",
    designNotes: "fanless DIN-rail/panel industrial controllers and gateways with realistic ports, terminal blocks, heat fins, mounting ears, and cabinet-ready form language; avoid consumer mini-PC/router shapes"
  },
  "accessories": {
    family: "secondary-accessories",
    direction: "organized front-left 3/4 catalog arrangement with a slight top-down camera; keep the same general XYZ direction and avoid mirrored kit layouts",
    designNotes: "industrial deployment accessories such as M12 cables, mounting hardware, 24 V power modules, optics/filter kits, docks, brackets, and spare parts; each SKU must be a standalone product image, not a crop from a shared accessory spread"
  }
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function summarizeSpecs(specs = {}) {
  return Object.entries(specs).map(([key, value]) => `${key}: ${value}`).join("; ");
}

const products = [];
const categories = {};
let statusBySlug = {};

try {
  statusBySlug = JSON.parse(await readFile(STATUS_IN, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

for (const [categoryKey, category] of Object.entries(GYUTRON_PRODUCTS)) {
  const categoryProducts = category.products || [];
  if (!categoryProducts.length) continue;

  categories[categoryKey] = {
    title: category.title,
    navLabel: category.navLabel,
    count: categoryProducts.length,
    visual: CATEGORY_VISUALS[categoryKey] || {
      family: "industrial-product",
      direction: "consistent 3/4 technical product view",
      designNotes: "match the broader GYUTRON industrial hardware language"
    }
  };

  for (const product of categoryProducts) {
    const slug = slugify(product.name);
    const visual = categories[categoryKey].visual;
    const status = statusBySlug[slug] || {};
    products.push({
      model: product.name,
      slug,
      categoryKey,
      categoryTitle: category.title,
      type: product.type,
      kind: product.kind,
      currentImage: product.image,
      targetTransparentImage: `product-library/transparent/${slug}.png`,
      workspaceTransparentImage: `astro/public/product-library/transparent/${slug}.png`,
      deployedTransparentImage: `public/product-library/transparent/${slug}.png`,
      sourceChromaImage: `asset-workbench/product-images/chroma/${slug}-chroma.png`,
      archiveFolder: `asset-workbench/product-images/source/${slug}/`,
      status: status.status || "needs-regeneration",
      qa: status.qa || null,
      generatedAt: status.generatedAt || null,
      visualFamily: visual.family,
      direction: visual.direction,
      designNotes: visual.designNotes,
      brandAccent: BRAND.deviceAccentPurple,
      specsSummary: summarizeSpecs(product.specs),
      tags: product.tags || [],
      promptSeed: [
        `Model ${product.name}, ${product.type}.`,
        `Industrial product render for ${category.title}.`,
        visual.direction,
        visual.designNotes,
        `Use matte black / graphite materials with physical device accents exactly ${BRAND.deviceAccentPurple}.`,
        "Transparent final PNG required; if generated with chroma key, use flat #00ff00 background only as intermediate."
      ].join(" ")
    });
  }
}

const library = {
  schemaVersion: 1,
  purpose: "Single source of truth for GYUTRON product image generation, archival, lookup, and future replacement.",
  sourceData: "astro/src/data/products.en.js",
  productCount: products.length,
  brandRules: BRAND,
  generationRules: [
    "Every product gets one independent maintainable transparent PNG, not a baked product matrix.",
    "Final production images must be PNG with alpha transparency and transparent corners.",
    "Use device accent purple #4b2e83 for physical trims/buttons/rings/panels; #8a63d2 is UI-only.",
    "Use a consistent XYZ direction-angle template inside each visual family; do not over-constrain product proportions or local feature geometry.",
    "No in-image text, no watermarks, no fake logos, no repeated generic products for different models.",
    "If chroma key is used, keep source background flat #00ff00 with no shadows/gradients, then remove locally.",
    "One image file has one purpose only: never reuse the same image for a SKU, menu panel, hero background, homepage slide, or another page slot."
  ],
  referenceBrandsForFormLanguage: [
    "Zebra rugged mobile computers and barcode scanners",
    "Cognex fixed barcode readers and machine vision cameras",
    "KEYENCE vision systems and measurement sensors",
    "SICK / OMRON photoelectric, proximity, safety, and IO-Link sensor families",
    "Basler industrial cameras and vision components"
  ],
  categories,
  products
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(JSON_OUT, `${JSON.stringify(library, null, 2)}\n`, "utf8");

const md = [
  "# GYUTRON Product Image Library",
  "",
  "This file is generated by `tools/build_product_image_library.mjs` from `astro/src/data/products.en.js`.",
  "",
  `Product count: **${products.length}**`,
  "",
  "## Hard Rules",
  "",
  ...library.generationRules.map((rule) => `- ${rule}`),
  "",
  "## Category Visual Families",
  "",
  "| Category | Count | Visual family | Direction |",
  "|---|---:|---|---|",
  ...Object.entries(categories).map(([key, category]) => `| ${key} | ${category.count} | ${category.visual.family} | ${category.visual.direction} |`),
  "",
  "## Product Index",
  "",
  "| Model | Category | Type | Current image | Target transparent image | Status |",
  "|---|---|---|---|---|---|",
  ...products.map((product) => `| ${product.model} | ${product.categoryKey} | ${product.type} | \`${product.currentImage}\` | \`${product.targetTransparentImage}\` | ${product.status} |`),
  ""
].join("\n");

await writeFile(MD_OUT, md, "utf8");

console.log(`Wrote ${products.length} products to ${JSON_OUT.pathname} and ${MD_OUT.pathname}`);
