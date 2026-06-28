import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { filtersFromSearchParams, filtersToSearchParams } from './epic-filters'
import type { EpicListFilters } from './epic-query-keys'

export function useEpicFiltersFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams])

  const setFilters = useCallback(
    (next: EpicListFilters) => {
      setSearchParams(filtersToSearchParams(next), { replace: true })
    },
    [setSearchParams],
  )

  return { filters, setFilters }
}
