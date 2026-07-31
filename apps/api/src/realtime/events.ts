import type { Conversation, DirectMessage, Notification } from '@rpg/contracts'

/** Stable Socket.IO event names for transport-focused delivery. */
export const REALTIME_EVENTS = {
  notificationUpserted: 'notification.upserted',
  notificationRead: 'notification.read',
  conversationActivity: 'conversation.activity',
} as const

export type NotificationUpsertedPayload = {
  notification: Notification
  unreadCount: number
  version: number
}

export type NotificationReadPayload =
  | {
      notification: Notification
      unreadCount: number
      version: number
    }
  | {
      notificationIds: string[]
      unreadCount: number
      version: number
    }

export type ConversationActivityPayload = {
  conversation: Conversation
  message?: DirectMessage
  version: number
}
