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

const FILTER_PARAM = {
  type: 'type',
  priority: 'priority',
  size: 'size',
  epic: 'epic',
  area: 'area',
  createdBy: 'createdBy',
  includeWontDo: 'includeWontDo',
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
  }

  if (epic === EPIC_FILTER_NONE) {
    filters.epic = EPIC_FILTER_NONE
  } else if (epic && epic !== EPIC_FILTER_ALL) {
    filters.epic = epic
  }

  return filters
}

export function filtersToSearchParams(filters: TicketListFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.type && TICKET_TYPES.includes(filters.type)) {
    params.set(FILTER_PARAM.type, filters.type)
  }
  if (filters.priority && TICKET_PRIORITIES.includes(filters.priority)) {
    params.set(FILTER_PARAM.priority, filters.priority)
  }
  if (filters.size && TICKET_SIZES.includes(filters.size)) {
    params.set(FILTER_PARAM.size, filters.size)
  }
  if (filters.area) params.set(FILTER_PARAM.area, filters.area)
  if (filters.createdBy && TICKET_CREATED_BY.includes(filters.createdBy)) {
    params.set(FILTER_PARAM.createdBy, filters.createdBy)
  }
  if (filters.epic === EPIC_FILTER_NONE) {
    params.set(FILTER_PARAM.epic, EPIC_FILTER_NONE)
  } else if (filters.epic && filters.epic !== EPIC_FILTER_ALL) {
    params.set(FILTER_PARAM.epic, filters.epic)
  }
  if (filters.includeWontDo) params.set(FILTER_PARAM.includeWontDo, 'true')

  return params
}

export function useTicketFiltersFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams])

  const setFilters = useCallback(
    (next: TicketListFilters) => {
      const ticketId = searchParams.get('ticketId')
      const params = filtersToSearchParams(next)
      if (ticketId) params.set('ticketId', ticketId)
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  return { filters, setFilters }
}
