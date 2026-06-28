export const BENCH_TICKETS_PATH = '/api/bench/tickets'
export const BENCH_EPICS_PATH = '/api/bench/epics'

export function ticketDetailPath(ticketId: string): string {
  return `${BENCH_TICKETS_PATH}/${ticketId}`
}
