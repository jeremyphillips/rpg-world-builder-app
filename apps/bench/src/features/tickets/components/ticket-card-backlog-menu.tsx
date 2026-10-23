import type { Ticket } from '@rpg/contracts/dev-bench'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@rpg/ui'

import { ADD_TO_BENCH_MENU_LABEL } from '../lib/ticket-card-labels'

interface TicketCardBacklogMenuProps {
  ticket: Ticket
  onAddToBench: () => void
  isPending?: boolean
}

export function TicketCardBacklogMenu({
  ticket,
  onAddToBench,
  isPending = false,
}: TicketCardBacklogMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label={`Actions for ${ticket.key}`}
          disabled={isPending}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Icon name="ellipsis" size="lg" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem disabled={isPending} onSelect={onAddToBench}>
          {ADD_TO_BENCH_MENU_LABEL}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
