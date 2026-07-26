import { describe, expect, it } from 'vitest'

import { CampaignInviteModel } from './campaign-invite.model'

describe('campaign invite model indexes', () => {
  it('declares token hash and active-email uniqueness indexes', () => {
    const indexes = CampaignInviteModel.schema.indexes()

    expect(indexes).toEqual(
      expect.arrayContaining([
        [{ tokenHash: 1 }, { unique: true }],
        [
          { campaignId: 1, normalizedEmail: 1 },
          expect.objectContaining({
            unique: true,
            partialFilterExpression: { status: { $in: ['pending', 'accepted'] } },
          }),
        ],
      ]),
    )
  })
})
