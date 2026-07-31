import { z } from 'zod'

import { conversationSchema } from './conversation'
import { directMessageSchema } from './direct-message'
import { notificationSchema } from './notification'

/** Stable Socket.IO event names for transport-focused delivery. */
export const REALTIME_EVENTS = {
  notificationUpserted: 'notification.upserted',
  notificationRead: 'notification.read',
  conversationActivity: 'conversation.activity',
} as const

export type RealtimeEventName = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS]

/** Socket.IO attach path on the API HTTP server (same-origin via dev proxy). */
export const SOCKET_IO_PATH = '/api/socket.io'

export const notificationUpsertedPayloadSchema = z.object({
  notification: notificationSchema,
  unreadCount: z.number().int().nonnegative(),
  version: z.number().int().positive(),
})

export type NotificationUpsertedPayload = z.infer<typeof notificationUpsertedPayloadSchema>

export const notificationReadPayloadSchema = z.union([
  z.object({
    notification: notificationSchema,
    unreadCount: z.number().int().nonnegative(),
    version: z.number().int().positive(),
  }),
  z.object({
    notificationIds: z.array(z.string()),
    unreadCount: z.number().int().nonnegative(),
    version: z.number().int().positive(),
  }),
])

export type NotificationReadPayload = z.infer<typeof notificationReadPayloadSchema>

export const conversationActivityPayloadSchema = z.object({
  conversation: conversationSchema,
  message: directMessageSchema.optional(),
  version: z.number().int().positive(),
})

export type ConversationActivityPayload = z.infer<typeof conversationActivityPayloadSchema>
