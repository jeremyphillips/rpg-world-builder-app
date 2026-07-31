import {
  crossAppCampaignDetailPath,
  crossAppConversationPath,
  type NotificationAction,
} from '@rpg/contracts'

export function resolveNotificationActionPath(
  action: NotificationAction | undefined,
): string | undefined {
  if (!action) return undefined

  switch (action.kind) {
    case 'campaign_detail':
      return crossAppCampaignDetailPath(action.campaignId)
    case 'conversation_detail':
      return crossAppConversationPath(action.conversationId)
  }
}
