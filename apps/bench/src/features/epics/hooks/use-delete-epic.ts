import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { BENCH_ROUTES } from '@/app/routes'
import { ticketQueryKeys } from '@/features/tickets'

import { deleteEpic } from '../api/epics-client'
import { epicQueryKeys } from './epic-query-keys'

export function useDeleteEpic(epicId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => deleteEpic(epicId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: epicQueryKeys.detail(epicId) })
      void queryClient.invalidateQueries({ queryKey: epicQueryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() })
      void navigate(BENCH_ROUTES.epics)
    },
  })
}
