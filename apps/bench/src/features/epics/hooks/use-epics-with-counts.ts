import { useMemo } from 'react'

import {
  countEpicTicketsByBucket,
  getRecentlyActiveTickets,
  sortEpicsForDisplay,
} from '@rpg/dev-bench-core'

import { useAllTickets } from '@/features/tickets'

import { useEpicsList } from './use-epics-list'
import type { EpicListFilters } from './epic-query-keys'
import { applyEpicFilters } from './epic-filters'

export interface EpicWithCounts {
  epic: NonNullable<ReturnType<typeof useEpicsList>['data']>[number]
  counts: ReturnType<typeof countEpicTicketsByBucket>
  recentlyActive: ReturnType<typeof getRecentlyActiveTickets>
}

export function useEpicsWithCounts(filters: EpicListFilters) {
  const epicsQuery = useEpicsList()
  const ticketsQuery = useAllTickets()

  const epicsWithCounts = useMemo(() => {
    const epics = epicsQuery.data ?? []
    const tickets = ticketsQuery.data ?? []
    const ticketsByEpicId = new Map<string, typeof tickets>()

    for (const ticket of tickets) {
      if (!ticket.epicId) continue
      const group = ticketsByEpicId.get(ticket.epicId) ?? []
      group.push(ticket)
      ticketsByEpicId.set(ticket.epicId, group)
    }

    const filtered = applyEpicFilters(epics, filters)
    const sorted = sortEpicsForDisplay(filtered)

    return sorted.map((epic): EpicWithCounts => {
      const epicTickets = ticketsByEpicId.get(epic.id) ?? []
      return {
        epic,
        counts: countEpicTicketsByBucket(epicTickets),
        recentlyActive: getRecentlyActiveTickets(epicTickets),
      }
    })
  }, [epicsQuery.data, ticketsQuery.data, filters])

  return {
    epicsWithCounts,
    isPending: epicsQuery.isPending || ticketsQuery.isPending,
    isError: epicsQuery.isError || ticketsQuery.isError,
    refetch: () => Promise.all([epicsQuery.refetch(), ticketsQuery.refetch()]),
  }
}
