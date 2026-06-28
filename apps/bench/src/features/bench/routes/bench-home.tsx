import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { BENCH_ROUTES } from '@/app/routes'
import { Button, Text } from '@rpg/ui'
import { useEpicsList } from '@/features/epics'
import { TicketCreateDialog, TicketDetailDrawer } from '@/features/tickets'

import { BenchBoard } from '../components/bench-board'
import { useBenchTickets } from '../hooks/use-bench-tickets'

export function BenchHome() {
  const [searchParams, setSearchParams] = useSearchParams()
  const ticketId = searchParams.get('ticketId')
  const { data: columns, isPending, isError, refetch } = useBenchTickets()
  const { data: epics = [] } = useEpicsList()

  const epicTitleById = useMemo(() => new Map(epics.map((epic) => [epic.id, epic.title])), [epics])

  const handleSelectTicket = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('ticketId', id)
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const handleCreated = useCallback(
    (id: string) => {
      handleSelectTicket(id)
    },
    [handleSelectTicket],
  )

  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      if (open) return
      const params = new URLSearchParams(searchParams)
      params.delete('ticketId')
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const boardColumns = columns ?? {
    up_next: [],
    in_progress: [],
    blocked: [],
    done: [],
  }

  const allEmpty =
    !isPending &&
    !isError &&
    boardColumns.up_next.length === 0 &&
    boardColumns.in_progress.length === 0 &&
    boardColumns.blocked.length === 0 &&
    boardColumns.done.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Bench"
        actions={
          <TicketCreateDialog
            defaultStatus="up_next"
            trigger={<Button>Add to Up Next</Button>}
            onCreated={handleCreated}
          />
        }
      />

      {allEmpty ? (
        <Text variant="muted">
          No near-term tickets yet. Add one above or capture ideas in{' '}
          <Link to={BENCH_ROUTES.backlog} className="underline underline-offset-4">
            Backlog
          </Link>
          .
        </Text>
      ) : null}

      <BenchBoard
        columns={boardColumns}
        epicTitleById={epicTitleById}
        isPending={isPending}
        isError={isError}
        onRetry={() => void refetch()}
        onSelectTicket={handleSelectTicket}
      />

      <TicketDetailDrawer
        ticketId={ticketId}
        open={ticketId != null}
        onOpenChange={handleDrawerOpenChange}
      />
    </div>
  )
}
