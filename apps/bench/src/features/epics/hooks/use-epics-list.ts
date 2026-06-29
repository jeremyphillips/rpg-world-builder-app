import { useQuery } from '@tanstack/react-query'

import { fetchEpics } from '../api/epics-client'
import { epicQueryKeys } from './epic-query-keys'

export function useEpicsList() {
  return useQuery({
    queryKey: epicQueryKeys.list(),
    queryFn: fetchEpics,
  })
}
