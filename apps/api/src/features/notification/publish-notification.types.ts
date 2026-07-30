import type { NotificationPayloadByType, NotificationType } from '@rpg/contracts'

export type PublishNotificationInput<T extends NotificationType = NotificationType> = {
  type: T
  recipientUserIds: string[]
  payload: NotificationPayloadByType[T]
  dedupeKey?: string
}
