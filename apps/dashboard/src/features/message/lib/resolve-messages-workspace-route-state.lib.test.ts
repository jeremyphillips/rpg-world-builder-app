import { describe, expect, it } from 'vitest'

import { resolveMessagesWorkspaceRouteState } from './resolve-messages-workspace-route-state.lib'

describe('resolveMessagesWorkspaceRouteState', () => {
  it('treats the list route as empty-right state without a thread', () => {
    const state = resolveMessagesWorkspaceRouteState({
      search: '',
      isNewRoute: false,
    })

    expect(state).toMatchObject({
      isNewRoute: false,
      isThreadRoute: false,
      routeConversationId: undefined,
      showDirectEmptyRight: true,
      showNewNeutralRight: false,
      showRightOnMobile: false,
      showLeftOnMobile: true,
    })
  })

  it('does not treat the list pathname segment as a conversation id', () => {
    const state = resolveMessagesWorkspaceRouteState({
      search: '?campaignId=camp_1',
      isNewRoute: false,
      conversationId: undefined,
    })

    expect(state.isThreadRoute).toBe(false)
    expect(state.showDirectEmptyRight).toBe(true)
    expect(state.campaignId).toBe('camp_1')
  })

  it('treats the new route as recipient selection without a thread', () => {
    const state = resolveMessagesWorkspaceRouteState({
      search: '?campaignId=camp_1',
      isNewRoute: true,
    })

    expect(state).toMatchObject({
      isNewRoute: true,
      isThreadRoute: false,
      routeConversationId: undefined,
      campaignId: 'camp_1',
      showDirectEmptyRight: false,
      showNewNeutralRight: true,
      showDraftThreadRight: false,
      showRightOnMobile: false,
      showLeftOnMobile: true,
    })
  })

  it('treats the new route with to as a draft thread on mobile', () => {
    const state = resolveMessagesWorkspaceRouteState({
      search: '?to=user_2&campaignId=camp_1',
      isNewRoute: true,
    })

    expect(state).toMatchObject({
      isNewRoute: true,
      toRecipientUserId: 'user_2',
      showDraftThreadRight: true,
      showNewNeutralRight: false,
      showRightOnMobile: true,
      showLeftOnMobile: false,
    })
  })

  it('prefers the new route over a thread param when both are present', () => {
    const state = resolveMessagesWorkspaceRouteState({
      search: '',
      isNewRoute: true,
      conversationId: 'conv_1',
    })

    expect(state).toMatchObject({
      isNewRoute: true,
      isThreadRoute: false,
      routeConversationId: undefined,
      showNewNeutralRight: true,
    })
  })

  it('treats an active thread child route as the right-pane thread', () => {
    const state = resolveMessagesWorkspaceRouteState({
      search: '?campaignId=camp_1',
      isNewRoute: false,
      conversationId: 'conv_1',
    })

    expect(state).toMatchObject({
      isNewRoute: false,
      isThreadRoute: true,
      routeConversationId: 'conv_1',
      activeConversationId: 'conv_1',
      campaignId: 'camp_1',
      showDirectEmptyRight: false,
      showNewNeutralRight: false,
      showRightOnMobile: true,
      showLeftOnMobile: false,
    })
  })

  it('uses from query for preview thread state on the new route', () => {
    const state = resolveMessagesWorkspaceRouteState({
      search: '?from=conv_2&campaignId=camp_1',
      isNewRoute: true,
    })

    expect(state).toMatchObject({
      isNewRoute: true,
      isThreadRoute: false,
      fromConversationId: 'conv_2',
      activeConversationId: 'conv_2',
      showNewNeutralRight: false,
      showDirectEmptyRight: false,
    })
  })
})
