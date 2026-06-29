import { resolveTicketEpicCardMeta, type EpicCardMeta } from '@/features/epics'
import type { Ticket } from '@rpg/contracts/dev-bench'
import { Text } from '@rpg/ui'

import { TicketCard } from '@/features/tickets'

interface EpicTicketSectionProps {
  title: string
  count: number
  tickets: Ticket[]
  epicMetaById: Map<string, EpicCardMeta>
  onSelectTicket: (ticketId: string) => void
}

export function EpicTicketSection({
  title,
  count,
  tickets,
  epicMetaById,
  onSelectTicket,
}: EpicTicketSectionProps) {
  return (
    <section className="space-y-3">
      <Text className="font-medium">
        {title} ({count})
      </Text>
      {tickets.length === 0 ? (
        <Text variant="muted">No tickets.</Text>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <TicketCard
                ticket={ticket}
                epic={resolveTicketEpicCardMeta(ticket, epicMetaById)}
                onSelect={onSelectTicket}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
