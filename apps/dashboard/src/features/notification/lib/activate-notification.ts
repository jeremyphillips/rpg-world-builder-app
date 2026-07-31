import type { Notification } from '@rpg/contracts'

import { resolveNotificationActionPath } from './resolve-notification-action'

export type ActivateNotificationInput = {
  notification: Notification
  markRead: { mutateAsync: (id: string) => Promise<unknown> }
  navigate: (path: string) => void
  onFailure: () => void
  onBeforeNavigate?: () => void
  /** Current inbox/page campaign filter — appended to conversation navigation when present. */
  campaignId?: string
}

export function activateNotification({
  notification,
  markRead,
  navigate,
  onFailure,
  onBeforeNavigate,
  campaignId,
}: ActivateNotificationInput): void {
  void markRead.mutateAsync(notification.id).catch(onFailure)

  const path = resolveNotificationActionPath(notification.action, campaignId)
  if (!path) return

  onBeforeNavigate?.()
  navigate(path)
}
