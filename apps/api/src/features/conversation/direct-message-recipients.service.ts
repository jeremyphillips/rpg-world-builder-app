import type { DirectConversationRecipientsResponse } from '@rpg/contracts'

import { findUsersByIds } from '../user'
import {
  isEligibleDirectMessagePeerInCampaignBundle,
  loadDirectMessageCampaignBundles,
} from './direct-message-campaign-context.lib'
import { filterBundlesForCampaignScope } from './conversation-campaign-scope.lib'
import { ConversationModel } from './conversation.model'
import { buildDirectConversationParticipantKey } from './conversation-participant-key.lib'

export async function isEligibleDirectMessageRecipient(
  callerUserId: string,
  recipientUserId: string,
): Promise<boolean> {
  if (callerUserId === recipientUserId) return false

  const bundles = await loadDirectMessageCampaignBundles(callerUserId)
  return bundles.some((bundle) =>
    isEligibleDirectMessagePeerInCampaignBundle(bundle, recipientUserId),
  )
}

export async function listDirectMessageRecipients(
  callerUserId: string,
  options: { campaignId?: string } = {},
): Promise<DirectConversationRecipientsResponse> {
  const loadedBundles = await loadDirectMessageCampaignBundles(callerUserId)
  const { bundles, scope, scopeInvalid } = filterBundlesForCampaignScope(
    loadedBundles,
    options.campaignId,
  )

  if (scopeInvalid) {
    return {
      recipientsByUserId: {},
      campaigns: [],
      existingDirectByUserId: {},
      scopeInvalid: true,
    }
  }

  const recipientUserIds = new Set<string>()
  const campaigns = bundles
    .map((bundle) => {
      const userIds = [...bundle.membershipContextsByUserId.keys()].filter((userId) => {
        if (userId === callerUserId) return false
        if (!isEligibleDirectMessagePeerInCampaignBundle(bundle, userId)) return false
        recipientUserIds.add(userId)
        return true
      })

      return {
        campaignId: bundle.campaignId,
        campaignName: bundle.campaignName,
        userIds: userIds.sort((left, right) => left.localeCompare(right)),
      }
    })
    .filter((campaign) => campaign.userIds.length > 0)
    .sort((left, right) => left.campaignName.localeCompare(right.campaignName))

  if (recipientUserIds.size === 0) {
    return {
      recipientsByUserId: {},
      campaigns: [],
      existingDirectByUserId: {},
      scope: scope ?? undefined,
    }
  }

  const users = await findUsersByIds([...recipientUserIds])
  const displayNameByUserId = new Map(users.map((user) => [user.id, user.displayName]))

  const recipientsByUserId = Object.fromEntries(
    [...recipientUserIds].map((userId) => [
      userId,
      {
        userId,
        displayName: displayNameByUserId.get(userId) ?? 'Unknown user',
      },
    ]),
  )

  const participantKeys = [...recipientUserIds].map((recipientUserId) =>
    buildDirectConversationParticipantKey(callerUserId, recipientUserId),
  )
  const existingConversations = await ConversationModel.find({
    participantKey: { $in: participantKeys },
    latestMessage: { $ne: null },
  })
    .select('_id participantUserIds')
    .lean<{ _id: unknown; participantUserIds: string[] }[]>()

  const existingDirectByUserId = Object.fromEntries(
    existingConversations.flatMap((conversation) => {
      const peerUserId = conversation.participantUserIds.find((userId) => userId !== callerUserId)
      return peerUserId ? [[peerUserId, String(conversation._id)]] : []
    }),
  )

  return {
    recipientsByUserId,
    campaigns,
    existingDirectByUserId,
    scope: scope ?? undefined,
  }
}
