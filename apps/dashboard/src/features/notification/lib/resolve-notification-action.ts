import { crossAppCampaignDetailPath, type NotificationAction } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

export function resolveNotificationActionPath(
  action: NotificationAction | undefined,
): string | undefined {
  if (!action) return undefined

  switch (action.kind) {
    case 'campaign_detail':
      return crossAppCampaignDetailPath(action.campaignId)
    case 'conversation_detail':
      return ROUTES.messages.detail(
        action.conversationId,
        action.campaignId ? { campaignId: action.campaignId } : undefined,
      )
  }
}
