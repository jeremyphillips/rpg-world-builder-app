import type { BenchColumn } from '@rpg/dev-bench-core'
import type { Ticket } from '@rpg/contracts/dev-bench'
import { getTicketStatusLabel } from '@rpg/contracts/dev-bench'
import { Badge, Text } from '@rpg/ui'

import { BENCH_COLUMN_EMPTY_COPY } from '../lib/column-empty-copy'
import { BenchTicketCard } from './bench-ticket-card'

interface BenchColumnProps {
  column: BenchColumn
  tickets: Ticket[]
  epicTitleById: Map<string, string>
  onSelectTicket?: (ticketId: string) => void
}

export function BenchColumn({ column, tickets, epicTitleById, onSelectTicket }: BenchColumnProps) {
  return (
    <section aria-label={getTicketStatusLabel(column)} className="flex min-w-0 flex-col gap-3">
      <header className="flex items-center gap-2">
        <Text className="font-medium">{getTicketStatusLabel(column)}</Text>
        <Badge variant="secondary">{tickets.length}</Badge>
      </header>
      {tickets.length === 0 ? (
        <Text variant="muted">{BENCH_COLUMN_EMPTY_COPY[column]}</Text>
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <BenchTicketCard
                ticket={ticket}
                epicTitle={ticket.epicId ? epicTitleById.get(ticket.epicId) : null}
                onSelect={onSelectTicket}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
