import { z } from 'zod'

import type { NotificationType } from './notification-types'
import { NOTIFICATION_TYPES } from './notification-types'
import { DIRECT_MESSAGE_PREVIEW_MAX_LENGTH } from './direct-message'

export const campaignInviteReceivedPayloadSchema = z.object({
  inviteId: z.string(),
  campaignId: z.string(),
  campaignName: z.string(),
  inviterDisplayName: z.string(),
})

export const campaignInviteAcceptedPayloadSchema = z.object({
  inviteId: z.string(),
  campaignId: z.string(),
  campaignName: z.string(),
  acceptedByDisplayName: z.string(),
})

export const campaignInviteCompletedPayloadSchema = z.object({
  inviteId: z.string(),
  campaignId: z.string(),
  campaignName: z.string(),
  completedByDisplayName: z.string(),
  characterId: z.string().optional(),
})

export const messageDirectReceivedPayloadSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  senderDisplayName: z.string(),
  preview: z.string().max(DIRECT_MESSAGE_PREVIEW_MAX_LENGTH),
  unreadMessageCount: z.number().int().positive(),
})

export const NOTIFICATION_PAYLOAD_SCHEMAS = {
  'campaign.invite.received': campaignInviteReceivedPayloadSchema,
  'campaign.invite.accepted': campaignInviteAcceptedPayloadSchema,
  'campaign.invite.completed': campaignInviteCompletedPayloadSchema,
  'message.direct.received': messageDirectReceivedPayloadSchema,
} as const satisfies Record<NotificationType, z.ZodType>

export type NotificationPayloadByType = {
  [K in NotificationType]: z.infer<(typeof NOTIFICATION_PAYLOAD_SCHEMAS)[K]>
}

export function notificationPayloadSchemaForType<T extends NotificationType>(
  type: T,
): (typeof NOTIFICATION_PAYLOAD_SCHEMAS)[T] {
  return NOTIFICATION_PAYLOAD_SCHEMAS[type]
}

export const notificationPayloadSchemaKeys = NOTIFICATION_TYPES
