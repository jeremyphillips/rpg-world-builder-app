import { describe, expect, it } from 'vitest'

import { resolveRecipientSharedCampaigns } from './resolve-recipient-shared-campaigns.lib'

describe('resolveRecipientSharedCampaigns', () => {
  it('returns shared campaigns for the recipient sorted by name', () => {
    const campaigns = resolveRecipientSharedCampaigns(
      {
        recipientsByUserId: {},
        existingDirectByUserId: {},
        campaigns: [
          {
            campaignId: 'camp_2',
            campaignName: 'Lost Mine',
            userIds: ['user_2'],
          },
          {
            campaignId: 'camp_1',
            campaignName: 'Curse of Strahd',
            userIds: ['user_2', 'user_3'],
          },
        ],
      },
      'user_2',
    )

    expect(campaigns).toEqual([
      { campaignId: 'camp_1', campaignName: 'Curse of Strahd' },
      { campaignId: 'camp_2', campaignName: 'Lost Mine' },
    ])
  })

  it('returns an empty list when recipients data is missing', () => {
    expect(resolveRecipientSharedCampaigns(undefined, 'user_2')).toEqual([])
  })
})
