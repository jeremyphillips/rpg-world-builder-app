import { useQuery } from '@tanstack/react-query'
import { bucketTicketsByBenchColumn } from '@rpg/dev-bench-core'

import { fetchTickets, ticketQueryKeys } from '@/features/tickets'

export function useBenchTickets() {
  return useQuery({
    queryKey: ticketQueryKeys.bench(),
    queryFn: () => fetchTickets(),
    select: (tickets) => bucketTicketsByBenchColumn(tickets),
  })
}
