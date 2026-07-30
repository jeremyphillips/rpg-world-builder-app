import { BENCH_ROUTES } from '@/app/routes'

import { type BenchSidebarNavSection } from './bench-sidebar-nav-model'

/** Pure Dev Bench sidebar sections grouped by Work and Settings. */
export function buildBenchSidebarSections(): BenchSidebarNavSection[] {
  return [
    {
      id: 'work',
      label: 'Work',
      items: [
        { id: 'bench', label: 'Bench', href: BENCH_ROUTES.bench, end: true },
        { id: 'epics', label: 'Epics', href: BENCH_ROUTES.epics },
        { id: 'backlog', label: 'Backlog', href: BENCH_ROUTES.backlog },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      items: [{ id: 'settings', label: 'Settings', href: BENCH_ROUTES.settings }],
    },
  ]
}
