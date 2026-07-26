import type { UseQueryResult } from '@tanstack/react-query'

type OverviewQuerySlice = Pick<UseQueryResult<unknown, Error>, 'isPending' | 'isError' | 'error'>

function combineQueryPending(queries: OverviewQuerySlice[]): boolean {
  return queries.some((query) => query.isPending)
}

function combineQueryError(queries: OverviewQuerySlice[]): boolean {
  return queries.some((query) => query.isError)
}

function firstQueryErrorMessage(queries: OverviewQuerySlice[]): string | undefined {
  for (const query of queries) {
    if (query.error?.message) return query.error.message
  }
  return undefined
}

export function resolveOverviewQueryState(
  membersQuery: OverviewQuerySlice,
  partyQuery: OverviewQuerySlice,
  invitesQuery: OverviewQuerySlice,
  includeInvites: boolean,
) {
  const activeQueries = includeInvites
    ? [membersQuery, partyQuery, invitesQuery]
    : [membersQuery, partyQuery]

  return {
    isPending: combineQueryPending(activeQueries),
    isError: combineQueryError(activeQueries),
    errorLabel: firstQueryErrorMessage(activeQueries),
  }
}
