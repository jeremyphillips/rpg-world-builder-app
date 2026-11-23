import { describe, expect, it } from 'vitest'

import type { Campaign } from '@rpg/contracts'

import { lookupCampaignRulesetId } from './campaign-ruleset.lib'

const baseCampaign = {
  id: 'campaign-1',
  rulesetId: 'srd-cc-5.2.1',
} as Campaign

describe('lookupCampaignRulesetId', () => {
  it('does not default when campaign list is loading', () => {
    expect(
      lookupCampaignRulesetId({
        campaignId: 'campaign-1',
        campaigns: undefined,
        campaignsPending: true,
        campaignsError: false,
      }),
    ).toEqual({ status: 'unresolved', reason: 'loading' })
  })

  it('resolves ruleset from the campaign record', () => {
    expect(
      lookupCampaignRulesetId({
        campaignId: 'campaign-1',
        campaigns: [baseCampaign],
        campaignsPending: false,
        campaignsError: false,
      }),
    ).toEqual({ status: 'resolved', rulesetId: 'srd-cc-5.2.1' })
  })
})
