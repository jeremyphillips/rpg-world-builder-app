import type { Conversation } from '@rpg/contracts'

import { resolveViewerVisibleSharedCampaignsForPeers } from './resolve-viewer-visible-shared-campaigns.lib'
import type { BaseConversation } from './to-conversation'

export async function assembleConversationResponses(
  viewerUserId: string,
  items: BaseConversation[],
): Promise<Conversation[]> {
  if (items.length === 0) return []

  const sharedCampaignsByPeerUserId = await resolveViewerVisibleSharedCampaignsForPeers(
    viewerUserId,
    items.map((item) => item.peer.userId),
  )

  return items.map((item) => ({
    ...item,
    sharedCampaigns: sharedCampaignsByPeerUserId.get(item.peer.userId) ?? [],
  }))
}

export async function assembleConversationResponse(
  viewerUserId: string,
  item: BaseConversation,
): Promise<Conversation> {
  const [assembled] = await assembleConversationResponses(viewerUserId, [item])
  return assembled!
}
