import { describe, expect, it } from 'vitest'

import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  CAMPAIGN_AVAILABILITY_FILTER_VALUES,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  contentCampaignAccessPatchSchema,
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

  it('splits stale participant ids when valid roster ids are provided', () => {
    const resolved = resolveContentCampaignAccess(
      {
        available: true,
        visibilityMode: 'specific_players',
        participantIds: ['pc-1', 'stale-pc'],
      },
      { validParticipantIds: ['pc-1'] },
    )

    expect(resolved.participantIds).toEqual(['pc-1'])
    expect(resolved.unavailableParticipantIds).toEqual(['stale-pc'])
  })

  it('parses resolved schema shape', () => {
    expect(resolvedContentCampaignAccessSchema.parse(DEFAULT_CONTENT_CAMPAIGN_ACCESS)).toEqual(
      DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    )
  })
})

describe('contentCampaignAccessPatchSchema', () => {
  it('requires at least one participant for specific_players', () => {
    const result = contentCampaignAccessPatchSchema.safeParse({
      available: true,
      visibilityMode: 'specific_players',
      participantIds: [],
    })

    expect(result.success).toBe(false)
  })

  it('normalizes participantIds to an empty array for non-specific modes', () => {
    expect(
      contentCampaignAccessPatchSchema.parse({
        available: true,
        visibilityMode: 'all_players',
        participantIds: ['pc-1'],
      }),
    ).toEqual({
      available: true,
      visibilityMode: 'all_players',
      participantIds: [],
    })
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
