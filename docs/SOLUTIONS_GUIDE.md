# Solutions Guide — gyutron.com

Solutions are **data-driven**: each solution is an entry in `src/data/solutions.ts` (`SOLUTIONS`),
typed by `src/types/solution.ts` (`Solution`), and `components/SolutionPage.astro` renders a page from
that model. One solution is live today: **automated-vision-inspection**.

## The model (`Solution`)

```
slug, path, titleKey, descKey, breadcrumbKey, relatedProducts?,
hero:    { eyebrowKey, titleKey, descKey, panel:{ labelKey, valueKey, descKey } }
tabs:    [ { href:'#capabilities', labelKey }, … ]
sections:[ { id, variant?:'dark'|'alt', kind:'capability'|'architecture'|'workflow',
             eyebrowKey, titleKey, introKey, visualAriaKey?, cards:[ { icon?, titleKey, descKey } ] } ]
cta:     { id, titleKey, descKey, buttonKey, href }
```

All text is referenced by **i18n key** (the site convention — the actual strings live in
`src/i18n/{en,de,ja}.json`), not inlined. Never inline translated prose here.

## Edit the existing solution's copy

Change the values of the referenced i18n keys (e.g. `main.270`, `seo.automated-vision-inspection.desc`)
in **all three** dicts. No code change needed. `npm run build`.

## Add a NEW solution (same page shape)

`SolutionPage.astro`'s body markup matches the current shape: **hero + 3 sections (capability /
architecture / workflow, with 4 / 4 / 3 cards) + CTA**. A new solution that fits this shape:

1. Add a `Solution` entry to `SOLUTIONS` in `src/data/solutions.ts` (new `slug`, `path`,
   `seo.<slug>.title`/`.desc` keys, hero/tabs/sections/cta referencing new i18n keys).
2. Add every referenced `*Key` to **all three** i18n dicts (a missing key fails the build).
3. Create the page wrappers — `src/pages/<slug>.astro`, `pages/de/<slug>.astro`, `pages/ja/<slug>.astro` —
   each rendering `<SolutionPage locale={…} slug="<slug>" />` (mirror `automated-vision-inspection.astro`).
4. Register it in `src/data/pages.ts` `SITE_PAGES` (`type:'solution'`, `includeInSitemap:true`) so it
   enters the sitemap; add a nav link (`data/header-navigation.ts` / `data/navigation.ts`) if it should
   appear in the menu.
5. `npm run build` → `npm run verify:all`. The new solution page auto-appears in `sitemap.xml`.

## ⚠️ Different page shape → needs the generic renderer (TODO)

The section/card markup in `SolutionPage.astro` is **literal** (not a `.map()` loop): Astro strips
whitespace between mapped siblings, which would change inter-element spacing and break byte-equivalence
with the deployed pages. So a solution with a **different** structure (different number of sections or
cards, or different card kinds) can't be rendered just from data yet.

**Next step (deferred):** a fully-generic body renderer that loops `sections`/`cards` while preserving
the exact whitespace, so any-shaped solution renders from data with **no** new page markup. The model
already supports it; only the renderer is pending. Until then, a new shape needs a small template edit
(verify the built pages stay byte-equivalent: `diff astro/dist/<page> public/<page>`).

## Deploy

Solution pages render into `public/` HTML. After build, sync the affected
`astro/dist/<slug>.html` (+ `de/`, `ja/`) into `public/` and commit both (see DEPLOYMENT.md). Editing
an existing solution that is byte-equivalent (only refactors) needs no `public/` sync.
