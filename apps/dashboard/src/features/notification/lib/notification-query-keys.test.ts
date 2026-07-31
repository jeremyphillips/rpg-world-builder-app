import { describe, expect, it } from 'vitest'

import {
  NOTIFICATION_LIST_LIMIT,
  notificationsInboxQueryKey,
  notificationsListQueryKey,
  notificationsQueryKey,
} from './notification-query-keys'

describe('notification query keys', () => {
  it('keeps the inbox infinite-query root separate from the bell list key', () => {
    const bellKey = notificationsListQueryKey(NOTIFICATION_LIST_LIMIT)
    expect(bellKey[0]).toBe('notifications')
    expect(bellKey[1]).toBe('list')
    expect(notificationsInboxQueryKey[0]).toBe('notifications')
    expect(notificationsInboxQueryKey[1]).toBe('inbox')
    expect(notificationsInboxQueryKey).not.toEqual(bellKey)
    expect(notificationsInboxQueryKey).not.toEqual(notificationsQueryKey)
  })
})
