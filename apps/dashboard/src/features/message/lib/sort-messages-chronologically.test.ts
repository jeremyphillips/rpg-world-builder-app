import { describe, expect, it } from 'vitest'

import {
  flattenConversationMessages,
  sortMessagesChronologically,
} from './sort-messages-chronologically'

describe('sortMessagesChronologically', () => {
  it('orders messages by createdAt and id when timestamps match', () => {
    const sorted = sortMessagesChronologically([
      {
        id: 'b',
        conversationId: 'conversation-1',
        senderUserId: 'user-1',
        content: { kind: 'text', text: 'Second' },
        createdAt: '2026-01-01T12:00:00.000Z',
      },
      {
        id: 'a',
        conversationId: 'conversation-1',
        senderUserId: 'user-2',
        content: { kind: 'text', text: 'First' },
        createdAt: '2026-01-01T11:00:00.000Z',
      },
      {
        id: 'c',
        conversationId: 'conversation-1',
        senderUserId: 'user-1',
        content: { kind: 'text', text: 'Tie-break' },
        createdAt: '2026-01-01T12:00:00.000Z',
      },
    ])

    expect(sorted.map((message) => message.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('flattenConversationMessages', () => {
  it('flattens newest-first API pages into chronological order', () => {
    const messages = flattenConversationMessages([
      {
        items: [
          {
            id: 'newer',
            conversationId: 'conversation-1',
            senderUserId: 'user-1',
            content: { kind: 'text', text: 'Newer page' },
            createdAt: '2026-01-02T12:00:00.000Z',
          },
        ],
      },
      {
        items: [
          {
            id: 'older',
            conversationId: 'conversation-1',
            senderUserId: 'user-2',
            content: { kind: 'text', text: 'Older page' },
            createdAt: '2026-01-01T12:00:00.000Z',
          },
        ],
      },
    ])

    expect(messages.map((message) => message.id)).toEqual(['older', 'newer'])
  })
})
