import { useQuery } from '@tanstack/react-query'

import { fetchEpics } from '../api/tickets-client'
import { epicQueryKeys } from './ticket-query-keys'

/** Stub until plan 05 migrates epic hooks to features/epics. */
export function useEpicsList() {
  return useQuery({
    queryKey: epicQueryKeys.list(),
    queryFn: fetchEpics,
  })
}
