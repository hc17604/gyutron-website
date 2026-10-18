/** Slot-owned engineering illustrations for the homepage solution explorer.
 * These illustrate configurations, not validated CAD or installed factory photographs.
 * Source prompts and image provenance: asset-workbench/home-solutions/.
 */
export type HomeSolution = { key: string; image: string; href: string; nav?: string };
export const HOME_SOLUTION_GROUPS: readonly { key: string; label: string; items: readonly HomeSolution[] }[] = [
  { key: 'app', label: 'home.exp.tab.app', items: [
    { key: 'app1', nav: 'home.exp.app1.nav', image: 'assembly', href: '/automated-vision-inspection.html#capabilities' },
    { key: 'app2', nav: 'home.exp.app2.nav', image: 'surface', href: '/automated-vision-inspection.html#capabilities' },
    { key: 'app3', nav: 'home.exp.app3.nav', image: 'identification', href: '/identification-traceability.html' },
    { key: 'app4', nav: 'home.exp.app4.nav', image: 'measurement', href: '/measurement-3d-profiling.html' },
    { key: 'app5', nav: 'home.exp.app5.nav', image: 'robot-guidance', href: '/vision-guided-robotics.html' },
    { key: 'app6', nav: 'home.exp.app6.nav', image: 'sorting', href: '/automated-vision-inspection.html#architecture' },
  ] },
  { key: 'ind', label: 'home.exp.tab.ind', items: [
    { key: 'ind1', image: 'electronics', href: '/electronics-semiconductor.html' },
    { key: 'ind2', image: 'semiconductor', href: '/electronics-semiconductor.html#semiconductor' },
    { key: 'ind3', image: 'automotive', href: '/automated-vision-inspection.html#cases' },
    { key: 'ind4', image: 'logistics', href: '/warehouse-logistics.html' },
    { key: 'ind5', image: 'manufacturing', href: '/automated-vision-inspection.html#capabilities' },
  ] },
];
