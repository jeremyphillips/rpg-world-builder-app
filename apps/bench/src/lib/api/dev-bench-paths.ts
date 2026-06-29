export const BENCH_TICKETS_PATH = '/api/bench/tickets'
export const BENCH_EPICS_PATH = '/api/bench/epics'

export const BENCH_TICKETS_QUERY_KEY = ['bench', 'tickets'] as const

export function ticketDetailPath(ticketId: string): string {
  return `${BENCH_TICKETS_PATH}/${ticketId}`
}

export function epicDetailPath(epicId: string): string {
  return `${BENCH_EPICS_PATH}/${epicId}`
}
