import type {
  NotificationAction,
  NotificationPayloadByType,
  NotificationType,
} from '@rpg/contracts'
import { getNotificationClassification, notificationPayloadSchemaForType } from '@rpg/contracts'

export type NotificationPreviewSnapshot = {
  title: string
  description?: string
  actorLabel?: string
  subjectLabel?: string
  action?: NotificationAction
}

type NotificationRegistryDefinition<T extends NotificationType> = {
  formatPreview: (payload: NotificationPayloadByType[T]) => NotificationPreviewSnapshot
  resolveAction: (payload: NotificationPayloadByType[T]) => NotificationAction | undefined
}

const registry = {
  'campaign.invite.received': {
    formatPreview: (payload) => ({
      title: 'Campaign invitation',
      description: `${payload.inviterDisplayName} invited you to join ${payload.campaignName}. Open the invite email to accept.`,
      actorLabel: payload.inviterDisplayName,
      subjectLabel: payload.campaignName,
    }),
    resolveAction: () => undefined,
  },
  'campaign.invite.accepted': {
    formatPreview: (payload) => ({
      title: 'Invitation accepted',
      description: `${payload.acceptedByDisplayName} accepted your invitation to ${payload.campaignName}.`,
      actorLabel: payload.acceptedByDisplayName,
      subjectLabel: payload.campaignName,
    }),
    resolveAction: (payload) => ({
      kind: 'campaign_detail',
      campaignId: payload.campaignId,
    }),
  },
  'campaign.invite.completed': {
    formatPreview: (payload) => ({
      title: 'Character ready',
      description: `${payload.completedByDisplayName} finished setting up their character in ${payload.campaignName}.`,
      actorLabel: payload.completedByDisplayName,
      subjectLabel: payload.campaignName,
    }),
    resolveAction: (payload) => ({
      kind: 'campaign_detail',
      campaignId: payload.campaignId,
    }),
  },
  'message.direct.received': {
    formatPreview: (payload) => {
      if (payload.unreadMessageCount === 1) {
        return {
          title: 'New message',
          description: `${payload.senderDisplayName}: ${payload.preview}`,
          actorLabel: payload.senderDisplayName,
        }
      }

      return {
        title: `${payload.unreadMessageCount} new messages`,
        description: `${payload.senderDisplayName}: ${payload.preview}`,
        actorLabel: payload.senderDisplayName,
      }
    },
    resolveAction: (payload) => ({
      kind: 'conversation_detail',
      conversationId: payload.conversationId,
    }),
  },
} as const satisfies {
  [K in NotificationType]: NotificationRegistryDefinition<K>
}

export function getNotificationRegistryDefinition<T extends NotificationType>(
  type: T,
): NotificationRegistryDefinition<T> {
  return registry[type] as NotificationRegistryDefinition<T>
}

export function formatNotificationPreview<T extends NotificationType>(
  type: T,
  payload: NotificationPayloadByType[T],
): NotificationPreviewSnapshot {
  const validatedPayload = notificationPayloadSchemaForType(type).parse(
    payload,
  ) as NotificationPayloadByType[T]
  const definition = getNotificationRegistryDefinition(type)
  return definition.formatPreview(validatedPayload)
}

export function resolveNotificationAction<T extends NotificationType>(
  type: T,
  payload: NotificationPayloadByType[T],
): NotificationAction | undefined {
  const validatedPayload = notificationPayloadSchemaForType(type).parse(
    payload,
  ) as NotificationPayloadByType[T]
  const definition = getNotificationRegistryDefinition(type)
  return definition.resolveAction(validatedPayload)
}

export const notificationRegistryTypes = Object.keys(registry) as NotificationType[]

export { getNotificationClassification }
