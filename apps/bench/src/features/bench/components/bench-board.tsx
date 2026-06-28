import { BENCH_COLUMNS, type BenchColumn as BenchColumnId } from '@rpg/dev-bench-core'
import type { Ticket } from '@rpg/contracts/dev-bench'
import { Button, Spinner, Text } from '@rpg/ui'

import { BenchColumn } from './bench-column'

interface BenchBoardProps {
  columns: Record<BenchColumnId, Ticket[]>
  epicTitleById: Map<string, string>
  isPending?: boolean
  isError?: boolean
  onRetry?: () => void
  onSelectTicket?: (ticketId: string) => void
}

export function BenchBoard({
  columns,
  epicTitleById,
  isPending = false,
  isError = false,
  onRetry,
  onSelectTicket,
}: BenchBoardProps) {
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
    <div className="grid gap-6 md:grid-cols-4 md:overflow-x-auto">
      {BENCH_COLUMNS.map((column) => (
        <BenchColumn
          key={column}
          column={column}
          tickets={columns[column]}
          epicTitleById={epicTitleById}
          onSelectTicket={onSelectTicket}
        />
      ))}
    </div>
  )
}
