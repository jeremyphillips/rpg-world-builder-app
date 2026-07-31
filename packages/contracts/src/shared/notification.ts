import { z } from 'zod'

import {
  campaignInviteAcceptedPayloadSchema,
  campaignInviteCompletedPayloadSchema,
  campaignInviteReceivedPayloadSchema,
  messageDirectReceivedPayloadSchema,
} from './notification-payloads'
import { notificationTypeSchema } from './notification-types'

export const NOTIFICATION_ACTION_KINDS = ['campaign_detail', 'conversation_detail'] as const

export const notificationActionKindSchema = z.enum(NOTIFICATION_ACTION_KINDS)

export type NotificationActionKind = z.infer<typeof notificationActionKindSchema>

export const notificationActionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('campaign_detail'),
    campaignId: z.string(),
  }),
  z.object({
    kind: z.literal('conversation_detail'),
    conversationId: z.string(),
  }),
])

export type NotificationAction = z.infer<typeof notificationActionSchema>

const notificationTimestampFields = {
  seenAt: z.iso.datetime().nullable().optional(),
  readAt: z.iso.datetime().nullable().optional(),
  archivedAt: z.iso.datetime().nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  /** Monotonic row revision for HTTP/socket cache guards. */
  version: z.number().int().positive(),
} as const

const notificationPreviewFields = {
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  actorLabel: z.string().optional(),
  subjectLabel: z.string().optional(),
  action: notificationActionSchema.optional(),
  dedupeKey: z.string().optional(),
} as const

export const notificationSchema = z.discriminatedUnion('type', [
  z.object({
    ...notificationPreviewFields,
    ...notificationTimestampFields,
    type: z.literal('campaign.invite.received'),
    payload: campaignInviteReceivedPayloadSchema,
  }),
  z.object({
    ...notificationPreviewFields,
    ...notificationTimestampFields,
    type: z.literal('campaign.invite.accepted'),
    payload: campaignInviteAcceptedPayloadSchema,
  }),
  z.object({
    ...notificationPreviewFields,
    ...notificationTimestampFields,
    type: z.literal('campaign.invite.completed'),
    payload: campaignInviteCompletedPayloadSchema,
  }),
  z.object({
    ...notificationPreviewFields,
    ...notificationTimestampFields,
    type: z.literal('message.direct.received'),
    payload: messageDirectReceivedPayloadSchema,
  }),
])

export type Notification = z.infer<typeof notificationSchema>

export const notificationListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().trim().optional(),
})

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>

export const notificationListResponseSchema = z.object({
  items: z.array(notificationSchema),
  nextCursor: z.string().nullable(),
  unreadCount: z.number().int().nonnegative(),
})

export type NotificationListResponse = z.infer<typeof notificationListResponseSchema>

export const notificationUnreadCountResponseSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
})

export type NotificationUnreadCountResponse = z.infer<typeof notificationUnreadCountResponseSchema>

export const markNotificationsSeenInputSchema = z.object({
  ids: z.array(z.string()).min(1),
})

export type MarkNotificationsSeenInput = z.infer<typeof markNotificationsSeenInputSchema>

export const markNotificationsSeenResponseSchema = z.object({
  updatedCount: z.number().int().nonnegative(),
})

export type MarkNotificationsSeenResponse = z.infer<typeof markNotificationsSeenResponseSchema>

export const markNotificationReadParamsSchema = z.object({
  notificationId: z.string(),
})

export type MarkNotificationReadParams = z.infer<typeof markNotificationReadParamsSchema>

export const markNotificationReadResponseSchema = z.object({
  notification: notificationSchema,
})

export type MarkNotificationReadResponse = z.infer<typeof markNotificationReadResponseSchema>

export const markAllNotificationsReadResponseSchema = z.object({
  updatedCount: z.number().int().nonnegative(),
})

export type MarkAllNotificationsReadResponse = z.infer<
  typeof markAllNotificationsReadResponseSchema
>

export function isNotificationType(value: string): value is z.infer<typeof notificationTypeSchema> {
  return notificationTypeSchema.safeParse(value).success
}
