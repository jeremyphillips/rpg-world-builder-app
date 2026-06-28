import { useQuery } from '@tanstack/react-query'

import { fetchTickets } from '../api/tickets-client'
import {
  applyClientTicketFilters,
  ticketQueryKeys,
  toTicketListQuery,
  type TicketListFilters,
} from './ticket-query-keys'

export function useTickets(filters: TicketListFilters) {
  return useQuery({
    queryKey: ticketQueryKeys.list(filters),
    queryFn: async () => {
      const tickets = await fetchTickets(toTicketListQuery(filters))
      return applyClientTicketFilters(tickets, filters)
    },
  })
}
