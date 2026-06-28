import { useQuery } from '@tanstack/react-query'

import { fetchTicket } from '../api/tickets-client'
import { ticketQueryKeys } from './ticket-query-keys'

export function useTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: ticketQueryKeys.detail(ticketId ?? ''),
    queryFn: () => fetchTicket(ticketId!),
    enabled: ticketId != null && ticketId.length > 0,
  })
}
