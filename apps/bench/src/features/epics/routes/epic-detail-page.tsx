import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { BENCH_ROUTES } from '@/app/routes'
import { Button, Spinner, Text } from '@rpg/ui'
import { deriveRelatedCodeAreas } from '@rpg/dev-bench-core'

import {
  TicketCreateDialog,
  TicketDetailDrawer,
  useTicketDetailDrawerSearchParams,
} from '@/features/tickets'

import { EpicDetailForm } from '../components/epic-detail-form'
import { EpicRelatedCodeAreas } from '../components/epic-related-code-areas'
import { EpicTicketSection } from '../components/epic-ticket-section'
import { RecommendNextButton } from '../components/recommend-next-button'
import { buildEpicCardMetaById } from '../lib/epic-card-meta'
import { useEpic } from '../hooks/use-epic'
import { useEpicTickets } from '../hooks/use-epic-tickets'
import { useEpicsList } from '../hooks/use-epics-list'

export function EpicDetailPage() {
  const { epicId = '' } = useParams()
  const { ticketId, drawerOpen, selectTicket, onDrawerOpenChange } =
    useTicketDetailDrawerSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  const epicQuery = useEpic(epicId)
  const ticketsQuery = useEpicTickets(epicId)
  const { data: epics = [] } = useEpicsList()

  const relatedAreas = useMemo(
    () => deriveRelatedCodeAreas(ticketsQuery.data ?? []),
    [ticketsQuery.data],
  )
  const epicMetaById = useMemo(() => buildEpicCardMetaById(epics), [epics])

  if (epicQuery.isPending) {
    return (
      <div className="space-y-6">
        <Spinner />
      </div>
    )
  }

  if (epicQuery.isError || !epicQuery.data) {
    return (
      <div className="space-y-4">
        <Text variant="destructive" role="alert">
          Epic not found.
        </Text>
        <Link to={BENCH_ROUTES.epics} className="text-sm underline">
          Back to epics
        </Link>
      </div>
    )
  }

  const epic = epicQuery.data
  const { open, blocked, done } = ticketsQuery.buckets

  return (
    <div className="space-y-8">
      <PageHeader
        heading={epic.title}
        actions={
          <>
            <RecommendNextButton
              tickets={ticketsQuery.data ?? []}
              epics={epics}
              epicId={epic.id}
              onSelectTicket={selectTicket}
            />
            <Button type="button" onClick={() => setCreateOpen(true)}>
              Add ticket
            </Button>
            <TicketCreateDialog
              defaultEpicId={epic.id}
              open={createOpen}
              onOpenChange={setCreateOpen}
              onCreated={selectTicket}
            />
          </>
        }
      />

      <EpicDetailForm epic={epic} />

      <EpicRelatedCodeAreas areas={relatedAreas} />

      {ticketsQuery.isPending ? <Spinner /> : null}
      {ticketsQuery.isError ? (
        <div className="space-y-2">
          <Text variant="destructive" role="alert">
            Could not load epic tickets.
          </Text>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void ticketsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {!ticketsQuery.isPending && !ticketsQuery.isError ? (
        <div className="space-y-8">
          <EpicTicketSection
            title="Open Tickets"
            count={open.length}
            tickets={open}
            epicMetaById={epicMetaById}
            onSelectTicket={selectTicket}
          />
          <EpicTicketSection
            title="Blocked"
            count={blocked.length}
            tickets={blocked}
            epicMetaById={epicMetaById}
            onSelectTicket={selectTicket}
          />
          <EpicTicketSection
            title="Done"
            count={done.length}
            tickets={done}
            epicMetaById={epicMetaById}
            onSelectTicket={selectTicket}
          />
        </div>
      ) : null}

      <TicketDetailDrawer ticketId={ticketId} open={drawerOpen} onOpenChange={onDrawerOpenChange} />
    </div>
  )
}
