import { Link, useParams } from 'react-router-dom'

import { BENCH_ROUTES } from '@/app/routes'
import { Spinner, Text } from '@rpg/ui'

import { TicketDetailForm } from '../components/ticket-detail-form'
import { TicketMeta } from '../components/ticket-meta'
import { useTicket } from '../hooks/use-ticket'

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { data: ticket, isPending, isError } = useTicket(ticketId)

  if (isPending) {
    return <Spinner />
  }

  if (isError || !ticket) {
    return (
      <div className="space-y-3">
        <Text variant="destructive" role="alert">
          Ticket not found.
        </Text>
        <Link to={BENCH_ROUTES.backlog} className="text-sm underline">
          Back to Backlog
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <TicketMeta ticket={ticket} />
      <TicketDetailForm ticket={ticket} />
    </div>
  )
}
