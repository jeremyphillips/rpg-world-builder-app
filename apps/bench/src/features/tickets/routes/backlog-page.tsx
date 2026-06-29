import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { benchTicketPath } from '@/app/routes'
import { Button, Spinner, Text } from '@rpg/ui'

import { BacklogTicketCard } from '../components/backlog-ticket-card'
import { TicketCreateDialog } from '../components/ticket-create-dialog'
import { TicketDetailDrawer } from '../components/ticket-detail-drawer'
import { TicketFilters } from '../components/ticket-filters'
import { buildEpicCardMetaById, resolveTicketEpicCardMeta, useEpicsList } from '@/features/epics'
import { useTicketDetailDrawerSearchParams } from '@/features/tickets'
import { useTicketFiltersFromUrl } from '../hooks/use-ticket-filters-from-url'
import { useTickets } from '../hooks/use-tickets'

export function BacklogPage() {
  const { ticketId, drawerOpen, selectTicket, onDrawerOpenChange } =
    useTicketDetailDrawerSearchParams()
  const { filters, setFilters } = useTicketFiltersFromUrl()
  const { data: tickets = [], isPending, isError, refetch } = useTickets(filters)
  const { data: epics = [] } = useEpicsList()

  const epicMetaById = useMemo(() => buildEpicCardMetaById(epics), [epics])

  return (
    <div className="space-y-6">
      <PageHeader heading="Backlog" actions={<TicketCreateDialog onCreated={selectTicket} />} />
      <TicketFilters filters={filters} onChange={setFilters} />

      {isPending ? <Spinner /> : null}
      {isError ? (
        <div className="space-y-2">
          <Text variant="destructive" role="alert">
            Could not load backlog tickets.
          </Text>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {!isPending && !isError && tickets.length === 0 ? (
        <Text variant="muted">No backlog tickets yet. Create one to capture a gap.</Text>
      ) : null}

      {!isPending && !isError && tickets.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <BacklogTicketCard
                ticket={ticket}
                epic={resolveTicketEpicCardMeta(ticket, epicMetaById)}
                onSelect={selectTicket}
              />
              <Link to={benchTicketPath(ticket.id)} className="sr-only">
                Open {ticket.key} full page
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <TicketDetailDrawer ticketId={ticketId} open={drawerOpen} onOpenChange={onDrawerOpenChange} />
    </div>
  )
}
