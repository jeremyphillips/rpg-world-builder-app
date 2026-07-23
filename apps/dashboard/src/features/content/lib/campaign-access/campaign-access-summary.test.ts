import { describe, expect, it } from 'vitest'

import { resolveCampaignAccessSummary } from './campaign-access-summary'

describe('resolveCampaignAccessSummary', () => {
  it('summarizes available all-players access', () => {
    expect(
      resolveCampaignAccessSummary({
        available: true,
        visibilityMode: 'all_players',
        participantIds: [],
      }),
    ).toEqual({ primary: 'Available · All players' })
  })

  it('summarizes available dm-only access', () => {
    expect(
      resolveCampaignAccessSummary({
        available: true,
        visibilityMode: 'dm_only',
        participantIds: [],
      }),
    ).toEqual({ primary: 'Available · DM only' })
  })

  it('summarizes available specific-players access with participant count', () => {
    expect(
      resolveCampaignAccessSummary({
        available: true,
        visibilityMode: 'specific_players',
        participantIds: ['p-1', 'p-2', 'p-3'],
      }),
    ).toEqual({ primary: 'Available · 3 specific players' })
  })

  it('uses singular copy for one specific player', () => {
    expect(
      resolveCampaignAccessSummary({
        available: true,
        visibilityMode: 'specific_players',
        participantIds: ['p-1'],
      }),
    ).toEqual({ primary: 'Available · 1 specific player' })
  })

  it('summarizes unavailable access without effective visibility in primary', () => {
    expect(
      resolveCampaignAccessSummary({
        available: false,
        visibilityMode: 'dm_only',
        participantIds: [],
      }),
    ).toEqual({
      primary: 'Unavailable',
      secondary: 'This content cannot be discovered or selected in this campaign.',
    })
  })
})
