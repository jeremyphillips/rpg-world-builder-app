import { useQuery } from '@tanstack/react-query'

import { fetchTickets } from '../api/tickets-client'
import { ticketQueryKeys } from './ticket-query-keys'

/** All tickets for link pickers — unfiltered by status so related/blocker ids resolve. */
export function useTicketLinkCatalog() {
  return useQuery({
    queryKey: ticketQueryKeys.linkCatalog(),
    queryFn: () => fetchTickets(),
  })
}
