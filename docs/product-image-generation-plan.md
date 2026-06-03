# Product Image Generation Plan

Use `docs/product-image-library.json` as the source of truth. This plan defines the execution order and acceptance standard for replacing all current product renders with maintainable transparent PNG assets.

## Non-Negotiable Rules

- Generate one independent image per model. Never create one baked matrix that contains multiple products.
- Final production asset: PNG with alpha transparency, transparent corners, no background, no cast shadow, no contact shadow, no text, no watermark.
- Physical device accents must use GYUTRON logo purple `#4b2e83`. Do not use blue-purple, pink-purple, neon purple, or UI purple `#8a63d2` on the product itself.
- Keep product direction consistent inside each visual family. This is a hard QA gate: same camera position, same visible side, same receding top/bottom direction, same tilt family, same subject baseline, and comparable product scale. Do not batch-generate a product family until one approved direction template exists for that family.
- Avoid fake details that imply unavailable products. If a model is shown on the website, it must look like a plausible sellable SKU in its category.
- Keep all chroma-key source files under `asset-workbench/product-images/chroma/`; final reusable transparent files go under `astro/public/product-library/transparent/`.

## Reference Form Language

Use these brands only as broad form-language references, never as direct copies:

- Zebra: rugged Android mobile computers, RFID handhelds, barcode scanners.
- Cognex: fixed code readers, machine vision cameras, industrial reader modules.
- KEYENCE: vision sensors, measurement systems, 3D/profile inspection modules.
- SICK / OMRON: photoelectric sensors, proximity sensors, safety light curtains, IO-Link modules.
- Basler: industrial camera bodies, lens/lighting/frame-grabber ecosystem.

## Batch Order

1. **Mobile data capture**: `android-pda`, `rfid-handhelds`, `barcode-scanners`, `request-specification` (24 products).
2. **Sensors and process modules**: `proximity-sensors`, `laser-measurement`, `environmental-sensing` (13 products).
3. **Vision systems**: `area-scan-cameras`, `smart-vision-sensors`, `code-reading-cameras`, `vision-lighting` (34 products).
4. **Quality and test instruments**: `dimensional-gauges`, `surface-inspection`, `portable-testers`, `calibration-tools` (13 products).

## Direction Lock Rules

For a product family, choose one approved direction template first, then keep it across every model in that family.

- **Rugged PDA / RFID / handheld scanners:** portrait product, upright vertical body, 3/4 front view, screen or scan face visible, the same side edge visible across all models, top edge receding in the same direction, no random rotation changes between SKUs.
- **Machine vision cameras / fixed readers:** landscape cube/body, front lens or optical window visible, same right/left side visibility across the family, consistent lens-facing angle.
- **Sensors / I/O modules:** connector/sensing face visible with the same 3/4 technical direction; do not alternate between front-left and front-right views inside one category.
- **Lighting / instruments / metrology:** consistent front 3/4 bench/catalog view and consistent product baseline.

Rejected direction examples must be archived under `asset-workbench/product-images/rejected/` and marked in `docs/product-image-status.json`; do not leave rejected images in `astro/public/product-library/transparent/` or `public/product-library/transparent/`.

## Built-In Image Generation Workflow

For each product:

1. Read the product entry from `docs/product-image-library.json`.
2. Generate the product as a realistic industrial product render on a perfectly flat `#00ff00` chroma-key background.
3. Move the chroma-key output to `asset-workbench/product-images/chroma/<slug>-chroma.png`.
4. Remove chroma key with the installed helper:

   ```bash
   python D:\Codex\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py --input <chroma.png> --out <final.png> --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
   ```

5. Save final PNG to `astro/public/product-library/transparent/<slug>.png`.
6. Harmonize purple accents if needed:

   ```bash
   python tools/harmonize_product_purple.py --input <final.png> --out <final.png>
   ```

7. Validate alpha, transparent corners, no green fringe, consistent product scale, correct `#4b2e83` accent use, and category-appropriate design.
8. Record pass/fail details in `docs/product-image-status.json`, then rebuild the library with `node tools/build_product_image_library.mjs`.
9. Copy/sync final assets into `public/product-library/transparent/` during the normal Astro build/deploy flow.
10. Update product data image paths only after the asset passes visual QA.

## Prompt Skeleton

Use this skeleton with the per-product `promptSeed` from `docs/product-image-library.json`:

```text
Use case: product-mockup
Asset type: GYUTRON website product catalog transparent PNG
Primary request: Create a realistic industrial product render for <MODEL>, <TYPE>.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background only, no floor, no shadow, no reflection.
Subject: <PROMPT_SEED_FROM_LIBRARY>
Style/medium: premium industrial hardware product render, plausible B2B automation device, not toy-like, not consumer electronics.
Composition/framing: consistent centered 3/4 technical product view, generous padding, product fills most of the canvas without clipping.
Lighting/mood: clean studio lighting on the object only, crisp edges, no baked rim light.
Color palette: matte black / graphite body, physical accents exactly GYUTRON logo purple #4b2e83.
Materials/textures: rugged rubber, satin anodized metal, glass display or optical window where applicable, practical screws/ports/mounting geometry.
Constraints: no text, no logo, no watermark, no background details, no cast shadow, no contact shadow, no #00ff00 anywhere on the product.
Avoid: blue-purple, pink-purple, neon purple, UI purple #8a63d2 on device accents, inconsistent angle, switching visible side, switching top-edge receding direction, duplicate-looking products across different models.
```

## QA Checklist

- The file opens as RGBA PNG and all four corners are transparent.
- No green fringe remains after chroma removal.
- The product accent color visually matches logo purple `#4b2e83`.
- The product can sit on white, light gray, and near-black backgrounds without halo.
- Product scale and direction match the rest of the same visual family.
- Direction matches the approved family template exactly enough for a catalog grid: same visible side and same receding direction.
- Design is plausible for its category and model specs.
- The model is independently replaceable without regenerating a full matrix.
