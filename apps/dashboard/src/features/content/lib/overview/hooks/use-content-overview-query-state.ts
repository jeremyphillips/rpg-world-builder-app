import type { FilterFieldId, FilterSchema } from '@rpg/ui/filters'

import {
  useOverviewQueryState,
  type OverviewQueryActions,
  type OverviewQueryHistoryMode,
  type OverviewQueryState,
  type OverviewSort,
} from '@/lib/overview-query-state'

export type { OverviewQueryHistoryMode }

export type UseContentOverviewQueryStateOptions<TData, TFilters extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TFilters>
  allowedSortIds: readonly string[]
  defaultSort?: OverviewSort
}

export type ContentOverviewQueryActions<TFilters extends Record<string, unknown>> =
  OverviewQueryActions<TFilters>

/** URL-synced overview query state for content overviews. */
export function useContentOverviewQueryState<TData, TFilters extends Record<string, unknown>>({
  schema,
  allowedSortIds,
  defaultSort,
}: UseContentOverviewQueryStateOptions<TData, TFilters>): {
  query: OverviewQueryState<TFilters>
  actions: ContentOverviewQueryActions<TFilters>
} {
  return useOverviewQueryState({
    schema,
    allowedSortIds,
    defaultSort,
    mode: 'url',
  })
}

export type { FilterFieldId }
