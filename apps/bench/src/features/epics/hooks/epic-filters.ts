import type { Epic, EpicStatus } from '@rpg/contracts/dev-bench'
import { EPIC_STATUSES, epicStatusSchema } from '@rpg/contracts/dev-bench'

import type { EpicListFilters } from './epic-query-keys'

const FILTER_PARAM = {
  status: 'status',
  area: 'area',
} as const

function parseStatusParam(value: string | null): EpicStatus | undefined {
  if (!value) return undefined
  const parsed = epicStatusSchema.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

export function filtersFromSearchParams(searchParams: URLSearchParams): EpicListFilters {
  return {
    status: parseStatusParam(searchParams.get(FILTER_PARAM.status)),
    area: searchParams.get(FILTER_PARAM.area) ?? undefined,
  }
}

export function filtersToSearchParams(filters: EpicListFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.status && EPIC_STATUSES.includes(filters.status)) {
    params.set(FILTER_PARAM.status, filters.status)
  }
  if (filters.area) params.set(FILTER_PARAM.area, filters.area)

  return params
}

export function applyEpicFilters(epics: Epic[], filters: EpicListFilters): Epic[] {
  return epics.filter((epic) => {
    if (filters.status && epic.status !== filters.status) return false
    if (filters.area && epic.area !== filters.area) return false
    return true
  })
}
