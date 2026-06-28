import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { benchTicketPath } from '@/app/routes'
import { Button, Spinner, Text } from '@rpg/ui'

import { TicketCard } from '../components/ticket-card'
import { TicketCreateDialog } from '../components/ticket-create-dialog'
import { TicketDetailDrawer } from '../components/ticket-detail-drawer'
import { TicketFilters } from '../components/ticket-filters'
import { useEpicsList } from '../hooks/use-epics-list'
import { useTicketFiltersFromUrl } from '../hooks/use-ticket-filters-from-url'
import { useTickets } from '../hooks/use-tickets'

export function BacklogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const ticketId = searchParams.get('ticketId')
  const { filters, setFilters } = useTicketFiltersFromUrl()
  const { data: tickets = [], isPending, isError, refetch } = useTickets(filters)
  const { data: epics = [] } = useEpicsList()

  const epicTitleById = useMemo(() => new Map(epics.map((epic) => [epic.id, epic.title])), [epics])

  const handleSelectTicket = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('ticketId', id)
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const handleCreated = useCallback(
    (id: string) => {
      handleSelectTicket(id)
    },
    [handleSelectTicket],
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
      <PageHeader heading="Backlog" actions={<TicketCreateDialog onCreated={handleCreated} />} />
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
              <TicketCard
                ticket={ticket}
                epicTitle={ticket.epicId ? epicTitleById.get(ticket.epicId) : null}
                onSelect={handleSelectTicket}
              />
              <Link to={benchTicketPath(ticket.id)} className="sr-only">
                Open {ticket.key} full page
              </Link>
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
