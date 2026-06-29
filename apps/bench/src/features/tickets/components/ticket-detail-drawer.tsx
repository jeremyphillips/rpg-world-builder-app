import { benchTicketPath } from '@/app/routes'
import { Spinner, Text, Sheet } from '@rpg/ui'

import { useTicket } from '../hooks/use-ticket'
import { TicketDetailForm } from './ticket-detail-form'
import { TicketMetaKicker, ticketMetaTitleClasses } from './ticket-meta'

interface TicketDetailDrawerProps {
  ticketId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketDetailDrawer({ ticketId, open, onOpenChange }: TicketDetailDrawerProps) {
  const { data: ticket, isPending, isError } = useTicket(ticketId ?? undefined)

  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content side="right" className="w-full max-w-2xl">
        {ticket ? (
          <Sheet.Header
            kicker={<TicketMetaKicker ticket={ticket} detailHref={benchTicketPath(ticket.id)} />}
            headline={ticket.title}
            headlineClassName={ticketMetaTitleClasses}
          />
        ) : null}
        {isPending ? (
          <Sheet.Body>
            <Spinner />
          </Sheet.Body>
        ) : null}
        {isError ? (
          <Sheet.Body>
            <Text variant="destructive" role="alert">
              Could not load ticket.
            </Text>
          </Sheet.Body>
        ) : null}
        {ticket ? <TicketDetailForm ticket={ticket} layout="sheet" /> : null}
      </Sheet.Content>
    </Sheet.Root>
  )
}
