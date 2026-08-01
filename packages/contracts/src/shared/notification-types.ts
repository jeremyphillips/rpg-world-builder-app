import { z } from 'zod'

/** Canonical in-app notification type inventory. */
export const NOTIFICATION_TYPES = [
  'campaign.invite.received',
  'campaign.invite.cancelled',
  'campaign.invite.accepted',
  'campaign.invite.completed',
  'campaign.member.removed',
  'message.direct.received',
] as const

export const notificationTypeSchema = z.enum(NOTIFICATION_TYPES)

export type NotificationType = z.infer<typeof notificationTypeSchema>
