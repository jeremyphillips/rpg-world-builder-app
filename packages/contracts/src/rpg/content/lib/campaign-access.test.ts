import { describe, expect, it } from 'vitest'

import { CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED } from './content-access-capabilities'
import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  CAMPAIGN_AVAILABILITY_FILTER_VALUES,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  resolveContentCampaignAccess,
  resolvedContentCampaignAccessSchema,
  type WithCampaignAccess,
} from './campaign-access'

describe('resolveContentCampaignAccess', () => {
  it('returns defaults when no stored record exists', () => {
    expect(resolveContentCampaignAccess(null)).toEqual(DEFAULT_CONTENT_CAMPAIGN_ACCESS)
    expect(resolveContentCampaignAccess(undefined)).toEqual(DEFAULT_CONTENT_CAMPAIGN_ACCESS)
  })

  it('derives effectiveAudience from availability and visibility mode', () => {
    expect(
      resolveContentCampaignAccess({
        available: true,
        visibilityMode: 'dm_only',
        participantIds: [],
      }).effectiveAudience,
    ).toBe('dm_only')

    expect(
      resolveContentCampaignAccess({
        available: false,
        visibilityMode: 'all_players',
        participantIds: [],
      }).effectiveAudience,
    ).toBe('none')
  })

  it('preserves visibility mode when unavailable', () => {
    const resolved = resolveContentCampaignAccess({
      available: false,
      visibilityMode: 'specific_players',
      participantIds: ['participant-1'],
    })

    expect(resolved.visibilityMode).toBe('specific_players')
    expect(resolved.participantIds).toEqual(['participant-1'])
    expect(resolved.effectiveAudience).toBe('none')
    expect(resolved.unavailableParticipantIds).toEqual([])
  })

  it('parses resolved schema shape', () => {
    expect(resolvedContentCampaignAccessSchema.parse(DEFAULT_CONTENT_CAMPAIGN_ACCESS)).toEqual(
      DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    )
  })
})

describe('CampaignAvailabilityFilter', () => {
  it('defines canonical filter values with available as default', () => {
    expect(CAMPAIGN_AVAILABILITY_FILTER_VALUES).toEqual(['available', 'unavailable', 'all'])
    expect(CAMPAIGN_AVAILABILITY_FILTER_DEFAULT).toBe('available')
  })
})

describe('WithCampaignAccess', () => {
  it('composes campaign access onto a base row type', () => {
    type BaseRow = { id: string; name: string }
    const row: WithCampaignAccess<BaseRow> = {
      id: 'class-1',
      name: 'Wizard',
      campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    }

    expect(row.campaignAccess.available).toBe(true)
  })
})

describe('CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED', () => {
  it('is disabled until the participant system ships', () => {
    expect(CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED).toBe(false)
  })
})
