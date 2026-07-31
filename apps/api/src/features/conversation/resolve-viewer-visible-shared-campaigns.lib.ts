import type { ConversationSharedCampaign } from '@rpg/contracts'

import {
  isEligibleDirectMessagePeerInCampaignBundle,
  loadDirectMessageCampaignBundles,
} from './direct-message-campaign-context.lib'

export async function resolveViewerVisibleSharedCampaignsForPeers(
  viewerUserId: string,
  peerUserIds: readonly string[],
): Promise<Map<string, ConversationSharedCampaign[]>> {
  const uniquePeerUserIds = [...new Set(peerUserIds.filter((userId) => userId !== viewerUserId))]
  const sharedCampaignsByPeerUserId = new Map<string, ConversationSharedCampaign[]>(
    uniquePeerUserIds.map((userId) => [userId, []]),
  )

  if (uniquePeerUserIds.length === 0) return sharedCampaignsByPeerUserId

  const bundles = await loadDirectMessageCampaignBundles(viewerUserId)

  for (const peerUserId of uniquePeerUserIds) {
    const sharedCampaigns: ConversationSharedCampaign[] = []

    for (const bundle of bundles) {
      if (!isEligibleDirectMessagePeerInCampaignBundle(bundle, peerUserId)) continue
      sharedCampaigns.push({
        campaignId: bundle.campaignId,
        campaignName: bundle.campaignName,
      })
    }

    sharedCampaignsByPeerUserId.set(
      peerUserId,
      sharedCampaigns.sort((left, right) => left.campaignName.localeCompare(right.campaignName)),
    )
  }

  return sharedCampaignsByPeerUserId
}
