/**
 * Industries registry. Each entry is a sector GYUTRON serves plus the areas it COVERS (see
 * `types/industry.ts`). The Industries mega-menu derives its groups from this list
 * (`data/header-navigation.ts`), so adding/removing/reordering an industry — or editing its coverage —
 * updates the top nav automatically. The dedicated per-industry pages will render from the same model.
 *
 * To add an industry: add an entry here + its `ind.*` i18n keys in ALL THREE dicts
 * (`src/i18n/{en,de,ja}.json`; a missing key fails the build). Until a `path` points at a real page,
 * leave it on the homepage anchor.
 *
 * The four sectors below were chosen with the user to span GYUTRON's full range (machine vision +
 * robotics + AGV/AMR + automation), not just vision inspection. EN copy is real; de/ja are English
 * placeholders for now (same convention as Solutions).
 */
import type { Industry } from '../types/industry';

const cov = (...keys: string[]) => keys.map((labelKey) => ({ labelKey }));

export const INDUSTRIES: Industry[] = [
  {
    slug: 'electronics-semiconductor',
    path: '/electronics-semiconductor.html',
    labelKey: 'ind.elec.name',
    taglineKey: 'ind.elec.tagline',
    introKey: 'ind.elec.intro',
    detailKey: 'ind.elec.detail',
    image: '/nav-industry-electronics-smt.png?v=20260525-hd2',
    coverage: cov(
      'ind.elec.c1', 'ind.elec.c2', 'ind.elec.c3', 'ind.elec.c4',
      'ind.elec.c5', 'ind.elec.c6', 'ind.elec.c7',
    ),
    // --- dedicated page ---
    titleKey: 'iep.title',
    descKey: 'iep.desc',
    breadcrumbKey: 'iep.breadcrumb',
    heroImage: '/nav-industry-electronics-smt.png',
    archImage: '/nav-industry-semiconductor.png',
    relatedProducts: ['area-scan-cameras', 'code-reading-cameras', 'smart-vision-sensors', 'vision-lighting', 'laser-measurement', 'dimensional-gauges', 'surface-inspection', 'edge-controllers'],
    relatedSolutions: ['automated-vision-inspection', 'identification-traceability', 'measurement-3d-profiling', 'vision-guided-robotics', 'industrial-sensing'],
    gallery: {
      eyebrowKey: 'iep.gallery.eyebrow', titleKey: 'iep.gallery.title', introKey: 'iep.gallery.intro',
      shots: [
        { tagKey: 'iep.gallery.s1.tag', captionKey: 'iep.gallery.s1.cap' },
        { tagKey: 'iep.gallery.s2.tag', captionKey: 'iep.gallery.s2.cap' },
        { tagKey: 'iep.gallery.s3.tag', captionKey: 'iep.gallery.s3.cap' },
        { tagKey: 'iep.gallery.s4.tag', captionKey: 'iep.gallery.s4.cap' },
        { tagKey: 'iep.gallery.s5.tag', captionKey: 'iep.gallery.s5.cap' },
        { tagKey: 'iep.gallery.s6.tag', captionKey: 'iep.gallery.s6.cap' },
      ],
    },
    hero: {
      eyebrowKey: 'iep.hero.eyebrow',
      titleKey: 'iep.hero.title',
      descKey: 'iep.hero.desc',
      panel: { labelKey: 'iep.hero.panel.label', valueKey: 'iep.hero.panel.value', descKey: 'iep.hero.panel.desc' },
      kpis: [
        { value: '≥ 99.5%', label: 'Defect detection rate' },
        { value: '< 20 ms', label: 'Inspection cycle' },
        { value: '≥ 99.9%', label: '1D/2D/DPM read rate' },
      ],
    },
    tabs: [
      { href: '#line', labelKey: 'iep.tab.line' },
      { href: '#segments', labelKey: 'iep.tab.segments' },
      { href: '#semiconductor', labelKey: 'iep.tab.semi' },
      { href: '#inspection', labelKey: 'iep.tab.inspection' },
      { href: '#why', labelKey: 'iep.tab.why' },
      { href: '#cases', labelKey: 'iep.tab.cases' },
    ],
    sections: [
      {
        id: 'line', kind: 'workflow', eyebrowKey: 'iep.line.eyebrow', titleKey: 'iep.line.title', introKey: 'iep.line.intro',
        cards: [
          { icon: 'fa-solid fa-microchip', titleKey: 'iep.line.s1.t', descKey: 'iep.line.s1.d' },
          { icon: 'fa-solid fa-print', titleKey: 'iep.line.s2.t', descKey: 'iep.line.s2.d' },
          { icon: 'fa-solid fa-grip', titleKey: 'iep.line.s3.t', descKey: 'iep.line.s3.d' },
          { icon: 'fa-solid fa-fire', titleKey: 'iep.line.s4.t', descKey: 'iep.line.s4.d' },
          { icon: 'fa-solid fa-x-ray', titleKey: 'iep.line.s5.t', descKey: 'iep.line.s5.d' },
          { icon: 'fa-solid fa-layer-group', titleKey: 'iep.line.s6.t', descKey: 'iep.line.s6.d' },
          { icon: 'fa-solid fa-barcode', titleKey: 'iep.line.s7.t', descKey: 'iep.line.s7.d' },
        ],
      },
      {
        id: 'segments', kind: 'capability', eyebrowKey: 'iep.seg.eyebrow', titleKey: 'iep.seg.title', introKey: 'iep.seg.intro',
        cards: [
          { icon: 'fa-solid fa-mobile-screen', titleKey: 'iep.seg.c1.t', descKey: 'iep.seg.c1.d' },
          { icon: 'fa-solid fa-microchip', titleKey: 'iep.seg.c2.t', descKey: 'iep.seg.c2.d' },
          { icon: 'fa-solid fa-industry', titleKey: 'iep.seg.c3.t', descKey: 'iep.seg.c3.d' },
          { icon: 'fa-solid fa-vector-square', titleKey: 'iep.seg.c4.t', descKey: 'iep.seg.c4.d' },
        ],
      },
      {
        id: 'semiconductor', variant: 'dark', kind: 'architecture', eyebrowKey: 'iep.semi.eyebrow', titleKey: 'iep.semi.title', introKey: 'iep.semi.intro', visualAriaKey: 'iep.semi.aria',
        cards: [
          { titleKey: 'iep.semi.c1.t', descKey: 'iep.semi.c1.d' },
          { titleKey: 'iep.semi.c2.t', descKey: 'iep.semi.c2.d' },
          { titleKey: 'iep.semi.c3.t', descKey: 'iep.semi.c3.d' },
          { titleKey: 'iep.semi.c4.t', descKey: 'iep.semi.c4.d' },
        ],
      },
      {
        id: 'inspection', variant: 'alt', kind: 'capability', eyebrowKey: 'iep.insp.eyebrow', titleKey: 'iep.insp.title', introKey: 'iep.insp.intro',
        cards: [
          { icon: 'fa-solid fa-print', titleKey: 'iep.insp.c1.t', descKey: 'iep.insp.c1.d' },
          { icon: 'fa-solid fa-camera-retro', titleKey: 'iep.insp.c2.t', descKey: 'iep.insp.c2.d' },
          { icon: 'fa-solid fa-x-ray', titleKey: 'iep.insp.c3.t', descKey: 'iep.insp.c3.d' },
          { icon: 'fa-solid fa-barcode', titleKey: 'iep.insp.c4.t', descKey: 'iep.insp.c4.d' },
          { icon: 'fa-solid fa-ruler-combined', titleKey: 'iep.insp.c5.t', descKey: 'iep.insp.c5.d' },
          { icon: 'fa-solid fa-circle-check', titleKey: 'iep.insp.c6.t', descKey: 'iep.insp.c6.d' },
        ],
      },
      {
        id: 'why', variant: 'dark', kind: 'capability', eyebrowKey: 'iep.why.eyebrow', titleKey: 'iep.why.title', introKey: 'iep.why.intro',
        cards: [
          { icon: 'fa-solid fa-gauge-high', titleKey: 'iep.why.c1.t', descKey: 'iep.why.c1.d' },
          { icon: 'fa-solid fa-shield-halved', titleKey: 'iep.why.c2.t', descKey: 'iep.why.c2.d' },
          { icon: 'fa-solid fa-plug', titleKey: 'iep.why.c3.t', descKey: 'iep.why.c3.d' },
          { icon: 'fa-solid fa-truck-fast', titleKey: 'iep.why.c4.t', descKey: 'iep.why.c4.d' },
        ],
      },
    ],
    cases: {
      eyebrowKey: 'iep.cases.eyebrow', titleKey: 'iep.cases.title', introKey: 'iep.cases.intro',
      items: [
        { tagKey: 'iep.cases.c1.tag', titleKey: 'iep.cases.c1.title', metricKey: 'iep.cases.c1.metric' },
        { tagKey: 'iep.cases.c2.tag', titleKey: 'iep.cases.c2.title', metricKey: 'iep.cases.c2.metric' },
        { tagKey: 'iep.cases.c3.tag', titleKey: 'iep.cases.c3.title', metricKey: 'iep.cases.c3.metric' },
      ],
    },
    caseStudy: {
      eyebrowKey: 'iep.cs.eyebrow', titleKey: 'iep.cs.title',
      points: [
        { labelKey: 'sol.common.challenge', valueKey: 'iep.cs.challenge' },
        { labelKey: 'sol.common.approach', valueKey: 'iep.cs.approach' },
        { labelKey: 'sol.common.result', valueKey: 'iep.cs.result' },
      ],
    },
    cta: { id: 'contact', titleKey: 'iep.cta.title', descKey: 'iep.cta.desc', buttonKey: 'iep.cta.button', href: '/contact-sales.html' },
  },
  {
    slug: 'ev-battery-new-energy',
    path: '/index.html#solutions',
    labelKey: 'ind.battery.name',
    taglineKey: 'ind.battery.tagline',
    introKey: 'ind.battery.intro',
    detailKey: 'ind.battery.detail',
    image: '/nav-industry-automotive-ev.png?v=20260525-hd2',
    coverage: cov(
      'ind.battery.c1', 'ind.battery.c2', 'ind.battery.c3', 'ind.battery.c4', 'ind.battery.c5',
      'ind.battery.c6', 'ind.battery.c7', 'ind.battery.c8', 'ind.battery.c9',
    ),
  },
  {
    slug: 'logistics-warehouse',
    path: '/index.html#solutions',
    labelKey: 'ind.logi.name',
    taglineKey: 'ind.logi.tagline',
    introKey: 'ind.logi.intro',
    detailKey: 'ind.logi.detail',
    image: '/nav-industry-logistics-rfid.png?v=20260525-hd2',
    coverage: cov(
      'ind.logi.c1', 'ind.logi.c2', 'ind.logi.c3', 'ind.logi.c4',
      'ind.logi.c5', 'ind.logi.c6', 'ind.logi.c7', 'ind.logi.c8',
    ),
  },
  {
    slug: 'general-manufacturing',
    path: '/index.html#solutions',
    labelKey: 'ind.gen.name',
    taglineKey: 'ind.gen.tagline',
    introKey: 'ind.gen.intro',
    detailKey: 'ind.gen.detail',
    image: '/nav-industry-oem-machine-builders.png?v=20260525-hd2',
    coverage: cov(
      'ind.gen.c1', 'ind.gen.c2', 'ind.gen.c3', 'ind.gen.c4',
      'ind.gen.c5', 'ind.gen.c6', 'ind.gen.c7', 'ind.gen.c8',
    ),
  },
];

/** One industry by slug, or undefined. */
export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
