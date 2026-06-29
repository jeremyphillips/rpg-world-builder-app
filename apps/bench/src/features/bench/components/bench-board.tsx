import { useMemo, useState } from 'react'

import { BENCH_COLUMNS, type BenchColumn as BenchColumnId } from '@rpg/dev-bench-core'
import type { Ticket } from '@rpg/contracts/dev-bench'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Button, ConfirmDialog, Spinner, Text } from '@rpg/ui'

import type { EpicCardMeta } from '@/features/epics'
import { resolveTicketEpicCardMeta } from '@/features/epics'
import { TicketCard } from '@/features/tickets'

import { useBenchBoardMoves } from '../hooks/use-bench-board-moves'
import { parseBenchTicketDndId } from '../lib/bench-dnd-ids'
import { resolveBenchDropColumn } from '../lib/resolve-bench-drop-column'
import { benchDragOverlayCardClasses } from './bench-board.variants'
import { BenchColumn } from './bench-column'

interface BenchBoardProps {
  columns: Record<BenchColumnId, Ticket[]>
  epicMetaById: Map<string, EpicCardMeta>
  isPending?: boolean
  isError?: boolean
  onRetry?: () => void
  onSelectTicket?: (ticketId: string) => void
}

function buildTicketsById(columns: Record<BenchColumnId, Ticket[]>): Map<string, Ticket> {
  const ticketsById = new Map<string, Ticket>()
  for (const column of BENCH_COLUMNS) {
    for (const ticket of columns[column]) {
      ticketsById.set(ticket.id, ticket)
    }
  }
  return ticketsById
}

export function BenchBoard({
  columns,
  epicMetaById,
  isPending = false,
  isError = false,
  onRetry,
  onSelectTicket,
}: BenchBoardProps) {
  const { moveTicket, confirmOpen, onConfirmOpenChange, onConfirmMove, isMovePending } =
    useBenchBoardMoves()
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)

  const ticketsById = useMemo(() => buildTicketsById(columns), [columns])
  const activeTicket = activeTicketId ? ticketsById.get(activeTicketId) : undefined
  const isDragActive = activeTicketId != null

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  )

  function handleDragStart(event: DragStartEvent) {
    const ticketId = parseBenchTicketDndId(String(event.active.id))
    setActiveTicketId(ticketId)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTicketId(null)

    const ticketId = parseBenchTicketDndId(String(event.active.id))
    if (!ticketId || !event.over) return

    const ticket = ticketsById.get(ticketId)
    const targetColumn = resolveBenchDropColumn(event.over, ticketsById)
    if (!ticket || !targetColumn) return

    moveTicket(ticket, targetColumn)
  }

  function handleDragCancel() {
    setActiveTicketId(null)
  }

  if (isPending) {
    return (
      <div className="grid gap-6 md:grid-cols-4">
        {BENCH_COLUMNS.map((column) => (
          <div key={column} className="space-y-3">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
        <Spinner className="sr-only" aria-label="Loading bench tickets" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <Text variant="destructive" role="alert">
          Could not load bench tickets.
        </Text>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={() => void onRetry()}>
            Retry
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid gap-6 md:grid-cols-4 md:overflow-x-auto">
          {BENCH_COLUMNS.map((column) => (
            <BenchColumn
              key={column}
              column={column}
              tickets={columns[column]}
              epicMetaById={epicMetaById}
              isDragActive={isDragActive}
              onSelectTicket={onSelectTicket}
              onMoveTicket={moveTicket}
              isMovePending={isMovePending}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTicket ? (
            <TicketCard
              ticket={activeTicket}
              epic={resolveTicketEpicCardMeta(activeTicket, epicMetaById)}
              interactive={false}
              className={benchDragOverlayCardClasses}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
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
