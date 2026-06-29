import { benchTicketPath } from '@/app/routes'
import { Spinner, Text, Sheet } from '@rpg/ui'

import { useTicket } from '../hooks/use-ticket'
import { TicketDetailForm } from './ticket-detail-form'
import { TicketMetaKicker, TicketMetaTimestamps, ticketMetaTitleClasses } from './ticket-meta'

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
        {ticket ? (
          <Sheet.Header
            kicker={<TicketMetaKicker ticket={ticket} detailHref={benchTicketPath(ticket.id)} />}
            headline={ticket.title}
            headlineClassName={ticketMetaTitleClasses}
          />
        ) : null}
        <Sheet.Body className="space-y-4">
          {isPending ? <Spinner /> : null}
          {isError ? (
            <Text variant="destructive" role="alert">
              Could not load ticket.
            </Text>
          ) : null}
          {ticket ? (
            <>
              <TicketMetaTimestamps ticket={ticket} />
              <TicketDetailForm ticket={ticket} transparentStickyChrome />
            </>
          ) : null}
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  )
}
