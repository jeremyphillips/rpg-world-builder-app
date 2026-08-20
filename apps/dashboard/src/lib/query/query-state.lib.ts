import type { UseQueryResult } from '@tanstack/react-query'

type QueryErrorSlice = Pick<UseQueryResult<unknown, Error>, 'isPending' | 'isError' | 'error'>

/** First user-facing message from a set of TanStack Query results (route shells). */
export function resolveQueryErrorLabel(
  queries: readonly QueryErrorSlice[],
  fallback?: string,
): string | undefined {
  for (const query of queries) {
    if (query.error?.message) return query.error.message
  }
  return fallback
}

export function combineQueryPending(queries: readonly QueryErrorSlice[]): boolean {
  return queries.some((query) => query.isPending)
}

export function combineQueryError(queries: readonly QueryErrorSlice[]): boolean {
  return queries.some((query) => query.isError)
}
