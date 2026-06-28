import { lazy, type ComponentType } from 'react'

import { withRouteSuspense } from './with-route-suspense'

function lazyNamed<P = Record<string, never>>(
  importFn: () => Promise<Record<string, unknown>>,
  exportName: string,
) {
  return lazy(() =>
    importFn().then((module) => ({
      default: module[exportName] as ComponentType<P>,
    })),
  )
}

export const BenchHomeRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/bench/routes/bench-home'), 'BenchHome'),
)
export const EpicsHomeRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/epics/routes/epics-home'), 'EpicsHome'),
)
export const BacklogHomeRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/backlog/routes/backlog-home'), 'BacklogHome'),
)
export const SearchHomeRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/search/routes/search-home'), 'SearchHome'),
)
export const SettingsHomeRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/settings/routes/settings-home'), 'SettingsHome'),
)
