export const notificationsQueryKey = ['notifications', 'list'] as const

export const NOTIFICATION_LIST_LIMIT = 10

export const notificationsListQueryKey = (limit: number) =>
  [...notificationsQueryKey, { limit }] as const

/** Infinite-query inbox cache — separate from the bell's finite first-page shape. */
export const notificationsInboxQueryKey = ['notifications', 'inbox'] as const

export const NOTIFICATION_INBOX_PAGE_LIMIT = 20
