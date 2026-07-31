import { describe, expect, it } from 'vitest'

import {
  filterBundlesForCampaignScope,
  isPeerEligibleInCampaignScope,
} from './conversation-campaign-scope.lib'
import type { DirectMessageCampaignBundle } from './direct-message-campaign-context.lib'

function makeBundle(campaignId: string, campaignName: string): DirectMessageCampaignBundle {
  return {
    campaignId,
    campaignName,
    viewerContext: {
      userId: 'viewer-1',
      role: 'owner',
      participationState: 'staff',
    },
    membershipContextsByUserId: new Map([
      [
        'viewer-1',
        {
          userId: 'viewer-1',
          role: 'owner',
          participationState: 'staff',
        },
      ],
      [
        'peer-1',
        {
          userId: 'peer-1',
          role: 'observer',
          participationState: 'observer',
        },
      ],
    ]),
  }
}

describe('conversation-campaign-scope.lib', () => {
  it('filters bundles to a single campaign scope', () => {
    const bundles = [makeBundle('camp-a', 'Alpha'), makeBundle('camp-b', 'Beta')]

    const scoped = filterBundlesForCampaignScope(bundles, 'camp-a')

    expect(scoped.scopeInvalid).toBe(false)
    expect(scoped.scope).toEqual({ campaignId: 'camp-a', campaignName: 'Alpha' })
    expect(scoped.bundles).toHaveLength(1)
  })

  it('marks unknown campaign scope as invalid', () => {
    const scoped = filterBundlesForCampaignScope([makeBundle('camp-a', 'Alpha')], 'missing')

    expect(scoped.scopeInvalid).toBe(true)
    expect(scoped.bundles).toEqual([])
    expect(scoped.scope).toBeNull()
  })

  it('checks peer eligibility within a campaign bundle', () => {
    const bundle = makeBundle('camp-a', 'Alpha')

    expect(isPeerEligibleInCampaignScope(bundle, 'peer-1')).toBe(true)
    expect(isPeerEligibleInCampaignScope(bundle, 'missing-peer')).toBe(false)
  })
})
