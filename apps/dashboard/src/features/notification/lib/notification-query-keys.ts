export const notificationsQueryKey = ['notifications', 'list'] as const

export const notificationsListQueryKey = (limit: number) =>
  [...notificationsQueryKey, { limit }] as const
