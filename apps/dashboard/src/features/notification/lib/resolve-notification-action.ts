import { crossAppCampaignDetailPath, type NotificationAction } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

export function resolveNotificationActionPath(
  action: NotificationAction | undefined,
  scopeCampaignId?: string,
): string | undefined {
  if (!action) return undefined

  switch (action.kind) {
    case 'campaign_detail':
      return crossAppCampaignDetailPath(action.campaignId)
    case 'conversation_detail':
      return ROUTES.messages.detail(
        action.conversationId,
        scopeCampaignId ? { campaignId: scopeCampaignId } : undefined,
      )
  }
}
