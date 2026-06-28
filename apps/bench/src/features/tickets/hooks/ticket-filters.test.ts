import { describe, expect, it } from 'vitest'

import {
  EPIC_FILTER_NONE,
  applyClientTicketFilters,
  toTicketListQuery,
} from '../hooks/ticket-query-keys'
import {
  filtersFromSearchParams,
  filtersToSearchParams,
} from '../hooks/use-ticket-filters-from-url'

describe('ticket filter URL sync', () => {
  it('round-trips filter params', () => {
    const filters = {
      type: 'bug' as const,
      priority: 'high' as const,
      size: 's' as const,
      epic: EPIC_FILTER_NONE,
      area: 'ui',
      createdBy: 'user' as const,
      includeWontDo: true,
    }

    const params = filtersToSearchParams(filters)
    expect(filtersFromSearchParams(params)).toEqual(filters)
  })

  it('maps no-epic filter client-side', () => {
    const tickets = [
      { status: 'backlog', epicId: null },
      { status: 'backlog', epicId: 'abc' },
    ]

    expect(
      applyClientTicketFilters(tickets, { epic: EPIC_FILTER_NONE, includeWontDo: true }),
    ).toEqual([{ status: 'backlog', epicId: null }])
  })

  it('defaults backlog status in API query', () => {
    expect(toTicketListQuery({})).toEqual({ status: 'backlog' })
    expect(toTicketListQuery({ includeWontDo: true })).toEqual({})
  })
})
