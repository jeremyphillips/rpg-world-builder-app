import { PageHeader } from '@/components/layout/page-header'
import { Button, Spinner, Text } from '@rpg/ui'

import { CreateEpicDialog } from '../components/epic-create-dialog'
import { EpicCard } from '../components/epic-card'
import { EpicFilters } from '../components/epic-filters'
import { useEpicFiltersFromUrl } from '../hooks/use-epic-filters-from-url'
import { useEpicsWithCounts } from '../hooks/use-epics-with-counts'

export function EpicsListPage() {
  const { filters, setFilters } = useEpicFiltersFromUrl()
  const { epicsWithCounts, isPending, isError, refetch } = useEpicsWithCounts(filters)

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
              <EpicCard epic={epic} counts={counts} recentlyActive={recentlyActive} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
