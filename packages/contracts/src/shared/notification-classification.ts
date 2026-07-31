import { z } from 'zod'

import { NOTIFICATION_TYPES, type NotificationType } from './notification-types'

export const NOTIFICATION_CATEGORIES = ['campaign', 'message'] as const

export const notificationCategorySchema = z.enum(NOTIFICATION_CATEGORIES)

export type NotificationCategory = z.infer<typeof notificationCategorySchema>

export const NOTIFICATION_CATEGORY_TERM = {
  label: 'Category',
  description: 'High-level grouping for in-app notifications.',
  sentence: {
    singular: 'notification category',
    plural: 'notification categories',
  },
} as const

export const NOTIFICATION_CATEGORY_ENTRIES = {
  campaign: {
    label: 'Campaign',
    description: 'Notifications about campaigns, invites, and party activity.',
    sentence: {
      singular: 'campaign notification',
      plural: 'campaign notifications',
    },
  },
  message: {
    label: 'Message',
    description: 'Notifications about direct messages and conversations.',
    sentence: {
      singular: 'message notification',
      plural: 'message notifications',
    },
  },
} as const satisfies Record<
  NotificationCategory,
  { label: string; description: string; sentence: { singular: string; plural: string } }
>

export const NOTIFICATION_TOPICS = ['campaign_invites', 'direct_messages'] as const

export const notificationTopicSchema = z.enum(NOTIFICATION_TOPICS)

export type NotificationTopic = z.infer<typeof notificationTopicSchema>

export const NOTIFICATION_TOPIC_TERM = {
  label: 'Topic',
  description: 'Finer-grained notification topic used for registry defaults.',
  sentence: {
    singular: 'notification topic',
    plural: 'notification topics',
  },
} as const

export const NOTIFICATION_TOPIC_ENTRIES = {
  campaign_invites: {
    label: 'Campaign invites',
    description: 'Invite lifecycle updates for campaign managers and invitees.',
    sentence: {
      singular: 'campaign invite notification',
      plural: 'campaign invite notifications',
    },
  },
  direct_messages: {
    label: 'Direct messages',
    description: 'New direct message notifications.',
    sentence: {
      singular: 'direct message notification',
      plural: 'direct message notifications',
    },
  },
} as const satisfies Record<
  NotificationTopic,
  { label: string; description: string; sentence: { singular: string; plural: string } }
>

export const NOTIFICATION_PRIORITIES = ['normal'] as const

export const notificationPrioritySchema = z.enum(NOTIFICATION_PRIORITIES)

export type NotificationPriority = z.infer<typeof notificationPrioritySchema>

export const NOTIFICATION_PRIORITY_TERM = {
  label: 'Priority',
  description: 'Relative urgency for notification delivery and display.',
  sentence: {
    singular: 'notification priority',
    plural: 'notification priorities',
  },
} as const

export const NOTIFICATION_PRIORITY_ENTRIES = {
  normal: {
    label: 'Normal',
    description: 'Standard notification priority.',
    sentence: {
      singular: 'normal priority notification',
      plural: 'normal priority notifications',
    },
  },
} as const satisfies Record<
  NotificationPriority,
  { label: string; description: string; sentence: { singular: string; plural: string } }
>

export const NOTIFICATION_CLASSIFICATION_BY_TYPE = {
  'campaign.invite.received': {
    category: 'campaign',
    topic: 'campaign_invites',
    priority: 'normal',
  },
  'campaign.invite.accepted': {
    category: 'campaign',
    topic: 'campaign_invites',
    priority: 'normal',
  },
  'campaign.invite.completed': {
    category: 'campaign',
    topic: 'campaign_invites',
    priority: 'normal',
  },
  'message.direct.received': {
    category: 'message',
    topic: 'direct_messages',
    priority: 'normal',
  },
} as const satisfies Record<
  NotificationType,
  {
    category: NotificationCategory
    topic: NotificationTopic
    priority: NotificationPriority
  }
>

export function getNotificationClassification(type: NotificationType): {
  category: NotificationCategory
  topic: NotificationTopic
  priority: NotificationPriority
} {
  return NOTIFICATION_CLASSIFICATION_BY_TYPE[type]
}

/** Notification types belonging to a category — for list filtering. */
export function getNotificationTypesForCategory(
  category: NotificationCategory,
): NotificationType[] {
  return NOTIFICATION_TYPES.filter(
    (type) => NOTIFICATION_CLASSIFICATION_BY_TYPE[type].category === category,
  )
}

for (const type of NOTIFICATION_TYPES) {
  if (!NOTIFICATION_CLASSIFICATION_BY_TYPE[type]) {
    throw new Error(`Missing notification classification for type: ${type}`)
  }
}
