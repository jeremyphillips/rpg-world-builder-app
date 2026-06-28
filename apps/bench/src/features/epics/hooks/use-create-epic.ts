import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateEpicInput } from '@rpg/contracts/dev-bench'

import { createEpic } from '../api/epics-client'
import { epicQueryKeys } from './epic-query-keys'

export function useCreateEpic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEpicInput) => createEpic(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: epicQueryKeys.lists() })
    },
  })
}
