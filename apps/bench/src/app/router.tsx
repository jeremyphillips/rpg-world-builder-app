import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { BENCH_ROUTE_SEGMENTS } from '@/app/routes'
import {
  BacklogPageRoute,
  BenchHomeRoute,
  EpicsHomeRoute,
  SearchHomeRoute,
  SettingsHomeRoute,
  TicketDetailRoute,
} from '@/app/lazy-routes'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

const router = createBrowserRouter(
  [
    {
      element: <AppShell />,
      children: [
        { index: true, element: <BenchHomeRoute /> },
        { path: BENCH_ROUTE_SEGMENTS.epics, element: <EpicsHomeRoute /> },
        { path: BENCH_ROUTE_SEGMENTS.backlog, element: <BacklogPageRoute /> },
        { path: BENCH_ROUTE_SEGMENTS.ticketDetail, element: <TicketDetailRoute /> },
        { path: BENCH_ROUTE_SEGMENTS.search, element: <SearchHomeRoute /> },
        { path: BENCH_ROUTE_SEGMENTS.settings, element: <SettingsHomeRoute /> },
      ],
    },
  ],
  { basename },
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
