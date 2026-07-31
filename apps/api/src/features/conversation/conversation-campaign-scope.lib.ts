import type { ConversationListScope } from '@rpg/contracts'

import {
  isEligibleDirectMessagePeerInCampaignBundle,
  loadDirectMessageCampaignBundles,
  type DirectMessageCampaignBundle,
} from './direct-message-campaign-context.lib'

export type ResolvedConversationCampaignScope = {
  bundle: DirectMessageCampaignBundle | null
  scope: ConversationListScope | null
  scopeInvalid: boolean
}

export async function resolveConversationCampaignScope(
  viewerUserId: string,
  campaignId: string | undefined,
): Promise<ResolvedConversationCampaignScope> {
  if (!campaignId) {
    return { bundle: null, scope: null, scopeInvalid: false }
  }

  const bundles = await loadDirectMessageCampaignBundles(viewerUserId)
  const bundle = bundles.find((entry) => entry.campaignId === campaignId) ?? null

  if (!bundle) {
    return { bundle: null, scope: null, scopeInvalid: true }
  }

  return {
    bundle,
    scope: {
      campaignId: bundle.campaignId,
      campaignName: bundle.campaignName,
    },
    scopeInvalid: false,
  }
}

export function isPeerEligibleInCampaignScope(
  bundle: DirectMessageCampaignBundle,
  peerUserId: string,
): boolean {
  return isEligibleDirectMessagePeerInCampaignBundle(bundle, peerUserId)
}

export function filterBundlesForCampaignScope(
  bundles: DirectMessageCampaignBundle[],
  campaignId: string | undefined,
): {
  bundles: DirectMessageCampaignBundle[]
  scope: ConversationListScope | null
  scopeInvalid: boolean
} {
  if (!campaignId) {
    return { bundles, scope: null, scopeInvalid: false }
  }

  const bundle = bundles.find((entry) => entry.campaignId === campaignId) ?? null
  if (!bundle) {
    return { bundles: [], scope: null, scopeInvalid: true }
  }

  return {
    bundles: [bundle],
    scope: {
      campaignId: bundle.campaignId,
      campaignName: bundle.campaignName,
    },
    scopeInvalid: false,
  }
}
