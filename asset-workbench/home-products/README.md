# Homepage product category images

Prepared on 2026-10-18 for the homepage product category section (`#products`).

The user's direction was to select product series from the existing GYUTRON product matrix and present them as concise image-led cards, initially inspired by the supplied Cognex reference and then revised to a CYCODE-style two-row grid with two wide featured cards and four standard cards, while retaining GYUTRON color and style. The existing GYUTRON matrix images below are therefore the source imagery for these dedicated homepage assets; no new products or visuals were invented.

Each output is owned only by its homepage category-card slot. SKU images remain unchanged. The homepage references `/home-products/<category>.webp`, independently from the source product-library paths. The fixed-reader featured tile additionally owns `code-reading-cameras-secondary.webp`.

## Technical conversion

- Open the full source PNG as RGBA and preserve the whole canvas, image proportions, subject and transparency.
- Standard-card images fit within 640 x 640 pixels; the two featured-card primary images and the fixed-reader secondary image fit within 1000 x 1000 pixels.
- Use Lanczos resampling without cropping or enlarging.
- Export WebP with quality 90 and method 6.
- Verify RGBA output, all four transparent corners, and each output's dimension limit.
- Visually inspect every output after export.

## Fixed-reader secondary selection

The existing `code-reading-cameras` catalog contains GY-CR120, described as a Compact fixed code reader. Its two horizontal light bars visually distinguish it from the four-sided illumination of the primary GY-CR900 Matrix image. This source was selected after comparing GY-CR120, GY-CR390, and GY-CR520 DPM; the second image is an existing catalog product, not a newly invented variant.

| Homepage output in `astro/public/home-products/` | Source image | Source pixels | Output pixels | Output bytes | Source SHA-256 |
|---|---|---|---|---:|---|
| `area-scan-cameras.webp` | `astro/public/product-library/transparent/gy-v160-compact.png` | 1402 x 1122 | 640 x 512 | 27,846 | `894e4650a6580bc26327a9540af7f979bd541e390b52d08a3223fc71a35bd07a` |
| `smart-vision-sensors.webp` | `astro/public/product-library/transparent/gy-v3d900.png` | 1536 x 1024 | 640 x 427 | 23,534 | `ede60a216eed1ef7a011658eb289f5ab5c08b69d00bcbd826f436256e33dd755` |
| `code-reading-cameras.webp` | `astro/public/product-library/transparent/gy-cr900-matrix.png` | 1402 x 1122 | 1000 x 800 | 74,474 | `3c8fc9e6122e25f1911fae4cc0a3598356d7234a794e7d56903e096e88f441b2` |
| `code-reading-cameras-secondary.webp` | `astro/public/product-library/transparent/gy-cr120.png` | 1536 x 1024 | 1000 x 667 | 49,728 | `9036317c6b0c33a64a3dc821d8afcd230bb826392cbe948f11d65ea5bb9c51f6` |
| `barcode-scanners.webp` | `astro/public/product-library/transparent/gy-s900-xr.png` | 1254 x 1254 | 1000 x 1000 | 82,086 | `20ee3c08a25400d5eef383d824e19d3b34cb9cb3d6fb8f80b9777440d9dbdaa3` |
| `android-pda.webp` | `astro/public/product-library/transparent/gy-a90-touch.png` | 1024 x 1536 | 427 x 640 | 22,432 | `8da4738d7fc13ed37dc5c5d2aa80947a3ecee68daa1e525f4fe6a3fd489a7407` |
| `robot-workcells.webp` | `astro/public/product-library/secondary/gy-rc6-inspect.png` | 1402 x 1122 | 640 x 512 | 57,338 | `de53415438f86fc390e30b9ce5b0081e03cfcfac50dff154e345c070612e5f5e` |

These are existing product illustrations, not newly verified product photographs or independent evidence of product specifications. Category labels and links are owned by the homepage data/component implementation. Production copies under root `public/` are produced only through the normal selective build/sync workflow.

## Approved compact mosaic extension - 2026-10-18

The user selected the final nine-family compact mosaic design and authorized implementation. The revision moves Vision Lighting into the upper row, adds Industrial Sensors, and replaces the duplicate-looking RFID card and separate lower-right cells with one wide Edge Controllers card containing two actual catalog models. No RFID asset is added. These four new files belong only to their corresponding homepage slots and do not modify any original product-library image.

- `vision-lighting.webp` and `industrial-sensors.webp` fit within 640 x 640 pixels.
- `edge-controllers.webp` and `edge-controllers-secondary.webp` fit within 900 x 900 pixels.
- All four use the same technical-only full-canvas RGBA conversion, Lanczos resize, and WebP quality 90 / method 6 procedure above; no cropping, enlargement, subject editing, or creative generation.
- Output mode, limits, and transparent corners were checked; each output was visually inspected.
- Industrial Sensors uses GY-PX90 from the actual `proximity-sensors` category. The older `industrial-sensors` catalog entry redirects to `proximity-sensors`.
- The second controller is GY-EC200 DIN, a DIN-rail edge I/O controller with a slender body and visible mounting rail, paired with the wider GY-EC800 Motion real-time motion controller. Both are present in `edge-controllers`; no EC500 model was introduced.

| Homepage output in `astro/public/home-products/` | Existing model | Existing catalog category | Source image | Source pixels | Output pixels | Output bytes | Source SHA-256 |
|---|---|---|---|---|---|---:|---|
| `vision-lighting.webp` | GY-LR70 | Vision Lighting | `astro/public/product-library/transparent/gy-lr70.png` | 1402 x 1122 | 640 x 512 | 29,336 | `946a97668651341b6173485c36ec7461d56dddc1e4f00b160bf5ba896145b87e` |
| `industrial-sensors.webp` | GY-PX90 | Presence & Object Detection / proximity-sensors | `astro/public/product-library/transparent/gy-px90.png` | 1254 x 1254 | 640 x 640 | 35,768 | `9541895e2f9085309454a2cdac8c5ccb61e4eb0284b6d3e843d4f311435f9c78` |
| `edge-controllers.webp` | GY-EC800 Motion | Edge Controllers | `astro/public/product-library/secondary/gy-ec800-motion.png` | 1402 x 1122 | 900 x 720 | 55,482 | `86561a9611c1060b843221ef0f2e295baa948dbf0c78a36214837c2c1319274b` |
| `edge-controllers-secondary.webp` | GY-EC200 DIN | Edge Controllers | `astro/public/product-library/secondary/gy-ec200-din.png` | 1149 x 1369 | 755 x 900 | 70,874 | `3ec4ef38e5589f77222516a195ae5a86f3241b4609ec1229cb7055c17393a3a5` |
