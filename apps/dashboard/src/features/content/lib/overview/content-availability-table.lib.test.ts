import { describe, expect, it } from 'vitest'

import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ResolvedContentCampaignAccess,
  type WithCampaignAccess,
} from '@rpg/contracts'

import type { ContentBase } from './content-table-config'
import {
  campaignAvailabilityFilterFn,
  deriveCampaignAvailabilityScope,
  filterContentRows,
  matchesContentOverviewFilters,
} from './content-availability-table.lib'

type TestRow = WithCampaignAccess<ContentBase & { id: string }>

function row(
  id: string,
  name: string,
  campaignAccess: Partial<ResolvedContentCampaignAccess> = {},
): TestRow {
  return {
    id,
    name,
    source: 'system',
    status: 'published',
    campaignAccess: {
      ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      ...campaignAccess,
      effectiveAudience:
        campaignAccess.available === false
          ? 'none'
          : (campaignAccess.visibilityMode ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS.visibilityMode),
    },
  }
}

const DATA: TestRow[] = [
  row('1', 'Wizard', { available: true }),
  row('2', 'Warlock', { available: false, visibilityMode: 'dm_only' }),
  row('3', 'Sorcerer', { available: true, visibilityMode: 'dm_only' }),
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

describe('filterContentRows', () => {
  it('excludes unavailable rows by default scope', () => {
    const visible = filterContentRows(DATA, { campaignAvailability: 'available' })
    expect(visible.map((item) => item.name)).toEqual(['Wizard', 'Sorcerer'])
  })

  it('respects name search within scoped rows', () => {
    const visible = filterContentRows(DATA, {
      name: 'wiz',
      campaignAvailability: 'all',
    })

    expect(visible.map((item) => item.name)).toEqual(['Wizard'])
  })

  it('can exclude campaign availability for hidden-count scope', () => {
    const scoped = filterContentRows(
      DATA,
      { campaignAvailability: 'available' },
      { excludeCampaignAvailability: true },
    )

    expect(scoped.map((item) => item.name)).toEqual(['Wizard', 'Warlock', 'Sorcerer'])
  })
})

describe('deriveCampaignAvailabilityScope', () => {
  it('derives counts from the same scoped rows used by notices and empty states', () => {
    const scoped = filterContentRows(
      DATA,
      { campaignAvailability: 'available' },
      { excludeCampaignAvailability: true },
    )

    expect(deriveCampaignAvailabilityScope(scoped, { campaignAvailability: 'available' })).toEqual({
      availableCount: 2,
      unavailableCount: 1,
      visibleCount: 2,
    })
  })
})

describe('matchesContentOverviewFilters', () => {
  it('matches source and status filters', () => {
    const target = row('1', 'Wizard', { available: true })
    expect(
      matchesContentOverviewFilters(target, {
        source: 'system',
        status: 'published',
        campaignAvailability: 'all',
      }),
    ).toBe(true)
    expect(
      matchesContentOverviewFilters(target, {
        source: 'homebrew',
        campaignAvailability: 'all',
      }),
    ).toBe(false)
  })
})
