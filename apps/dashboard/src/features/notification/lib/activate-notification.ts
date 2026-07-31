import type { Notification } from '@rpg/contracts'

import { resolveNotificationActionPath } from './resolve-notification-action'

export type ActivateNotificationInput = {
  notification: Notification
  markRead: { mutateAsync: (id: string) => Promise<unknown> }
  navigate: (path: string) => void
  onFailure: () => void
  onBeforeNavigate?: () => void
}

export function activateNotification({
  notification,
  markRead,
  navigate,
  onFailure,
  onBeforeNavigate,
}: ActivateNotificationInput): void {
  void markRead.mutateAsync(notification.id).catch(onFailure)

  const path = resolveNotificationActionPath(notification.action)
  if (!path) return

  onBeforeNavigate?.()
  navigate(path)
}
