import type { Server } from 'socket.io'

import type { Conversation, DirectMessage, Notification } from '@rpg/contracts'

import {
  REALTIME_EVENTS,
  type ConversationActivityPayload,
  type NotificationReadPayload,
  type NotificationUpsertedPayload,
} from './events'
import { logRealtimeDeliveryFailure } from './logging'
import { userRoom } from './rooms'

let io: Server | null = null

/** Registers the sole Socket.IO emit path for post-persistence delivery. */
export function registerRealtimeServer(server: Server): void {
  io = server
}

export function resetRealtimeServerForTests(): void {
  io = null
}

/** Sole emit path — domain code must call delivery helpers instead of `io.to`. */
export function deliverToUser(userId: string, event: string, payload: unknown): void {
  if (!io) return

  try {
    io.to(userRoom(userId)).emit(event, payload)
  } catch (error) {
    logRealtimeDeliveryFailure({ userId, event }, error)
  }
}

export function deliverNotificationUpserted(input: {
  userId: string
  notification: Notification
  unreadCount: number
}): void {
  const payload: NotificationUpsertedPayload = {
    notification: input.notification,
    unreadCount: input.unreadCount,
    version: input.notification.version,
  }
  deliverToUser(input.userId, REALTIME_EVENTS.notificationUpserted, payload)
}

export function deliverNotificationRead(input: NotificationReadPayload & { userId: string }): void {
  const { userId, ...payload } = input
  deliverToUser(userId, REALTIME_EVENTS.notificationRead, payload)
}

export function deliverConversationActivity(input: {
  userId: string
  conversation: Conversation
  message?: DirectMessage
}): void {
  const payload: ConversationActivityPayload = {
    conversation: input.conversation,
    ...(input.message ? { message: input.message } : {}),
    version: input.conversation.version,
  }
  deliverToUser(input.userId, REALTIME_EVENTS.conversationActivity, payload)
}
