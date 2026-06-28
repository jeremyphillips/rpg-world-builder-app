import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import { listTickets } from '@/lib/api/dev-bench-api'
import { BENCH_TICKETS_QUERY_KEY } from '@/lib/api/dev-bench-paths'

function ApiConnectivityStatus() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: BENCH_TICKETS_QUERY_KEY,
    queryFn: listTickets,
  })

  if (isPending) {
    return <Text variant="muted">Checking API connection…</Text>
  }

  if (isError) {
    const message = error instanceof ApiError ? error.message : 'Could not reach the Dev Bench API.'
    return (
      <Text variant="destructive" role="status">
        API error: {message}
      </Text>
    )
  }

  const count = data?.length ?? 0
  return (
    <Text variant="muted" role="status">
      API connected — {count} ticket{count === 1 ? '' : 's'} loaded from{' '}
      <code className="text-foreground">/api/bench/tickets</code>.
    </Text>
  )
}

export function SettingsHome() {
  return (
    <div className="space-y-4">
      <Heading variant="page" as="h1">
        Settings
      </Heading>
      <Text variant="muted">Dev Bench preferences land in a later plan.</Text>
      <section aria-labelledby="api-status-heading" className="space-y-2">
        <Heading variant="section" as="h2" id="api-status-heading">
          API status
        </Heading>
        <ApiConnectivityStatus />
      </section>
    </div>
  )
}
