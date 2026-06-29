import { useCallback, useState } from 'react'

import type { Ticket, TicketStatus } from '@rpg/contracts/dev-bench'
import { shouldConfirmStatusMove } from '@rpg/dev-bench-core'

import { useUpdateTicket } from '@/features/tickets'

export function useMoveTicketStatus(ticketId: string) {
  const { mutateAsync, isPending } = useUpdateTicket(ticketId)
  const [confirmMove, setConfirmMove] = useState<{ nextStatus: TicketStatus } | null>(null)

  const moveToStatus = useCallback(
    async (ticket: Pick<Ticket, 'blockedByTicketIds'>, nextStatus: TicketStatus) => {
      if (shouldConfirmStatusMove(ticket, nextStatus)) {
        setConfirmMove({ nextStatus })
        return
      }
      await mutateAsync({ status: nextStatus })
    },
    [mutateAsync],
  )

  const handleConfirmMove = useCallback(() => {
    if (!confirmMove) return
    void mutateAsync({ status: confirmMove.nextStatus }).finally(() => {
      setConfirmMove(null)
    })
  }, [confirmMove, mutateAsync])

  const handleConfirmOpenChange = useCallback((open: boolean) => {
    if (!open) setConfirmMove(null)
  }, [])

  return {
    moveToStatus,
    confirmOpen: confirmMove != null,
    onConfirmOpenChange: handleConfirmOpenChange,
    onConfirmMove: handleConfirmMove,
    isPending,
  }
}
