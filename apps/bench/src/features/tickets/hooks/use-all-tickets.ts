import { useQuery } from '@tanstack/react-query'

import { fetchTickets } from '../api/tickets-client'
import { ticketQueryKeys } from './ticket-query-keys'

/** All tickets — unfiltered by status (epic counts, link pickers, etc.). */
export function useAllTickets() {
  return useQuery({
    queryKey: ticketQueryKeys.allTickets(),
    queryFn: () => fetchTickets(),
  })
}
