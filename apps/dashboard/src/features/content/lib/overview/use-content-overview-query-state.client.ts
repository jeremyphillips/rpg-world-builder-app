'use client'

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { FilterFieldId, FilterSchema } from '@rpg/ui/filters'
import { resetFilterState, setFilterValue } from '@rpg/ui/filters'

import {
  CONTENT_OVERVIEW_DEFAULT_PAGE,
  createAllowedSortIdsKey,
  hydrateOverviewQuery,
  serializeOverviewQuery,
  type ContentOverviewQueryState,
  type ContentSort,
} from './content-overview-query-state'

export type OverviewQueryHistoryMode = 'replace' | 'push'

export type UseContentOverviewQueryStateOptions<TData, TFilters extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TFilters>
  allowedSortIds: readonly string[]
  defaultSort?: ContentSort
}

export type ContentOverviewQueryActions<TFilters extends Record<string, unknown>> = {
  setFilterValue: <TId extends FilterFieldId<TFilters>>(
    id: TId,
    value: TFilters[TId] | undefined,
    options?: { history?: OverviewQueryHistoryMode },
  ) => void
  setFilters: (
    filters: TFilters,
    options?: { history?: OverviewQueryHistoryMode; resetPage?: boolean },
  ) => void
  setSort: (sort: ContentSort | undefined, options?: { history?: OverviewQueryHistoryMode }) => void
  setPage: (page: number, options?: { history?: OverviewQueryHistoryMode }) => void
  resetFilters: (options?: { history?: OverviewQueryHistoryMode }) => void
}

function searchParamsEqual(left: URLSearchParams, right: URLSearchParams): boolean {
  if (left.toString() === right.toString()) return true

  const leftEntries = [...left.entries()].sort(([a], [b]) => a.localeCompare(b))
  const rightEntries = [...right.entries()].sort(([a], [b]) => a.localeCompare(b))
  if (leftEntries.length !== rightEntries.length) return false

  return leftEntries.every(([key, value], index) => {
    const [otherKey, otherValue] = rightEntries[index] ?? []
    return key === otherKey && value === otherValue
  })
}

export function useContentOverviewQueryState<TData, TFilters extends Record<string, unknown>>({
  schema,
  allowedSortIds,
  defaultSort,
}: UseContentOverviewQueryStateOptions<TData, TFilters>): {
  query: ContentOverviewQueryState<TFilters>
  actions: ContentOverviewQueryActions<TFilters>
} {
  const [searchParams, setSearchParams] = useSearchParams()
  const allowedSortIdsKey = createAllowedSortIdsKey(allowedSortIds)
  const searchParamsKey = searchParams.toString()

  const query = useMemo(
    () =>
      hydrateOverviewQuery({
        schema,
        searchParams,
        allowedSortIds,
        defaultSort,
      }),
    [allowedSortIdsKey, defaultSort, schema, searchParamsKey],
  )

  const writeQuery = useCallback(
    (
      next: ContentOverviewQueryState<TFilters>,
      options?: { history?: OverviewQueryHistoryMode },
    ) => {
      const nextParams = serializeOverviewQuery({
        schema,
        query: next,
        defaultSort,
      })

      if (searchParamsEqual(nextParams, searchParams)) return

      setSearchParams(nextParams, { replace: (options?.history ?? 'replace') === 'replace' })
    },
    [defaultSort, schema, searchParamsKey, setSearchParams],
  )

  const setFilterValueAction = useCallback<ContentOverviewQueryActions<TFilters>['setFilterValue']>(
    (id, value, options) => {
      writeQuery(
        {
          ...query,
          filters: setFilterValue(schema, query.filters, id, value),
          page: CONTENT_OVERVIEW_DEFAULT_PAGE,
        },
        options,
      )
    },
    [query, schema, writeQuery],
  )

  const setFiltersAction = useCallback<ContentOverviewQueryActions<TFilters>['setFilters']>(
    (filters, options) => {
      writeQuery(
        {
          ...query,
          filters,
          page: options?.resetPage === false ? query.page : CONTENT_OVERVIEW_DEFAULT_PAGE,
        },
        options,
      )
    },
    [query, writeQuery],
  )

  const setSortAction = useCallback<ContentOverviewQueryActions<TFilters>['setSort']>(
    (sort, options) => {
      writeQuery(
        {
          ...query,
          sort,
          page: CONTENT_OVERVIEW_DEFAULT_PAGE,
        },
        options,
      )
    },
    [query, writeQuery],
  )

  const setPageAction = useCallback<ContentOverviewQueryActions<TFilters>['setPage']>(
    (page, options) => {
      writeQuery({ ...query, page }, options)
    },
    [query, writeQuery],
  )

  const resetFiltersAction = useCallback<ContentOverviewQueryActions<TFilters>['resetFilters']>(
    (options) => {
      writeQuery(
        {
          ...query,
          filters: resetFilterState(schema),
          page: CONTENT_OVERVIEW_DEFAULT_PAGE,
        },
        options,
      )
    },
    [query, schema, writeQuery],
  )

  const actions = useMemo(
    () => ({
      setFilterValue: setFilterValueAction,
      setFilters: setFiltersAction,
      setSort: setSortAction,
      setPage: setPageAction,
      resetFilters: resetFiltersAction,
    }),
    [resetFiltersAction, setFilterValueAction, setFiltersAction, setPageAction, setSortAction],
  )

  return { query, actions }
}
