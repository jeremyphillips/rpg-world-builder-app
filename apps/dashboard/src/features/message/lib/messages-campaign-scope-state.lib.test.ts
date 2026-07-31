import { describe, expect, it } from 'vitest'

import {
  isScopedConversationListEmpty,
  resolveOutOfScopeConversation,
} from './messages-campaign-scope-state.lib'

describe('messages-campaign-scope-state.lib', () => {
  it('resolves an out-of-scope active conversation from the unscoped list', () => {
    const scoped = [
      { id: 'in-scope', peer: { userId: 'a', displayName: 'A' }, sharedCampaigns: [] },
    ]
    const unscoped = [
      ...scoped,
      { id: 'out-of-scope', peer: { userId: 'b', displayName: 'B' }, sharedCampaigns: [] },
    ]

    expect(
      resolveOutOfScopeConversation({
        campaignId: 'camp-1',
        scope: { campaignId: 'camp-1', campaignName: 'Camp One' },
        activeConversationId: 'out-of-scope',
        scopedConversations: scoped as never,
        unscopedConversations: unscoped as never,
      }),
    ).toMatchObject({ id: 'out-of-scope' })
  })

  it('detects scoped empty lists', () => {
    expect(
      isScopedConversationListEmpty({
        campaignId: 'camp-1',
        isPending: false,
        isError: false,
        conversationCount: 0,
      }),
    ).toBe(true)
  })
})
