import { describe, expect, it } from 'vitest'

import { resolveMessagesWorkspaceRightPaneVariant } from './resolve-messages-workspace-right-pane-variant.lib'

describe('resolveMessagesWorkspaceRightPaneVariant', () => {
  it('prefers the active thread over draft and preview states', () => {
    expect(
      resolveMessagesWorkspaceRightPaneVariant({
        isNewRoute: false,
        isThreadRoute: true,
        routeConversationId: 'conv_1',
        showDraftThreadRight: true,
        toRecipientUserId: 'user_2',
        fromConversationId: 'conv_2',
        showNewNeutralRight: true,
        showDirectEmptyRight: false,
      }),
    ).toBe('active-thread')
  })

  it('returns draft-thread when to is present on the new route', () => {
    expect(
      resolveMessagesWorkspaceRightPaneVariant({
        isNewRoute: true,
        isThreadRoute: false,
        showDraftThreadRight: true,
        toRecipientUserId: 'user_2',
        showNewNeutralRight: false,
        showDirectEmptyRight: false,
      }),
    ).toBe('draft-thread')
  })
})
