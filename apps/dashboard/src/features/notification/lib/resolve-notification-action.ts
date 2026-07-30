import { crossAppCampaignDetailPath, type NotificationAction } from '@rpg/contracts'

export function resolveNotificationActionPath(
  action: NotificationAction | undefined,
): string | undefined {
  if (!action) return undefined

  if (action.kind === 'campaign_detail') {
    return crossAppCampaignDetailPath(action.campaignId)
  }

  return undefined
}
