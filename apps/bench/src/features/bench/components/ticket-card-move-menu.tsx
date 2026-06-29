import type { Ticket, TicketStatus } from '@rpg/contracts/dev-bench'
import { getMoveStatusOptions } from '@rpg/dev-bench-core'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@rpg/ui'
import { MoreHorizontal } from 'lucide-react'

import { getMoveStatusMenuLabel } from '../lib/move-status-labels'

const OFF_BENCH_STATUSES = new Set<TicketStatus>(['backlog', 'wont_do'])

interface TicketCardMoveMenuProps {
  ticket: Ticket
  onMove: (nextStatus: TicketStatus) => void
  isPending?: boolean
}

export function TicketCardMoveMenu({ ticket, onMove, isPending = false }: TicketCardMoveMenuProps) {
  const options = getMoveStatusOptions(ticket.status)
  const benchOptions = options.filter((status) => !OFF_BENCH_STATUSES.has(status))
  const offBenchOptions = options.filter((status) => OFF_BENCH_STATUSES.has(status))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label={`Move ${ticket.key}`}
          disabled={isPending}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        {benchOptions.map((status) => (
          <DropdownMenuItem key={status} disabled={isPending} onSelect={() => onMove(status)}>
            {getMoveStatusMenuLabel(status)}
          </DropdownMenuItem>
        ))}
        {offBenchOptions.length > 0 ? <DropdownMenuSeparator /> : null}
        {offBenchOptions.map((status) => (
          <DropdownMenuItem key={status} disabled={isPending} onSelect={() => onMove(status)}>
            {getMoveStatusMenuLabel(status)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
