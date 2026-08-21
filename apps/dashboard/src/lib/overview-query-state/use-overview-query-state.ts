import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { FilterFieldId, FilterSchema } from '@rpg/ui/filters'
import { resetFilterState, setFilterValue } from '@rpg/ui/filters'

import {
  createAllowedSortIdsKey,
  createFilterStateKey,
  createSearchParamsKey,
  hydrateOverviewQuery,
  isOverviewQueryEqual,
  OVERVIEW_DEFAULT_PAGE,
  serializeOverviewQuery,
  type OverviewQueryState,
  type OverviewSort,
} from './overview-query-state'

export type OverviewQueryHistoryMode = 'replace' | 'push'

const TEXT_FILTER_URL_DEBOUNCE_MS = 300

export type OverviewQueryStateMode = 'url' | 'local'

export type UseOverviewQueryStateOptions<TData, TFilters extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TFilters>
  allowedSortIds: readonly string[]
  defaultSort?: OverviewSort
  mode?: OverviewQueryStateMode
}

export type OverviewQueryActions<TFilters extends Record<string, unknown>> = {
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
    sort: OverviewSort | undefined,
    options?: { history?: OverviewQueryHistoryMode },
  ) => void
  setPage: (page: number, options?: { history?: OverviewQueryHistoryMode }) => void
  resetFilters: (options?: { history?: OverviewQueryHistoryMode }) => void
}

function searchParamsEqual(left: URLSearchParams, right: URLSearchParams): boolean {
  return createSearchParamsKey(left) === createSearchParamsKey(right)
}

function createDefaultLocalQuery<TData, TFilters extends Record<string, unknown>>(
  schema: FilterSchema<TData, TFilters>,
  defaultSort?: OverviewSort,
): OverviewQueryState<TFilters> {
  return {
    filters: resetFilterState(schema),
    sort: defaultSort,
    page: OVERVIEW_DEFAULT_PAGE,
  }
}

