import type { UseQueryResult } from '@tanstack/react-query'

import {
  combineQueryError,
  combineQueryPending,
  resolveQueryErrorLabel,
} from '@/lib/query/query-state.lib'

type OverviewQuerySlice = Pick<UseQueryResult<unknown, Error>, 'isPending' | 'isError' | 'error'>

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
    errorLabel: resolveQueryErrorLabel(activeQueries),
  }
}
