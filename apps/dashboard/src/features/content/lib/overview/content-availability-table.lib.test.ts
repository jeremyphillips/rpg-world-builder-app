import { describe, expect, it } from 'vitest'

import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ResolvedContentCampaignAccess,
  type WithCampaignAccess,
} from '@rpg/contracts'

import { mergeContentListOverviewRows } from '../list/create-content-list'

import type { ContentBase } from './content-table-config'
import {
  campaignAvailabilityFilterFn,
  contentRowPassesCampaignAvailabilityFilter,
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
    catalogLayer: 'system',
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

const OVERLAY_FAILURE = mergeContentListOverviewRows(
  [row('9', 'Healthy', { available: true })],
  [
    {
      targetId: 'class-broken',
      slug: 'broken-class',
      name: 'Broken Class',
      code: 'unsupported_overlay_version',
      message: 'System overlay patch is missing a supported version.',
    },
  ],
)[1] as TestRow

describe('contentRowPassesCampaignAvailabilityFilter', () => {
  it('keeps overlay failure rows visible on the default available filter', () => {
    expect(contentRowPassesCampaignAvailabilityFilter(OVERLAY_FAILURE, 'available')).toBe(true)
    expect(contentRowPassesCampaignAvailabilityFilter(OVERLAY_FAILURE, 'all')).toBe(true)
    expect(contentRowPassesCampaignAvailabilityFilter(OVERLAY_FAILURE, 'unavailable')).toBe(false)
  })

  it('still treats unavailable campaign rows as hidden on the available filter', () => {
    const unavailable = row('2', 'Warlock', { available: false })
    expect(contentRowPassesCampaignAvailabilityFilter(unavailable, 'available')).toBe(false)
  })
})

describe('filterContentRows with overlay failures', () => {
  it('shows overlay failures alongside available rows by default', () => {
    const rows = [...DATA, OVERLAY_FAILURE]
    const visible = filterContentRows(rows, { campaignAvailability: 'available' })
    expect(visible.map((item) => item.name)).toEqual(['Wizard', 'Sorcerer', 'Broken Class'])
  })

  it('hides overlay failures from the unavailable-only filter', () => {
    const rows = [...DATA, OVERLAY_FAILURE]
    const visible = filterContentRows(rows, { campaignAvailability: 'unavailable' })
    expect(visible.map((item) => item.name)).toEqual(['Warlock'])
  })
})

describe('deriveCampaignAvailabilityScope with overlay failures', () => {
  it('does not count overlay failures toward unavailable campaign rows', () => {
    const rows = [...DATA, OVERLAY_FAILURE]
    const scoped = filterContentRows(
      rows,
      { campaignAvailability: 'available' },
      { excludeCampaignAvailability: true },
    )

    expect(deriveCampaignAvailabilityScope(scoped, { campaignAvailability: 'available' })).toEqual({
      availableCount: 2,
      unavailableCount: 1,
      visibleCount: 3,
    })
  })
})

describe('matchesContentOverviewFilters', () => {
  it('matches source and status filters', () => {
    const target = row('1', 'Wizard', { available: true })
    expect(
      matchesContentOverviewFilters(target, {
        catalogLayer: 'system',
        status: 'published',
        campaignAvailability: 'all',
      }),
    ).toBe(true)
    expect(
      matchesContentOverviewFilters(target, {
        catalogLayer: 'homebrew',
        campaignAvailability: 'all',
      }),
    ).toBe(false)
  })
})
