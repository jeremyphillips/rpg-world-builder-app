import { describe, expect, it } from 'vitest'

import {
  campaignAvailabilityFilterFn,
  deriveCampaignAvailabilityScope,
} from './campaign-availability-scope.lib'

type StatusRow = {
  id: string
  status: 'active' | 'disabled'
}

const DATA: StatusRow[] = [
  { id: '1', status: 'active' },
  { id: '2', status: 'disabled' },
  { id: '3', status: 'active' },
]

describe('campaignAvailabilityFilterFn', () => {
  it('filters by availability state', () => {
    expect(campaignAvailabilityFilterFn(true, 'all')).toBe(true)
    expect(campaignAvailabilityFilterFn(false, 'all')).toBe(true)
    expect(campaignAvailabilityFilterFn(true, 'available')).toBe(true)
    expect(campaignAvailabilityFilterFn(false, 'available')).toBe(false)
    expect(campaignAvailabilityFilterFn(true, 'unavailable')).toBe(false)
    expect(campaignAvailabilityFilterFn(false, 'unavailable')).toBe(true)
  })
})

describe('deriveCampaignAvailabilityScope', () => {
  it('derives counts from injectable isAvailable predicate', () => {
    expect(
      deriveCampaignAvailabilityScope(DATA, {
        isAvailable: (row) => row.status === 'active',
        filterValue: 'available',
      }),
    ).toEqual({
      availableCount: 2,
      unavailableCount: 1,
      visibleCount: 2,
    })
  })
})
