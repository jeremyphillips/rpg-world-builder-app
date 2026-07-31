import type { DirectMessage } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { makeConversation } from '@/test/fixtures/conversations'

import {
  applyConversationEnvelopeToList,
  applyConversationEnvelopeToThread,
} from './conversation-cache'

function makeMessage(overrides: Partial<DirectMessage> = {}): DirectMessage {
  return {
    id: 'message-1',
    conversationId: 'conversation-1',
    senderUserId: 'user-2',
    content: { kind: 'text', text: 'Hello there' },
    createdAt: '2026-07-30T12:00:00.000Z',
    ...overrides,
  }
}

describe('applyConversationEnvelopeToList', () => {
  it('upserts a conversation and reorders by latest activity', () => {
    const result = applyConversationEnvelopeToList(
      {
        items: [
          makeConversation({
            id: 'older',
            latestMessage: {
              messageId: 'message-old',
              senderUserId: 'user-2',
              preview: 'Old',
              createdAt: '2026-07-29T12:00:00.000Z',
            },
            updatedAt: '2026-07-29T12:00:00.000Z',
          }),
        ],
        nextCursor: null,
      },
      {
        conversation: makeConversation({
          id: 'newer',
          latestMessage: {
            messageId: 'message-new',
            senderUserId: 'user-2',
            preview: 'New',
            createdAt: '2026-07-30T12:00:00.000Z',
          },
          updatedAt: '2026-07-30T12:00:00.000Z',
        }),
        version: 1,
      },
    )

    expect(result?.items.map((item) => item.id)).toEqual(['newer', 'older'])
  })

  it('ignores stale envelopes by version', () => {
    const result = applyConversationEnvelopeToList(
      {
        items: [makeConversation({ id: 'conversation-1', unreadCount: 0, version: 3 })],
        nextCursor: null,
      },
      {
        conversation: makeConversation({ id: 'conversation-1', unreadCount: 5, version: 2 }),
        version: 2,
      },
    )

    expect(result?.items[0]?.unreadCount).toBe(0)
  })
})

describe('applyConversationEnvelopeToThread', () => {
  it('prepends a new message to the first page', () => {
    const result = applyConversationEnvelopeToThread(
      {
        pages: [{ items: [makeMessage({ id: 'message-old' })], nextCursor: null }],
        pageParams: [undefined],
      },
      {
        conversation: makeConversation(),
        message: makeMessage({ id: 'message-new', content: { kind: 'text', text: 'New message' } }),
        version: 2,
      },
    )

    expect(result?.pages[0]?.items.map((item) => item.id)).toEqual(['message-new', 'message-old'])
  })

  it('is idempotent on clientMessageId', () => {
    const result = applyConversationEnvelopeToThread(
      {
        pages: [
          {
            items: [
              makeMessage({
                id: 'message-temp',
                clientMessageId: 'client-1',
                content: { kind: 'text', text: 'Draft' },
              }),
            ],
            nextCursor: null,
          },
        ],
        pageParams: [undefined],
      },
      {
        conversation: makeConversation(),
        message: makeMessage({
          id: 'message-final',
          clientMessageId: 'client-1',
          content: { kind: 'text', text: 'Final' },
        }),
        version: 2,
      },
    )

    expect(result?.pages[0]?.items).toHaveLength(1)
    expect(result?.pages[0]?.items[0]?.id).toBe('message-final')
    expect(result?.pages[0]?.items[0]?.content.text).toBe('Final')
  })
})
