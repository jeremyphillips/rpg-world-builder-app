import type { Notification } from '@rpg/contracts'

export function listUnseenNotificationIds(items: readonly Notification[]): string[] {
  return items.filter((item) => !item.seenAt).map((item) => item.id)
}
