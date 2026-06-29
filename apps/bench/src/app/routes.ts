/** In-app route paths (relative to React Router basename `/bench`). */
export const BENCH_ROUTES = {
  bench: '/',
  epics: '/epics',
  backlog: '/backlog',
  settings: '/settings',
  ticketDetail: '/tickets/:ticketId',
  epicDetail: '/epics/:epicId',
} as const

/** Router path segments (no leading slash; index route uses `index: true`). */
export const BENCH_ROUTE_SEGMENTS = {
  epics: 'epics',
  backlog: 'backlog',
  settings: 'settings',
  ticketDetail: 'tickets/:ticketId',
  epicDetail: 'epics/:epicId',
} as const

export function benchTicketPath(ticketId: string): string {
  return `/tickets/${ticketId}`
}

export function benchEpicPath(epicId: string): string {
  return `/epics/${epicId}`
}

export interface BenchNavItem {
  to: (typeof BENCH_ROUTES)[keyof typeof BENCH_ROUTES]
  label: string
  end?: boolean
}

export const BENCH_NAV_ITEMS: BenchNavItem[] = [
  { to: BENCH_ROUTES.bench, label: 'Bench', end: true },
  { to: BENCH_ROUTES.epics, label: 'Epics' },
  { to: BENCH_ROUTES.backlog, label: 'Backlog' },
  { to: BENCH_ROUTES.settings, label: 'Settings' },
]
