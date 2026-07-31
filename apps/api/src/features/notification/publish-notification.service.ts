import type { Notification, NotificationType } from '@rpg/contracts'

import { deliverNotificationUpserted } from '../../realtime'
import {
  countUnreadNotifications,
  previewMateriallyChanged,
  upsertNotificationRecord,
} from './notification.repository'
import { NotificationModel } from './notification.model'
import type { PublishNotificationInput } from './publish-notification.types'
import { formatNotificationPreview, resolveNotificationAction } from './notification.registry'

export async function publishNotification<T extends NotificationType>(
  input: PublishNotificationInput<T>,
): Promise<Notification[]> {
  const preview = formatNotificationPreview(input.type, input.payload)
  const action = resolveNotificationAction(input.type, input.payload)
  const previewWithAction = action ? { ...preview, action } : preview

  const uniqueRecipientIds = [...new Set(input.recipientUserIds)].filter(Boolean)
  if (uniqueRecipientIds.length === 0) return []

  const results: Notification[] = []

  for (const recipientUserId of uniqueRecipientIds) {
    let resetReadState = true

    if (input.dedupeKey) {
      const existing = await NotificationModel.findOne({
        recipientUserId,
        dedupeKey: input.dedupeKey,
      })
        .select('title description action')
        .lean<{
          title: string
          description?: string | null
          action?: Notification['action'] | null
        } | null>()

      if (existing) {
        resetReadState = previewMateriallyChanged(existing, previewWithAction)
      }
    }

    const notification = await upsertNotificationRecord({
      recipientUserId,
      type: input.type,
      payload: input.payload,
      preview: previewWithAction,
      dedupeKey: input.dedupeKey,
      resetReadState,
    })

    results.push(notification)

    try {
      const unreadCount = await countUnreadNotifications(recipientUserId)
      deliverNotificationUpserted({
        userId: recipientUserId,
        notification,
        unreadCount,
      })
    } catch (error) {
      console.error('Failed to deliver notification upsert over realtime.', error)
    }
  }

  return results
}
