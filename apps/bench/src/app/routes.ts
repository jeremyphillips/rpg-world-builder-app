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
