import { useQuery } from '@tanstack/react-query'

import { fetchEpic } from '../api/epics-client'
import { epicQueryKeys } from './epic-query-keys'

export function useEpic(epicId: string) {
  return useQuery({
    queryKey: epicQueryKeys.detail(epicId),
    queryFn: () => fetchEpic(epicId),
    enabled: epicId.length > 0,
  })
}
