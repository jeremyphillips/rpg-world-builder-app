import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { Button, Spinner, Text } from '@rpg/ui'
import { TicketDetailDrawer } from '@/features/tickets'

import { CreateEpicDialog } from '../components/epic-create-dialog'
import { EpicCard } from '../components/epic-card'
import { EpicFilters } from '../components/epic-filters'
import { useEpicFiltersFromUrl } from '../hooks/use-epic-filters-from-url'
import { useEpicsWithCounts } from '../hooks/use-epics-with-counts'

export function EpicsListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const ticketId = searchParams.get('ticketId')
  const { filters, setFilters } = useEpicFiltersFromUrl()
  const { epicsWithCounts, isPending, isError, refetch } = useEpicsWithCounts(filters)

  const handleSelectTicket = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('ticketId', id)
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      if (open) return
      const params = new URLSearchParams(searchParams)
      params.delete('ticketId')
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  return (
    <div className="space-y-6">
      <PageHeader heading="Epics" actions={<CreateEpicDialog />} />
      <EpicFilters filters={filters} onChange={setFilters} />

      {isPending ? <Spinner /> : null}
      {isError ? (
        <div className="space-y-2">
          <Text variant="destructive" role="alert">
            Could not load epics.
          </Text>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {!isPending && !isError && epicsWithCounts.length === 0 ? (
        <Text variant="muted">No epics yet. Create one to group related work.</Text>
      ) : null}

      {!isPending && !isError && epicsWithCounts.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {epicsWithCounts.map(({ epic, counts, recentlyActive }) => (
            <li key={epic.id}>
              <EpicCard
                epic={epic}
                counts={counts}
                recentlyActive={recentlyActive}
                onSelectTicket={handleSelectTicket}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <TicketDetailDrawer
        ticketId={ticketId}
        open={ticketId != null}
        onOpenChange={handleDrawerOpenChange}
      />
    </div>
  )
}
