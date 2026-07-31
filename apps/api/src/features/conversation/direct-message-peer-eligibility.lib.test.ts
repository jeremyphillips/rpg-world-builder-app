import { describe, expect, it } from 'vitest'

import {
  isEligibleDirectMessagePeerInSharedCampaign,
  type DirectMessageMembershipContext,
} from './direct-message-peer-eligibility.lib'

function context(
  overrides: Partial<DirectMessageMembershipContext> = {},
): DirectMessageMembershipContext {
  return {
    userId: 'user-1',
    role: 'pc',
    participationState: 'active',
    ...overrides,
  }
}

describe('isEligibleDirectMessagePeerInSharedCampaign', () => {
  it('allows campaign managers to message any current member', () => {
    expect(
      isEligibleDirectMessagePeerInSharedCampaign(
        context({ role: 'owner', participationState: 'staff' }),
        context({ participationState: 'none' }),
      ),
    ).toBe(true)
  })

  it('allows messaging staff and observer peers', () => {
    expect(
      isEligibleDirectMessagePeerInSharedCampaign(
        context({ participationState: 'observer' }),
        context({ participationState: 'staff' }),
      ),
    ).toBe(true)

    expect(
      isEligibleDirectMessagePeerInSharedCampaign(
        context({ participationState: 'observer' }),
        context({ participationState: 'observer' }),
      ),
    ).toBe(true)
  })

  it('requires active participation for PC-to-PC messaging', () => {
    expect(
      isEligibleDirectMessagePeerInSharedCampaign(
        context({ participationState: 'active' }),
        context({ participationState: 'active' }),
      ),
    ).toBe(true)

    expect(
      isEligibleDirectMessagePeerInSharedCampaign(
        context({ participationState: 'observer' }),
        context({ participationState: 'active' }),
      ),
    ).toBe(false)
  })

  it('rejects non-staff peers without an eligible participation state', () => {
    expect(
      isEligibleDirectMessagePeerInSharedCampaign(
        context({ participationState: 'active' }),
        context({ participationState: 'none' }),
      ),
    ).toBe(false)
  })
})
