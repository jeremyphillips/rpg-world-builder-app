import { describe, expect, it } from 'vitest'

import type { Notification } from '@rpg/contracts'

import {
  applyNotificationMarkedRead,
  applyNotificationRead,
  applyNotificationUpserted,
} from './notification-cache'

function makeNotification(
  overrides: Partial<Extract<Notification, { type: 'message.direct.received' }>> = {},
): Notification {
  return {
    id: 'notification-1',
    type: 'message.direct.received',
    title: 'New message',
    payload: {
      conversationId: 'conversation-1',
      messageId: 'message-1',
      senderDisplayName: 'Ava',
      preview: 'Hello',
      unreadMessageCount: 1,
    },
    seenAt: null,
    readAt: null,
    archivedAt: null,
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
    version: 1,
    ...overrides,
  }
}

describe('applyNotificationUpserted', () => {
  it('seeds the bell cache when query data is uninitialized', () => {
    const result = applyNotificationUpserted(undefined, {
      notification: makeNotification({ id: 'a' }),
      unreadCount: 1,
      version: 1,
    })

    expect(result).toEqual({
      items: [makeNotification({ id: 'a' })],
      unreadCount: 1,
      nextCursor: null,
    })
  })

  it('upserts a notification and applies authoritative unreadCount', () => {
    const result = applyNotificationUpserted(
      {
        items: [],
        unreadCount: 0,
        nextCursor: null,
      },
      {
        notification: makeNotification({ id: 'a' }),
        unreadCount: 1,
        version: 1,
      },
    )

    expect(result?.items).toHaveLength(1)
    expect(result?.unreadCount).toBe(1)
  })

  it('ignores stale upserts by version', () => {
    const result = applyNotificationUpserted(
      {
        items: [makeNotification({ id: 'a', version: 3, title: 'Fresh title' })],
        unreadCount: 1,
        nextCursor: null,
      },
      {
        notification: makeNotification({ id: 'a', version: 2, title: 'Stale title' }),
        unreadCount: 5,
        version: 2,
      },
    )

    expect(result?.items[0]?.title).toBe('Fresh title')
    expect(result?.unreadCount).toBe(1)
  })

  it('reorders the bell list by createdAt and keeps the first page cap', () => {
    const result = applyNotificationUpserted(
      {
        items: [
          makeNotification({ id: 'older', createdAt: '2026-01-01T10:00:00.000Z', version: 1 }),
        ],
        unreadCount: 1,
        nextCursor: null,
      },
      {
        notification: makeNotification({
          id: 'newer',
          createdAt: '2026-01-02T10:00:00.000Z',
          version: 1,
        }),
        unreadCount: 2,
        version: 1,
      },
      1,
    )

    expect(result?.items.map((item) => item.id)).toEqual(['newer'])
  })
})

describe('applyNotificationRead', () => {
  it('applies a single read payload with authoritative unreadCount', () => {
    const result = applyNotificationRead(
      {
        items: [makeNotification({ id: 'a', readAt: null })],
        unreadCount: 1,
        nextCursor: null,
      },
      {
        notification: makeNotification({
          id: 'a',
          readAt: '2026-01-02T12:00:00.000Z',
          version: 2,
        }),
        unreadCount: 0,
        version: 2,
      },
    )

    expect(result?.items[0]?.readAt).toBe('2026-01-02T12:00:00.000Z')
    expect(result?.unreadCount).toBe(0)
  })

  it('ignores stale read payloads by version', () => {
    const result = applyNotificationRead(
      {
        items: [
          makeNotification({
            id: 'a',
            readAt: '2026-01-02T12:00:00.000Z',
            version: 3,
          }),
        ],
        unreadCount: 0,
        nextCursor: null,
      },
      {
        notification: makeNotification({
          id: 'a',
          readAt: null,
          version: 2,
        }),
        unreadCount: 1,
        version: 2,
      },
    )

    expect(result?.items[0]?.readAt).toBe('2026-01-02T12:00:00.000Z')
    expect(result?.unreadCount).toBe(0)
  })

  it('applies mark-all read payloads to the bell cache', () => {
    const result = applyNotificationRead(
      {
        items: [
          makeNotification({ id: 'a', readAt: null }),
          makeNotification({ id: 'b', readAt: null }),
        ],
        unreadCount: 2,
        nextCursor: null,
      },
      {
        notificationIds: ['a', 'b'],
        unreadCount: 0,
        version: Date.now(),
      },
    )

    expect(result?.items.every((item) => item.readAt)).toBe(true)
    expect(result?.unreadCount).toBe(0)
  })
})

describe('applyNotificationMarkedRead', () => {
  it('decrements unreadCount for a newly read notification', () => {
    const result = applyNotificationMarkedRead(
      {
        items: [makeNotification({ id: 'a', readAt: null })],
        unreadCount: 1,
        nextCursor: null,
      },
      makeNotification({
        id: 'a',
        readAt: '2026-01-02T12:00:00.000Z',
        version: 2,
      }),
    )

    expect(result?.unreadCount).toBe(0)
  })
})
