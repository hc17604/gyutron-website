/**
 * Industries registry. Each entry is ONE production line shown front-to-back (see
 * `types/industry.ts`). The Industries mega-menu derives its groups from this list
 * (`data/header-navigation.ts`), so adding/removing/reordering an industry — or editing its
 * stations — updates the top nav automatically. The dedicated per-industry pages (a future
 * production-line graphic with the solution at each station) will render from the same model.
 *
 * To add an industry: add an entry here + its `ind.*` i18n keys in ALL THREE dicts
 * (`src/i18n/{en,de,ja}.json`; a missing key fails the build). Until a `path` points at a real
 * page, leave it on the homepage anchor.
 *
 * The four lines below were chosen with the user as GYUTRON's machine-vision focus industries
 * (mirroring how ViTrox / OPT / Keyence / Cognex segment by production line):
 *   3C consumer electronics · PCB/PCBA (SMT) · food & pharma packaging/printing · NEV battery.
 * EN copy is real; de/ja are English placeholders for now (same convention as Solutions).
 */
import type { Industry } from '../types/industry';

export const INDUSTRIES: Industry[] = [
  {
    slug: 'consumer-electronics-3c',
    path: '/index.html#solutions',
    labelKey: 'ind.3c.name',
    taglineKey: 'ind.3c.tagline',
    introKey: 'ind.3c.intro',
    image: '/nav-industry-electronics-smt.png?v=20260525-hd2',
    stations: [
      { titleKey: 'ind.3c.s1.name', descKey: 'ind.3c.s1.task' },
      { titleKey: 'ind.3c.s2.name', descKey: 'ind.3c.s2.task' },
      { titleKey: 'ind.3c.s3.name', descKey: 'ind.3c.s3.task' },
      { titleKey: 'ind.3c.s4.name', descKey: 'ind.3c.s4.task' },
      { titleKey: 'ind.3c.s5.name', descKey: 'ind.3c.s5.task' },
      { titleKey: 'ind.3c.s6.name', descKey: 'ind.3c.s6.task' },
    ],
  },
  {
    slug: 'pcb-pcba',
    path: '/index.html#solutions',
    labelKey: 'ind.pcb.name',
    taglineKey: 'ind.pcb.tagline',
    introKey: 'ind.pcb.intro',
    image: '/nav-industry-semiconductor.png?v=20260525-hd2',
    stations: [
      { titleKey: 'ind.pcb.s1.name', descKey: 'ind.pcb.s1.task' },
      { titleKey: 'ind.pcb.s2.name', descKey: 'ind.pcb.s2.task' },
      { titleKey: 'ind.pcb.s3.name', descKey: 'ind.pcb.s3.task' },
      { titleKey: 'ind.pcb.s4.name', descKey: 'ind.pcb.s4.task' },
      { titleKey: 'ind.pcb.s5.name', descKey: 'ind.pcb.s5.task' },
      { titleKey: 'ind.pcb.s6.name', descKey: 'ind.pcb.s6.task' },
    ],
  },
  {
    slug: 'food-pharma-packaging-printing',
    path: '/index.html#solutions',
    labelKey: 'ind.fpp.name',
    taglineKey: 'ind.fpp.tagline',
    introKey: 'ind.fpp.intro',
    image: '/nav-industry-food-beverage.png?v=20260525-hd2',
    stations: [
      { titleKey: 'ind.fpp.s1.name', descKey: 'ind.fpp.s1.task' },
      { titleKey: 'ind.fpp.s2.name', descKey: 'ind.fpp.s2.task' },
      { titleKey: 'ind.fpp.s3.name', descKey: 'ind.fpp.s3.task' },
      { titleKey: 'ind.fpp.s4.name', descKey: 'ind.fpp.s4.task' },
      { titleKey: 'ind.fpp.s5.name', descKey: 'ind.fpp.s5.task' },
      { titleKey: 'ind.fpp.s6.name', descKey: 'ind.fpp.s6.task' },
    ],
  },
  {
    slug: 'new-energy-vehicle',
    path: '/index.html#solutions',
    labelKey: 'ind.nev.name',
    taglineKey: 'ind.nev.tagline',
    introKey: 'ind.nev.intro',
    image: '/nav-industry-automotive-ev.png?v=20260525-hd2',
    stations: [
      { titleKey: 'ind.nev.s1.name', descKey: 'ind.nev.s1.task' },
      { titleKey: 'ind.nev.s2.name', descKey: 'ind.nev.s2.task' },
      { titleKey: 'ind.nev.s3.name', descKey: 'ind.nev.s3.task' },
      { titleKey: 'ind.nev.s4.name', descKey: 'ind.nev.s4.task' },
      { titleKey: 'ind.nev.s5.name', descKey: 'ind.nev.s5.task' },
      { titleKey: 'ind.nev.s6.name', descKey: 'ind.nev.s6.task' },
    ],
  },
];

/** One industry by slug, or undefined. */
export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
