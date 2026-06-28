import type { Ticket } from '@rpg/contracts/dev-bench'
import { getTicketCreatedByLabel } from '@rpg/contracts/dev-bench'
import { Text } from '@rpg/ui'

interface TicketMetaProps {
  ticket: Pick<Ticket, 'key' | 'title' | 'createdAt' | 'updatedAt' | 'createdBy'>
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString()
}

export function TicketMeta({ ticket }: TicketMetaProps) {
  return (
    <div className="space-y-1">
      <Text variant="small" className="font-mono text-muted-foreground">
        {ticket.key}
      </Text>
      <Text variant="lead">{ticket.title}</Text>
      <Text variant="muted" className="text-xs">
        Created {formatTimestamp(ticket.createdAt)} by {getTicketCreatedByLabel(ticket.createdBy)}
        {' · '}
        Updated {formatTimestamp(ticket.updatedAt)}
      </Text>
    </div>
  )
}
