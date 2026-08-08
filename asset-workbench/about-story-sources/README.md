# Homepage About story image provenance - 2026-08-08

This folder records the source and usage boundaries for the four-panel homepage About module. Stock and illustrative images are representative visual context; they must not be described as photographs of GYUTRON facilities, employees, customers, or equipment unless separately verified and approved.

## Panel assets

1. Company scale
   - Deployed asset: `public/home-about-headquarters-building.png`
   - Existing user-supplied GYUTRON building image retained from the prior About module.
2. In-house production
   - Source file: `wikimedia-orbbec-assembly-line.png`
   - Source page: https://commons.wikimedia.org/wiki/File:Assembly_line_at_Orbbec%27s_Intelligent_Manufacturing_Base.png
   - Author: Baitutai
   - Original: 1536 x 1024 PNG, dated 2026-02-12
   - License: CC0 1.0 Universal Public Domain Dedication
   - Deployed derivative: `public/home-about-production-line.jpg`
   - Usage boundary: representative camera-product assembly environment; not a GYUTRON production-line photograph.
3. Engineering lab
   - Deployed asset: `public/home-about-quality-bench.png`
   - Existing illustrative engineering test-bench image retained from the prior About module.
   - Usage boundary: illustrative test environment; not a photograph of a GYUTRON laboratory, employee, or equipment.
4. Customer trust
   - Source file: `pexels-4483559-industrial-handshake.jpg`
   - Source page: https://www.pexels.com/photo/employees-talking-with-each-other-4483559/
   - Photographer: Tiger Lily
   - Page status at review: Free to use
   - License: https://www.pexels.com/license/
   - Deployed derivative: `public/home-about-customer-trust.jpg`
   - Usage boundary: representative industrial collaboration; the people shown are not GYUTRON employees or identified customers and do not endorse GYUTRON.

## Processing

The two new deployed derivatives were resized where needed and JPEG-encoded at quality 88. No generative editing, branding, object removal, or compositing was applied. CSS `background-size: cover` performs the responsive crop at runtime.
