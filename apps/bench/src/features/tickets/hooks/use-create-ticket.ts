import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateTicketInput } from '@rpg/contracts/dev-bench'

import { createTicket } from '../api/tickets-client'
import { ticketQueryKeys } from './ticket-query-keys'

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicket(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: ticketQueryKeys.bench() })
    },
  })
}
