import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateTicketInput } from '@rpg/contracts/dev-bench'

import { updateTicket } from '../api/tickets-client'
import { ticketQueryKeys } from './ticket-query-keys'

export function useUpdateTicket(ticketId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTicketInput) => updateTicket(ticketId, input),
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketQueryKeys.detail(ticketId), ticket)
      void queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: ticketQueryKeys.bench() })
    },
  })
}
