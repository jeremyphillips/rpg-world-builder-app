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
export const EpicsListPageRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/epics/routes/epics-list-page'), 'EpicsListPage'),
)
export const EpicDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/epics/routes/epic-detail-page'), 'EpicDetailPage'),
)
export const BacklogPageRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/tickets/routes/backlog-page'), 'BacklogPage'),
)
export const TicketDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/tickets/routes/ticket-detail-page'), 'TicketDetailPage'),
)
export const SettingsHomeRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/settings/routes/settings-home'), 'SettingsHome'),
)
