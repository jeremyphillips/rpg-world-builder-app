import {
  crossAppCampaignDetailPath,
  dashboardCampaignInviteReviewPath,
  isCampaignInviteId,
  type Notification,
  type NotificationAction,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

type NotificationActionSource = Pick<Notification, 'type' | 'action' | 'payload'>

function resolveCampaignInviteReviewInviteId(
  notification: NotificationActionSource,
): string | undefined {
  const action = notification.action
  if (action?.kind !== 'campaign_invite_review') {
    return undefined
  }

  // Temporary compatibility for notifications persisted before
  // campaign_invite_review actions stored inviteId.
  // Remove after stale notification rows are cleaned up.
  const actionInviteId = action.inviteId?.trim() || undefined
  const payloadInviteId =
    notification.type === 'campaign.invite.received' && 'inviteId' in notification.payload
      ? notification.payload.inviteId
      : undefined
  const inviteId = actionInviteId ?? payloadInviteId

  return isCampaignInviteId(inviteId) ? inviteId : undefined
}

function resolveActionPath(
  action: NotificationAction,
  notification: NotificationActionSource,
  scopeCampaignId?: string,
): string | undefined {
  switch (action.kind) {
    case 'campaign_detail':
      return crossAppCampaignDetailPath(action.campaignId)
    case 'campaign_invite_review': {
      const inviteId = resolveCampaignInviteReviewInviteId(notification)
      return inviteId ? dashboardCampaignInviteReviewPath(inviteId) : undefined
    }
    case 'conversation_detail':
      return ROUTES.messages.detail(
        action.conversationId,
        scopeCampaignId ? { campaignId: scopeCampaignId } : undefined,
      )
  }
}

export function resolveNotificationActionPath(
  notification: NotificationActionSource,
  scopeCampaignId?: string,
): string | undefined {
  const action = notification.action
  if (!action) return undefined

  return resolveActionPath(action, notification, scopeCampaignId)
}
