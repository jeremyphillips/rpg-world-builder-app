export const notificationsQueryKey = ['notifications', 'list'] as const

export const NOTIFICATION_LIST_LIMIT = 10

export const notificationsListQueryKey = (limit: number) =>
  [...notificationsQueryKey, { limit }] as const
