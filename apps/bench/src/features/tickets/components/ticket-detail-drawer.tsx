import { Link } from 'react-router-dom'

import { benchTicketPath } from '@/app/routes'
import { Spinner, Text, Sheet } from '@rpg/ui'

import { useTicket } from '../hooks/use-ticket'
import { TicketDetailForm } from './ticket-detail-form'
import { TicketMeta } from './ticket-meta'

interface TicketDetailDrawerProps {
  ticketId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketDetailDrawer({ ticketId, open, onOpenChange }: TicketDetailDrawerProps) {
  const { data: ticket, isPending, isError } = useTicket(ticketId ?? undefined)

  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content side="right" className="w-full max-w-2xl overflow-y-auto">
        <Sheet.Header
          headline="Ticket details"
          description={
            ticket ? (
              <Link to={benchTicketPath(ticket.id)} className="text-sm underline">
                Open full page
              </Link>
            ) : undefined
          }
        />
        <Sheet.Body className="space-y-4">
          {isPending ? <Spinner /> : null}
          {isError ? (
            <Text variant="destructive" role="alert">
              Could not load ticket.
            </Text>
          ) : null}
          {ticket ? (
            <>
              <TicketMeta ticket={ticket} />
              <TicketDetailForm ticket={ticket} transparentStickyChrome />
            </>
          ) : null}
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  )
}
