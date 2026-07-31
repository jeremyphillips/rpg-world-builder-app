import { findSessionUserById } from '../user'
import { directMessageDedupeKey, publishNotification } from '../notification'
import { buildMessagePreview } from './build-message-preview.lib'
import { resolveViewerVisibleSharedCampaignsForPeers } from './resolve-viewer-visible-shared-campaigns.lib'

export async function publishDirectMessageReceivedNotification(input: {
  conversationId: string
  recipientUserId: string
  messageId: string
  senderUserId: string
  text: string
  unreadMessageCount: number
}): Promise<void> {
  const sender = await findSessionUserById(input.senderUserId)
  const senderDisplayName = sender?.displayName?.trim() || 'Unknown user'

  const sharedCampaignsByPeer = await resolveViewerVisibleSharedCampaignsForPeers(
    input.recipientUserId,
    [input.senderUserId],
  )
  const campaignIds = (sharedCampaignsByPeer.get(input.senderUserId) ?? []).map(
    (campaign) => campaign.campaignId,
  )

  await publishNotification({
    type: 'message.direct.received',
    recipientUserIds: [input.recipientUserId],
    dedupeKey: directMessageDedupeKey(input.conversationId),
    payload: {
      conversationId: input.conversationId,
      messageId: input.messageId,
      senderDisplayName,
      preview: buildMessagePreview(input.text),
      unreadMessageCount: input.unreadMessageCount,
      campaignIds,
    },
  })
}
