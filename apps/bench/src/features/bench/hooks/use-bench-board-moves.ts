import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import type { Ticket, TicketStatus } from '@rpg/contracts/dev-bench'
import { shouldConfirmStatusMove } from '@rpg/dev-bench-core'

import { ticketQueryKeys, updateTicket } from '@/features/tickets'

export function useBenchBoardMoves() {
  const queryClient = useQueryClient()
  const [confirmMove, setConfirmMove] = useState<{
    ticketId: string
    nextStatus: TicketStatus
  } | null>(null)

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ ticketId, nextStatus }: { ticketId: string; nextStatus: TicketStatus }) =>
      updateTicket(ticketId, { status: nextStatus }),
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketQueryKeys.detail(ticket.id), ticket)
      void queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: ticketQueryKeys.bench() })
    },
  })

  const moveTicket = useCallback(
    (ticket: Ticket, nextStatus: TicketStatus) => {
      if (ticket.status === nextStatus) return

      if (shouldConfirmStatusMove(ticket, nextStatus)) {
        setConfirmMove({ ticketId: ticket.id, nextStatus })
        return
      }

      void mutateAsync({ ticketId: ticket.id, nextStatus })
    },
    [mutateAsync],
  )

  const handleConfirmMove = useCallback(() => {
    if (!confirmMove) return
    void mutateAsync({
      ticketId: confirmMove.ticketId,
      nextStatus: confirmMove.nextStatus,
    }).finally(() => {
      setConfirmMove(null)
    })
  }, [confirmMove, mutateAsync])

  const handleConfirmOpenChange = useCallback((open: boolean) => {
    if (!open) setConfirmMove(null)
  }, [])

  return {
    moveTicket,
    confirmOpen: confirmMove != null,
    onConfirmOpenChange: handleConfirmOpenChange,
    onConfirmMove: handleConfirmMove,
    isMovePending: isPending,
  }
}
