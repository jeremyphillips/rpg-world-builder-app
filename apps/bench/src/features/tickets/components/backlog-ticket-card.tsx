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
    <div className="relative">
      <TicketCard ticket={ticket} epic={epic} onSelect={onSelect} className="pr-10" />
      <div className="absolute right-2 top-2">
        <TicketCardBacklogMenu
          ticket={ticket}
          isPending={isPending}
          onAddToBench={() => {
            void mutateAsync({ status: 'up_next' })
          }}
        />
      </div>
    </div>
  )
}
