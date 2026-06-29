import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateEpicInput } from '@rpg/contracts/dev-bench'

import { updateEpic } from '../api/epics-client'
import { epicQueryKeys } from './epic-query-keys'

export function useUpdateEpic(epicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateEpicInput) => updateEpic(epicId, input),
    onSuccess: (epic) => {
      queryClient.setQueryData(epicQueryKeys.detail(epicId), epic)
      void queryClient.invalidateQueries({ queryKey: epicQueryKeys.lists() })
    },
  })
}
