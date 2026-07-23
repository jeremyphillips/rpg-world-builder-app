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
    ).toEqual({
      status: { label: 'Available', tone: 'success', indicator: 'dot' },
      detail: 'All players',
    })
  })

  it('summarizes available dm-only access', () => {
    expect(
      resolveCampaignAccessSummary({
        available: true,
        visibilityMode: 'dm_only',
        participantIds: [],
      }),
    ).toEqual({
      status: { label: 'Available', tone: 'success', indicator: 'dot' },
      detail: 'DM only',
    })
  })

  it('summarizes available specific-players access with participant count', () => {
    expect(
      resolveCampaignAccessSummary({
        available: true,
        visibilityMode: 'specific_players',
        participantIds: ['p-1', 'p-2', 'p-3'],
      }),
    ).toEqual({
      status: { label: 'Available', tone: 'success', indicator: 'dot' },
      detail: '3 specific players',
    })
  })

  it('uses singular copy for one specific player', () => {
    expect(
      resolveCampaignAccessSummary({
        available: true,
        visibilityMode: 'specific_players',
        participantIds: ['p-1'],
      }),
    ).toEqual({
      status: { label: 'Available', tone: 'success', indicator: 'dot' },
      detail: '1 specific player',
    })
  })

  it('summarizes unavailable access with preserved detail and faint warning accent chrome', () => {
    expect(
      resolveCampaignAccessSummary({
        available: false,
        visibilityMode: 'dm_only',
        participantIds: [],
      }),
    ).toEqual({
      status: { label: 'Unavailable', tone: 'warning', indicator: 'inactive' },
      detail: 'DM only',
      secondary: 'Hidden from discovery and selection in this campaign.',
      chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' },
    })
  })
})
