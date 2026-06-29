import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { groupEpicTicketsByBucket } from '@rpg/dev-bench-core'

import { fetchTickets, ticketQueryKeys } from '@/features/tickets'

export function useEpicTickets(epicId: string) {
  const query = useQuery({
    queryKey: ticketQueryKeys.list({ epic: epicId }),
    queryFn: () => fetchTickets({ epicId }),
    enabled: epicId.length > 0,
  })

  const buckets = useMemo(() => groupEpicTicketsByBucket(query.data ?? []), [query.data])

  return { ...query, buckets }
}
