import { describe, expect, it } from 'vitest'

import {
  resolveDirectListVisibility,
  shouldShowLoadedScopeHint,
} from './messages-direct-list-presentation.lib'

describe('messages-direct-list-presentation', () => {
  it('shows loaded scope hints only when more conversations exist server-side', () => {
    expect(
      shouldShowLoadedScopeHint({
        scope: { campaignId: 'c1', campaignName: 'Stormwatch' },
        hasMoreConversations: true,
        scopedCount: 42,
        loadedCount: 20,
      }),
    ).toBe(true)

    expect(
      shouldShowLoadedScopeHint({
        scope: { campaignId: 'c1', campaignName: 'Stormwatch' },
        hasMoreConversations: false,
        scopedCount: 12,
        loadedCount: 12,
      }),
    ).toBe(false)
  })

  it('resolves empty and list visibility', () => {
    expect(
      resolveDirectListVisibility({
        isPending: false,
        isError: false,
        conversationCount: 0,
        hasOutOfScopeConversation: false,
      }),
    ).toEqual({ showEmptyState: true, showConversationList: false })

    expect(
      resolveDirectListVisibility({
        isPending: false,
        isError: false,
        conversationCount: 2,
        hasOutOfScopeConversation: true,
      }),
    ).toEqual({ showEmptyState: false, showConversationList: true })
  })
})
