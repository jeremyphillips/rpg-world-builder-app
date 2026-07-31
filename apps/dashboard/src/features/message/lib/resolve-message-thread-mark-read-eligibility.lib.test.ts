import { describe, expect, it } from 'vitest'

import {
  isIncomingUnreadLatestMessage,
  isMessageThreadMarkReadDocumentEligible,
  resolveMessageThreadMarkReadTrigger,
} from './resolve-message-thread-mark-read-eligibility.lib'

describe('isIncomingUnreadLatestMessage', () => {
  it('returns true for an incoming latest message', () => {
    expect(
      isIncomingUnreadLatestMessage({
        latestMessageSenderUserId: 'user-2',
        currentUserId: 'user-1',
      }),
    ).toBe(true)
  })

  it('returns false when the viewer sent the latest message', () => {
    expect(
      isIncomingUnreadLatestMessage({
        latestMessageSenderUserId: 'user-1',
        currentUserId: 'user-1',
      }),
    ).toBe(false)
  })
})

describe('resolveMessageThreadMarkReadTrigger', () => {
  it('returns initial-open before the first successful mark-read', () => {
    expect(
      resolveMessageThreadMarkReadTrigger({
        hasCompletedInitialOpen: false,
        processedLatestMessageId: null,
        latestMessageId: 'message-1',
      }),
    ).toBe('initial-open')
  })

  it('returns new-inbound when a newer message arrives after initial open', () => {
    expect(
      resolveMessageThreadMarkReadTrigger({
        hasCompletedInitialOpen: true,
        processedLatestMessageId: 'message-1',
        latestMessageId: 'message-2',
      }),
    ).toBe('new-inbound')
  })
})

describe('isMessageThreadMarkReadDocumentEligible', () => {
  it('requires only visibility on initial open', () => {
    expect(
      isMessageThreadMarkReadDocumentEligible({
        trigger: 'initial-open',
        isDocumentVisible: true,
        isDocumentFocused: false,
      }),
    ).toBe(true)
  })

  it('requires visibility and focus for new inbound messages', () => {
    expect(
      isMessageThreadMarkReadDocumentEligible({
        trigger: 'new-inbound',
        isDocumentVisible: true,
        isDocumentFocused: false,
      }),
    ).toBe(false)
  })
})
