'use client'

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { FilterFieldId, FilterSchema } from '@rpg/ui/filters'
import { resetFilterState, setFilterValue } from '@rpg/ui/filters'

import {
  CONTENT_OVERVIEW_DEFAULT_PAGE,
  createAllowedSortIdsKey,
  createFilterStateKey,
  createSearchParamsKey,
  hydrateOverviewQuery,
  isOverviewQueryEqual,
  serializeOverviewQuery,
  type ContentOverviewQueryState,
  type ContentSort,
} from './content-overview-query-state'

export type OverviewQueryHistoryMode = 'replace' | 'push'

const TEXT_FILTER_URL_DEBOUNCE_MS = 300

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
  return createSearchParamsKey(left) === createSearchParamsKey(right)
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
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams
  const setSearchParamsRef = useRef(setSearchParams)
  setSearchParamsRef.current = setSearchParams

  const allowedSortIdsKey = createAllowedSortIdsKey(allowedSortIds)
  const searchParamsKey = createSearchParamsKey(searchParams)

  const urlQuery = useMemo(
    () =>
      hydrateOverviewQuery({
        schema,
        searchParams,
        allowedSortIds,
        defaultSort,
      }),
    [allowedSortIdsKey, defaultSort, schema, searchParamsKey],
  )

  const [filters, setFilters] = useState<TFilters>(urlQuery.filters)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const urlQueryRef = useRef(urlQuery)
  urlQueryRef.current = urlQuery

  const urlFiltersKey = createFilterStateKey(schema, urlQuery.filters)
  const lastSyncedUrlFiltersKeyRef = useRef(urlFiltersKey)
  const pendingOwnWriteKeyRef = useRef<string | null>(null)
  const textFilterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pendingOwnWriteKeyRef.current === searchParamsKey) {
      pendingOwnWriteKeyRef.current = null
      lastSyncedUrlFiltersKeyRef.current = urlFiltersKey
      return
    }

    if (lastSyncedUrlFiltersKeyRef.current === urlFiltersKey) return

    lastSyncedUrlFiltersKeyRef.current = urlFiltersKey
    setFilters(urlQueryRef.current.filters)
  }, [searchParamsKey, urlFiltersKey])

  useEffect(
    () => () => {
      if (textFilterDebounceRef.current) clearTimeout(textFilterDebounceRef.current)
    },
    [],
  )

  const query = useMemo(
    () => ({
      ...urlQuery,
      filters,
    }),
    [filters, urlQuery],
  )

  const writeQueryToUrl = useCallback(
    (
      next: ContentOverviewQueryState<TFilters>,
      options?: { history?: OverviewQueryHistoryMode },
    ) => {
      const nextParams = serializeOverviewQuery({
        schema,
        query: next,
        defaultSort,
      })

      if (searchParamsEqual(nextParams, searchParamsRef.current)) return

      pendingOwnWriteKeyRef.current = createSearchParamsKey(nextParams)

      startTransition(() => {
        setSearchParamsRef.current(nextParams, {
          replace: (options?.history ?? 'replace') === 'replace',
        })
      })
    },
    [defaultSort, schema],
  )

  const commitQuery = useCallback(
    (
      next: ContentOverviewQueryState<TFilters>,
      options?: { history?: OverviewQueryHistoryMode },
    ) => {
      if (isOverviewQueryEqual(next, { ...urlQueryRef.current, filters: filtersRef.current })) {
        return
      }

      setFilters(next.filters)
      writeQueryToUrl(next, options)
    },
    [writeQueryToUrl],
  )

  const setFilterValueAction = useCallback<ContentOverviewQueryActions<TFilters>['setFilterValue']>(
    (id, value, options) => {
      const nextFilters = setFilterValue(schema, filtersRef.current, id, value)
      const currentFiltersKey = createFilterStateKey(schema, filtersRef.current)
      const nextFiltersKey = createFilterStateKey(schema, nextFilters)
      if (currentFiltersKey === nextFiltersKey) return

      const nextQuery: ContentOverviewQueryState<TFilters> = {
        ...urlQueryRef.current,
        filters: nextFilters,
        page: CONTENT_OVERVIEW_DEFAULT_PAGE,
      }

      setFilters(nextFilters)

      const field = schema.fields.find((candidate) => candidate.id === id)
      if (field?.type === 'text') {
        if (textFilterDebounceRef.current) clearTimeout(textFilterDebounceRef.current)
        textFilterDebounceRef.current = setTimeout(() => {
          writeQueryToUrl(nextQuery, options)
        }, TEXT_FILTER_URL_DEBOUNCE_MS)
        return
      }

      if (textFilterDebounceRef.current) {
        clearTimeout(textFilterDebounceRef.current)
        textFilterDebounceRef.current = null
      }

      writeQueryToUrl(nextQuery, options)
    },
    [schema, writeQueryToUrl],
  )

  const setFiltersAction = useCallback<ContentOverviewQueryActions<TFilters>['setFilters']>(
    (nextFilters, options) => {
      if (textFilterDebounceRef.current) {
        clearTimeout(textFilterDebounceRef.current)
        textFilterDebounceRef.current = null
      }

      commitQuery(
        {
          ...urlQueryRef.current,
          filters: nextFilters,
          page:
            options?.resetPage === false ? urlQueryRef.current.page : CONTENT_OVERVIEW_DEFAULT_PAGE,
        },
        options,
      )
    },
    [commitQuery],
  )

  const setSortAction = useCallback<ContentOverviewQueryActions<TFilters>['setSort']>(
    (sort, options) => {
      commitQuery(
        {
          ...urlQueryRef.current,
          filters: filtersRef.current,
          sort,
          page: CONTENT_OVERVIEW_DEFAULT_PAGE,
        },
        options,
      )
    },
    [commitQuery],
  )

  const setPageAction = useCallback<ContentOverviewQueryActions<TFilters>['setPage']>(
    (page, options) => {
      commitQuery(
        {
          ...urlQueryRef.current,
          filters: filtersRef.current,
          page,
        },
        options,
      )
    },
    [commitQuery],
  )

  const resetFiltersAction = useCallback<ContentOverviewQueryActions<TFilters>['resetFilters']>(
    (options) => {
      if (textFilterDebounceRef.current) {
        clearTimeout(textFilterDebounceRef.current)
        textFilterDebounceRef.current = null
      }

      commitQuery(
        {
          ...urlQueryRef.current,
          filters: resetFilterState(schema),
          page: CONTENT_OVERVIEW_DEFAULT_PAGE,
        },
        options,
      )
    },
    [commitQuery, schema],
  )

  const setFilterValueActionRef = useRef(setFilterValueAction)
  setFilterValueActionRef.current = setFilterValueAction
  const setFiltersActionRef = useRef(setFiltersAction)
  setFiltersActionRef.current = setFiltersAction
  const setSortActionRef = useRef(setSortAction)
  setSortActionRef.current = setSortAction
  const setPageActionRef = useRef(setPageAction)
  setPageActionRef.current = setPageAction
  const resetFiltersActionRef = useRef(resetFiltersAction)
  resetFiltersActionRef.current = resetFiltersAction

  const actions = useMemo(
    () => ({
      setFilterValue: ((...args) =>
        setFilterValueActionRef.current(
          ...args,
        )) as ContentOverviewQueryActions<TFilters>['setFilterValue'],
      setFilters: ((...args) =>
        setFiltersActionRef.current(
          ...args,
        )) as ContentOverviewQueryActions<TFilters>['setFilters'],
      setSort: ((...args) =>
        setSortActionRef.current(...args)) as ContentOverviewQueryActions<TFilters>['setSort'],
      setPage: ((...args) =>
        setPageActionRef.current(...args)) as ContentOverviewQueryActions<TFilters>['setPage'],
      resetFilters: ((...args) =>
        resetFiltersActionRef.current(
          ...args,
        )) as ContentOverviewQueryActions<TFilters>['resetFilters'],
    }),
    [],
  )

  return { query, actions }
}
