import { describe, expect, it } from 'vitest'

import {
  resolveCampaignPcMediaScopeKeys,
  serializeMediaScopeKey,
} from './campaign-pc-media-scope.lib'

describe('resolveCampaignPcMediaScopeKeys', () => {
  it('returns paired campaign-pc and owner user-pc keys', () => {
    expect(
      resolveCampaignPcMediaScopeKeys({
        campaignId: 'camp-1',
        characterOwnerUserId: 'user-1',
      }),
    ).toEqual(['campaign-pc:camp-1', 'user-pc:user-1'])
  })

  it('serializes every media scope kind', () => {
    expect(serializeMediaScopeKey({ kind: 'campaign-content', campaignId: 'c1' })).toBe(
      'campaign-content:c1',
    )
    expect(serializeMediaScopeKey({ kind: 'campaign-identity', campaignId: 'c1' })).toBe(
      'campaign-identity:c1',
    )
    expect(serializeMediaScopeKey({ kind: 'campaign-npc', campaignId: 'c1' })).toBe(
      'campaign-npc:c1',
    )
    expect(serializeMediaScopeKey({ kind: 'campaign-pc', campaignId: 'c1' })).toBe('campaign-pc:c1')
    expect(serializeMediaScopeKey({ kind: 'user-pc', userId: 'u1' })).toBe('user-pc:u1')
  })
})
