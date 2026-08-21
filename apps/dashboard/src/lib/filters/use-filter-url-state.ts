import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { FilterFieldId, FilterSchema } from '@rpg/ui/filters'
import {
  hydrateFilterState,
  resetFilterState,
  setFilterValue as setFilterValueInState,
} from '@rpg/ui/filters'

import { mergeFilterSearchParams } from './filter-url-state.lib'

function createSearchParamsKey(searchParams: URLSearchParams): string {
  return searchParams.toString()
}

export type UseFilterUrlStateOptions<TData, TFilters extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TFilters>
}

export function useFilterUrlState<TData, TFilters extends Record<string, unknown>>({
  schema,
}: UseFilterUrlStateOptions<TData, TFilters>) {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchParamsRef = useRef(searchParams)

  useEffect(() => {
    searchParamsRef.current = searchParams
  })

  const searchParamsKey = createSearchParamsKey(searchParams)

  const filters = useMemo(() => hydrateFilterState(schema, searchParams), [schema, searchParamsKey])

  const writeFilters = useCallback(
    (nextFilters: TFilters) => {
      const merged = mergeFilterSearchParams(schema, nextFilters, searchParamsRef.current)
      if (merged.toString() === searchParamsRef.current.toString()) return
      setSearchParams(merged, { replace: true })
    },
    [schema, setSearchParams],
  )

  const setFilterValue = useCallback(
    <TId extends FilterFieldId<TFilters>>(id: TId, value: TFilters[TId] | undefined) => {
      writeFilters(setFilterValueInState(schema, filters, id, value))
    },
    [filters, schema, writeFilters],
  )

  const resetFilters = useCallback(() => {
    writeFilters(resetFilterState(schema))
  }, [schema, writeFilters])

  const clearFilterField = useCallback(
    (fieldId: FilterFieldId<TFilters>) => {
      setFilterValue(fieldId, undefined)
    },
    [setFilterValue],
  )

  return {
    filters,
    setFilterValue,
    resetFilters,
    clearFilterField,
  }
}
