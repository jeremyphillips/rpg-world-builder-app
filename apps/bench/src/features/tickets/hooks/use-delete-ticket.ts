import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { BENCH_ROUTES } from '@/app/routes'

import { deleteTicket } from '../api/tickets-client'
import { ticketQueryKeys } from './ticket-query-keys'

export function useDeleteTicket(ticketId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => deleteTicket(ticketId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ticketQueryKeys.detail(ticketId) })
      void queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() })
      void navigate(BENCH_ROUTES.backlog)
    },
  })
}
