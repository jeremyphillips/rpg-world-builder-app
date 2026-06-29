import type { EpicCardMeta } from '@/features/epics'
import type { Ticket } from '@rpg/contracts/dev-bench'

import { useUpdateTicket } from '../hooks/use-update-ticket'
import { TicketCardBacklogMenu } from './ticket-card-backlog-menu'
import { TicketCard } from './ticket-card'

interface BacklogTicketCardProps {
  ticket: Ticket
  epic?: EpicCardMeta | null
  onSelect?: (ticketId: string) => void
}

export function BacklogTicketCard({ ticket, epic, onSelect }: BacklogTicketCardProps) {
  const { mutateAsync, isPending } = useUpdateTicket(ticket.id)

  return (
    <TicketCard
      ticket={ticket}
      epic={epic}
      onSelect={onSelect}
      headerActions={
        <TicketCardBacklogMenu
          ticket={ticket}
          isPending={isPending}
          onAddToBench={() => {
            void mutateAsync({ status: 'up_next' })
          }}
        />
      }
    />
  )
}
