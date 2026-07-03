import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  TICKET_CREATED_BY,
  TICKET_PRIORITIES,
  TICKET_SIZES,
  TICKET_TYPES,
  ticketCreatedBySchema,
  ticketPrioritySchema,
  ticketSizeSchema,
  ticketTypeSchema,
} from '@rpg/contracts/dev-bench'

import { EPIC_FILTER_ALL, EPIC_FILTER_NONE, type TicketListFilters } from './ticket-query-keys'
import { TICKET_DETAIL_DRAWER_SEARCH_PARAM } from './use-ticket-detail-drawer-search-params'

const FILTER_PARAM = {
  type: 'type',
  priority: 'priority',
  size: 'size',
  epic: 'epic',
  area: 'area',
  createdBy: 'createdBy',
  includeWontDo: 'includeWontDo',
  search: 'search',
} as const

function parseEnumParam<T extends string>(
  value: string | null,
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T } },
): T | undefined {
  if (!value) return undefined
  const parsed = schema.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

export function filtersFromSearchParams(searchParams: URLSearchParams): TicketListFilters {
  const epic = searchParams.get(FILTER_PARAM.epic)
  const filters: TicketListFilters = {
    type: parseEnumParam(searchParams.get(FILTER_PARAM.type), ticketTypeSchema),
    priority: parseEnumParam(searchParams.get(FILTER_PARAM.priority), ticketPrioritySchema),
    size: parseEnumParam(searchParams.get(FILTER_PARAM.size), ticketSizeSchema),
    area: searchParams.get(FILTER_PARAM.area) ?? undefined,
    createdBy: parseEnumParam(searchParams.get(FILTER_PARAM.createdBy), ticketCreatedBySchema),
    includeWontDo: searchParams.get(FILTER_PARAM.includeWontDo) === 'true',
    search: searchParams.get(FILTER_PARAM.search) ?? undefined,
  }

  if (epic === EPIC_FILTER_NONE) {
    filters.epic = EPIC_FILTER_NONE
  } else if (epic && epic !== EPIC_FILTER_ALL) {
    filters.epic = epic
  }

  return filters
}

const ENUM_FILTER_PARAMS: ReadonlyArray<{
  filterKey: 'type' | 'priority' | 'size' | 'createdBy'
  paramKey: string
  allowed: readonly string[]
}> = [
  { filterKey: 'type', paramKey: FILTER_PARAM.type, allowed: TICKET_TYPES },
  { filterKey: 'priority', paramKey: FILTER_PARAM.priority, allowed: TICKET_PRIORITIES },
  { filterKey: 'size', paramKey: FILTER_PARAM.size, allowed: TICKET_SIZES },
  { filterKey: 'createdBy', paramKey: FILTER_PARAM.createdBy, allowed: TICKET_CREATED_BY },
]

function setEpicFilterParam(params: URLSearchParams, epic: TicketListFilters['epic']): void {
  if (epic === EPIC_FILTER_NONE) {
    params.set(FILTER_PARAM.epic, EPIC_FILTER_NONE)
    return
  }

  if (epic && epic !== EPIC_FILTER_ALL) {
    params.set(FILTER_PARAM.epic, epic)
  }
}

export function filtersToSearchParams(filters: TicketListFilters): URLSearchParams {
  const params = new URLSearchParams()

  for (const { filterKey, paramKey, allowed } of ENUM_FILTER_PARAMS) {
    const value = filters[filterKey]
    if (typeof value === 'string' && allowed.includes(value)) {
      params.set(paramKey, value)
    }
  }

  if (filters.area) params.set(FILTER_PARAM.area, filters.area)
  setEpicFilterParam(params, filters.epic)
  if (filters.includeWontDo) params.set(FILTER_PARAM.includeWontDo, 'true')
  if (filters.search) params.set(FILTER_PARAM.search, filters.search)

  return params
}

export function useTicketFiltersFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams])

  const setFilters = useCallback(
    (next: TicketListFilters) => {
      const ticketId = searchParams.get(TICKET_DETAIL_DRAWER_SEARCH_PARAM)
      const params = filtersToSearchParams(next)
      if (ticketId) params.set(TICKET_DETAIL_DRAWER_SEARCH_PARAM, ticketId)
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  return { filters, setFilters }
}