export function useOverviewQueryState<TData, TFilters extends Record<string, unknown>>({
  schema,
  allowedSortIds,
  defaultSort,
  mode = 'url',
}: UseOverviewQueryStateOptions<TData, TFilters>): {
  query: OverviewQueryState<TFilters>
  actions: OverviewQueryActions<TFilters>
} {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchParamsRef = useRef(searchParams)
  const setSearchParamsRef = useRef(setSearchParams)

  useEffect(() => {
    searchParamsRef.current = searchParams
    setSearchParamsRef.current = setSearchParams
  })

  const allowedSortIdsKey = createAllowedSortIdsKey(allowedSortIds)
  const searchParamsKey = createSearchParamsKey(searchParams)

  const urlQuery = useMemo(
    () =>
      mode === 'url'
        ? hydrateOverviewQuery({
            schema,
            searchParams,
            allowedSortIds,
            defaultSort,
          })
        : createDefaultLocalQuery(schema, defaultSort),
    [allowedSortIdsKey, defaultSort, mode, schema, searchParamsKey],
  )

  const [localQuery, setLocalQuery] = useState<OverviewQueryState<TFilters>>(() =>
    mode === 'local' ? createDefaultLocalQuery(schema, defaultSort) : urlQuery,
  )

  const [filters, setFilters] = useState<TFilters>(urlQuery.filters)
  const filtersRef = useRef(filters)

  useEffect(() => {
    filtersRef.current = filters
  })

  const urlQueryRef = useRef(urlQuery)

  useEffect(() => {
    urlQueryRef.current = urlQuery
  })

  const urlFiltersKey = createFilterStateKey(schema, urlQuery.filters)
  const lastSyncedUrlFiltersKeyRef = useRef(urlFiltersKey)
  const pendingOwnWriteKeyRef = useRef<string | null>(null)
  const textFilterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (mode !== 'url') return

    if (pendingOwnWriteKeyRef.current === searchParamsKey) {
      pendingOwnWriteKeyRef.current = null
      lastSyncedUrlFiltersKeyRef.current = urlFiltersKey
      return
    }

    if (lastSyncedUrlFiltersKeyRef.current === urlFiltersKey) return

    lastSyncedUrlFiltersKeyRef.current = urlFiltersKey
    setFilters(urlQueryRef.current.filters)
  }, [mode, searchParamsKey, urlFiltersKey])

  useEffect(
    () => () => {
      if (textFilterDebounceRef.current) clearTimeout(textFilterDebounceRef.current)
    },
    [],
  )

  const query = useMemo(() => {
    if (mode === 'local') return localQuery

    return {
      ...urlQuery,
      filters,
    }
  }, [filters, localQuery, mode, urlQuery])

  const writeQueryToUrl = useCallback(
    (next: OverviewQueryState<TFilters>, options?: { history?: OverviewQueryHistoryMode }) => {
      if (mode !== 'url') return

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
    [defaultSort, mode, schema],
  )

  const commitQuery = useCallback(
    (next: OverviewQueryState<TFilters>, options?: { history?: OverviewQueryHistoryMode }) => {
      if (mode === 'local') {
        setLocalQuery((current) => (isOverviewQueryEqual(next, current) ? current : next))
        return
      }

      if (isOverviewQueryEqual(next, { ...urlQueryRef.current, filters: filtersRef.current })) {
        return
      }

      setFilters(next.filters)
      writeQueryToUrl(next, options)
    },
    [mode, writeQueryToUrl],
  )

  const setFilterValueAction = useCallback<OverviewQueryActions<TFilters>['setFilterValue']>(
    (id, value, options) => {
      const nextFilters = setFilterValue(schema, filtersRef.current, id, value)
      const currentFiltersKey = createFilterStateKey(schema, filtersRef.current)
      const nextFiltersKey = createFilterStateKey(schema, nextFilters)
      if (currentFiltersKey === nextFiltersKey) return

      const nextQuery: OverviewQueryState<TFilters> = {
        ...urlQueryRef.current,
        filters: nextFilters,
        page: OVERVIEW_DEFAULT_PAGE,
      }

      if (mode === 'local') {
        setLocalQuery(nextQuery)
        return
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
    [mode, schema, writeQueryToUrl],
  )

  const setFiltersAction = useCallback<OverviewQueryActions<TFilters>['setFilters']>(
    (nextFilters, options) => {
      if (textFilterDebounceRef.current) {
        clearTimeout(textFilterDebounceRef.current)
        textFilterDebounceRef.current = null
      }

      commitQuery(
        {
          ...urlQueryRef.current,
          filters: nextFilters,
          page: options?.resetPage === false ? urlQueryRef.current.page : OVERVIEW_DEFAULT_PAGE,
        },
        options,
      )
    },
    [commitQuery],
  )

  const setSortAction = useCallback<OverviewQueryActions<TFilters>['setSort']>(
    (sort, options) => {
      commitQuery(
        {
          ...urlQueryRef.current,
          filters: filtersRef.current,
          sort,
          page: OVERVIEW_DEFAULT_PAGE,
        },
        options,
      )
    },
    [commitQuery],
  )

  const setPageAction = useCallback<OverviewQueryActions<TFilters>['setPage']>(
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

  const resetFiltersAction = useCallback<OverviewQueryActions<TFilters>['resetFilters']>(
    (options) => {
      if (textFilterDebounceRef.current) {
        clearTimeout(textFilterDebounceRef.current)
        textFilterDebounceRef.current = null
      }

      commitQuery(
        {
          ...urlQueryRef.current,
          filters: resetFilterState(schema),
          page: OVERVIEW_DEFAULT_PAGE,
        },
        options,
      )
    },
    [commitQuery, schema],
  )

  const setFilterValueActionRef = useRef(setFilterValueAction)
  const setFiltersActionRef = useRef(setFiltersAction)
  const setSortActionRef = useRef(setSortAction)
  const setPageActionRef = useRef(setPageAction)
  const resetFiltersActionRef = useRef(resetFiltersAction)

  useEffect(() => {
    setFilterValueActionRef.current = setFilterValueAction
    setFiltersActionRef.current = setFiltersAction
    setSortActionRef.current = setSortAction
    setPageActionRef.current = setPageAction
    resetFiltersActionRef.current = resetFiltersAction
  })

  const actions = useMemo(
    () => ({
      setFilterValue: ((...args) =>
        setFilterValueActionRef.current(
          ...args,
        )) as OverviewQueryActions<TFilters>['setFilterValue'],
      setFilters: ((...args) =>
        setFiltersActionRef.current(...args)) as OverviewQueryActions<TFilters>['setFilters'],
      setSort: ((...args) =>
        setSortActionRef.current(...args)) as OverviewQueryActions<TFilters>['setSort'],
      setPage: ((...args) =>
        setPageActionRef.current(...args)) as OverviewQueryActions<TFilters>['setPage'],
      resetFilters: ((...args) =>
        resetFiltersActionRef.current(...args)) as OverviewQueryActions<TFilters>['resetFilters'],
    }),
    [],
  )

  return { query, actions }
}
