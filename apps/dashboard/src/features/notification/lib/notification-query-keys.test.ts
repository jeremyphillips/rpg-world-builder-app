import { describe, expect, it } from 'vitest'

import {
  NOTIFICATION_LIST_LIMIT,
  notificationsInboxQueryKey,
  notificationsInboxRootQueryKey,
  notificationsListQueryKey,
  notificationsQueryKey,
} from './notification-query-keys'

describe('notification query keys', () => {
  it('keeps the inbox infinite-query root separate from the bell list key', () => {
    const bellKey = notificationsListQueryKey(NOTIFICATION_LIST_LIMIT)
    const inboxKey = notificationsInboxQueryKey()

    expect(bellKey[0]).toBe('notifications')
    expect(bellKey[1]).toBe('list')
    expect(inboxKey[0]).toBe('notifications')
    expect(inboxKey[1]).toBe('inbox')
    expect(inboxKey).not.toEqual(bellKey)
    expect(inboxKey).not.toEqual(notificationsQueryKey)
    expect(notificationsInboxRootQueryKey).toEqual(['notifications', 'inbox'])
  })

  it('includes active filter dimensions in inbox query keys', () => {
    expect(notificationsInboxQueryKey({ unread: true, category: 'message' })).toEqual([
      'notifications',
      'inbox',
      { unread: true, category: 'message' },
    ])
  })
})
