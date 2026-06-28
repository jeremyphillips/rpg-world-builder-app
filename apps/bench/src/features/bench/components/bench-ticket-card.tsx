import type { Ticket } from '@rpg/contracts/dev-bench'
import { ConfirmDialog } from '@rpg/ui'

import { TicketCard } from '@/features/tickets'

import { useMoveTicketStatus } from '../hooks/use-move-ticket-status'
import { TicketCardMoveMenu } from './ticket-card-move-menu'

interface BenchTicketCardProps {
  ticket: Ticket
  epicTitle?: string | null
  onSelect?: (ticketId: string) => void
}

export function BenchTicketCard({ ticket, epicTitle, onSelect }: BenchTicketCardProps) {
  const { moveToStatus, confirmOpen, onConfirmOpenChange, onConfirmMove, isPending } =
    useMoveTicketStatus(ticket.id)

  return (
    <>
      <div className="relative">
        <TicketCard ticket={ticket} epicTitle={epicTitle} onSelect={onSelect} className="pr-10" />
        <div className="absolute right-2 top-2">
          <TicketCardMoveMenu
            ticket={ticket}
            isPending={isPending}
            onMove={(nextStatus) => {
              void moveToStatus(ticket, nextStatus)
            }}
          />
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={onConfirmOpenChange}
        headline="Mark done anyway?"
        description="This ticket still has blockers. Mark it done anyway?"
        confirmLabel="Mark done"
        onConfirm={onConfirmMove}
      />
    </>
  )
}
