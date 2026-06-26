import { describe, expect, it } from 'vitest'

import { campaignRulesetPatchSchema } from './campaign-ruleset-patch'

describe('campaignRulesetPatchSchema', () => {
  it('parses a campaign ruleset patch document', () => {
    expect(
      campaignRulesetPatchSchema.safeParse({
        id: 'patch-1',
        campaignId: 'camp-1',
        rulesetId: 'srd-cc-5.2.1',
        vocabulary: [
          {
            setId: 'creature-types',
            systemEntryPatches: [{ id: 'humanoid', label: 'People' }],
            campaignEntries: [{ id: 'robot', label: 'Robot' }],
            removedCampaignEntryIds: ['old-custom'],
          },
        ],
        createdAt: '2024-05-21T00:00:00.000Z',
        updatedAt: '2024-05-21T00:00:00.000Z',
      }).success,
    ).toBe(true)
  })
})
