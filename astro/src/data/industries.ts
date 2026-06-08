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
    path: '/index.html#solutions',
    labelKey: 'ind.elec.name',
    taglineKey: 'ind.elec.tagline',
    introKey: 'ind.elec.intro',
    image: '/nav-industry-electronics-smt.png?v=20260525-hd2',
    coverage: cov(
      'ind.elec.c1', 'ind.elec.c2', 'ind.elec.c3', 'ind.elec.c4',
      'ind.elec.c5', 'ind.elec.c6', 'ind.elec.c7',
    ),
  },
  {
    slug: 'ev-battery-new-energy',
    path: '/index.html#solutions',
    labelKey: 'ind.battery.name',
    taglineKey: 'ind.battery.tagline',
    introKey: 'ind.battery.intro',
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
