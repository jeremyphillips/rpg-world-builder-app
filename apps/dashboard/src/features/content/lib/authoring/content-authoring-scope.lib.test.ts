import { describe, expect, it } from 'vitest'

import {
  contentAuthoringCampaignIdForQueries,
  contentAuthoringScopeFromCtx,
  contentEntityArtworkRulesetId,
} from './content-authoring-scope.lib'

describe('contentAuthoringScopeFromCtx', () => {
  it('reports missing_campaign_id when campaign is absent', () => {
    expect(contentAuthoringScopeFromCtx({ rulesetId: 'srd-cc-5.2.1' })).toEqual({
      status: 'unresolved',
      reason: 'missing_campaign_id',
    })
  })

  it('reports missing_ruleset_id when ruleset is absent', () => {
    expect(contentAuthoringScopeFromCtx({ campaignId: 'camp-1' })).toEqual({
      status: 'unresolved',
      reason: 'missing_ruleset_id',
    })
  })

  it('returns campaign-ready when both are set', () => {
    expect(
      contentAuthoringScopeFromCtx({ campaignId: 'camp-1', rulesetId: 'srd-cc-5.2.1' }),
    ).toEqual({
      status: 'campaign-ready',
      campaignId: 'camp-1',
      rulesetId: 'srd-cc-5.2.1',
    })
  })
})

describe('contentAuthoringCampaignIdForQueries', () => {
  it('does not substitute empty string for missing campaign', () => {
    expect(contentAuthoringCampaignIdForQueries({ rulesetId: 'srd-cc-5.2.1' })).toBeUndefined()
  })

  it('passes through campaign id when present', () => {
    expect(
      contentAuthoringCampaignIdForQueries({
        campaignId: 'camp-1',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toBe('camp-1')
  })
})

describe('contentEntityArtworkRulesetId', () => {
  it('prefers entity ruleset over campaign catalog ruleset', () => {
    expect(
      contentEntityArtworkRulesetId({
        entityRulesetId: 'srd-cc-5.2.1',
        rulesetId: 'other-ruleset' as 'srd-cc-5.2.1',
      }),
    ).toBe('srd-cc-5.2.1')
  })
})
