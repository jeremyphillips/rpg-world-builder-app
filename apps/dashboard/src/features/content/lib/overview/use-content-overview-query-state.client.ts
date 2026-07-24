'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { FilterFieldId, FilterSchema } from '@rpg/ui/filters'
import { resetFilterState, setFilterValue } from '@rpg/ui/filters'

import {
  CONTENT_OVERVIEW_DEFAULT_PAGE,
  hydrateOverviewQuery,
  serializeOverviewQuery,
  type ContentOverviewQueryState,
  type ContentSort,
} from './content-overview-query-state'

export type OverviewQueryHistoryMode = 'replace' | 'push'

export type UseContentOverviewQueryStateOptions<
  TData,
  TFilters extends Record<string, unknown>,
> = {
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
  setSort: (
    sort: ContentSort | undefined,
    options?: { history?: OverviewQueryHistoryMode },
  ) => void
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

export function useContentOverviewQueryState<
  TData,
  TFilters extends Record<string, unknown>,
>({
  schema,
  allowedSortIds,
  defaultSort,
}: UseContentOverviewQueryStateOptions<TData, TFilters>): {
  query: ContentOverviewQueryState<TFilters>
  actions: ContentOverviewQueryActions<TFilters>
} {
  const [searchParams, setSearchParams] = useSearchParams()
  const isInitialMountRef = useRef(true)
  const skipUrlSyncRef = useRef(false)
  const pendingHistoryModeRef = useRef<OverviewQueryHistoryMode>('replace')

  const queryFromUrl = useMemo(
    () =>
      hydrateOverviewQuery({
        schema,
        searchParams,
        allowedSortIds,
        defaultSort,
      }),
    [allowedSortIds, defaultSort, schema, searchParams],
  )

  const [query, setQuery] = useState<ContentOverviewQueryState<TFilters>>(() => queryFromUrl)

  useEffect(() => {
    skipUrlSyncRef.current = true
    setQuery(queryFromUrl)
  }, [queryFromUrl])

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      skipUrlSyncRef.current = false
      return
    }

    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false
      return
    }

    const nextParams = serializeOverviewQuery({
      schema,
      query,
      defaultSort,
    })

    if (searchParamsEqual(nextParams, searchParams)) return

    setSearchParams(nextParams, { replace: pendingHistoryModeRef.current === 'replace' })
  }, [
    allowedSortIds,
    defaultSort,
    query,
    schema,
    searchParams,
    setSearchParams,
  ])

  const commitQuery = useCallback(
    (
      updater:
        | ContentOverviewQueryState<TFilters>
        | ((current: ContentOverviewQueryState<TFilters>) => ContentOverviewQueryState<TFilters>),
      options?: { history?: OverviewQueryHistoryMode },
    ) => {
      pendingHistoryModeRef.current = options?.history ?? 'replace'
      setQuery((current) => (typeof updater === 'function' ? updater(current) : updater))
    },
    [],
  )

  const setFilterValueAction = useCallback<
    ContentOverviewQueryActions<TFilters>['setFilterValue']
  >(
    (id, value, options) => {
      commitQuery(
        (current) => ({
          ...current,
          filters: setFilterValue(schema, current.filters, id, value),
          page: CONTENT_OVERVIEW_DEFAULT_PAGE,
        }),
        options,
      )
    },
    [commitQuery, schema],
  )

  const setFiltersAction = useCallback<ContentOverviewQueryActions<TFilters>['setFilters']>(
    (filters, options) => {
      commitQuery(
        (current) => ({
          ...current,
          filters,
          page: options?.resetPage === false ? current.page : CONTENT_OVERVIEW_DEFAULT_PAGE,
        }),
        options,
      )
    },
    [commitQuery],
  )

  const setSortAction = useCallback<ContentOverviewQueryActions<TFilters>['setSort']>(
    (sort, options) => {
      commitQuery(
        (current) => ({
          ...current,
          sort,
          page: CONTENT_OVERVIEW_DEFAULT_PAGE,
        }),
        options,
      )
    },
    [commitQuery],
  )

  const setPageAction = useCallback<ContentOverviewQueryActions<TFilters>['setPage']>(
    (page, options) => {
      commitQuery((current) => ({ ...current, page }), options)
    },
    [commitQuery],
  )

  const resetFiltersAction = useCallback<ContentOverviewQueryActions<TFilters>['resetFilters']>(
    (options) => {
      commitQuery(
        (current) => ({
          ...current,
          filters: resetFilterState(schema),
          page: CONTENT_OVERVIEW_DEFAULT_PAGE,
        }),
        options,
      )
    },
    [commitQuery, schema],
  )

  const actions = useMemo(
    () => ({
      setFilterValue: setFilterValueAction,
      setFilters: setFiltersAction,
      setSort: setSortAction,
      setPage: setPageAction,
      resetFilters: resetFiltersAction,
    }),
    [
      resetFiltersAction,
      setFilterValueAction,
      setFiltersAction,
      setPageAction,
      setSortAction,
    ],
  )

  return { query, actions }
}
