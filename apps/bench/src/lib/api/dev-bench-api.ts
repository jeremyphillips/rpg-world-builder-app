import type { Ticket } from '@rpg/contracts/dev-bench'
import { request } from '@rpg/api-client'

import { BENCH_TICKETS_PATH } from './dev-bench-paths'

interface ListTicketsResponse {
  tickets: Ticket[]
}

/** List all Dev Bench tickets (shell smoke-test helper; full client in plan 04). */
export async function listTickets(): Promise<Ticket[]> {
  const { tickets } = await request<ListTicketsResponse>(
    BENCH_TICKETS_PATH,
    undefined,
    'Could not load tickets.',
  )
  return tickets
}
