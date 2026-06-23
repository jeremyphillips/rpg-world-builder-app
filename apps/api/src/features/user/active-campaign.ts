import type { AuthMeResponse } from '@rpg/contracts'
import { resolveActiveCampaignSummary } from '@rpg/contracts'

import { listCampaignsForUser } from '../campaign/campaign.service'
import { findSessionUserById, updateLastSelectedCampaign } from './user.service'

/**
 * Resolve the authenticated session payload for `GET /api/auth/me`: the current
 * user, their server-side active campaign (when one resolves), and lazy-clearing
 * of a stale `lastSelectedCampaignId` that no longer matches a reachable campaign.
 */
export async function resolveActiveCampaignForUser(userId: string): Promise<AuthMeResponse | null> {
  const user = await findSessionUserById(userId)
  if (!user) return null

  const campaigns = await listCampaignsForUser(userId)
  const soleCampaignId = campaigns.length === 1 ? campaigns[0]?.id : undefined

  const activeCampaign = resolveActiveCampaignSummary(campaigns, [
    user.lastSelectedCampaignId,
    soleCampaignId,
  ])

  const hasStalePreference =
    user.lastSelectedCampaignId !== null &&
    !campaigns.some((campaign) => campaign.id === user.lastSelectedCampaignId)

  if (!hasStalePreference) {
    return { user, activeCampaign }
  }

  const clearedUser = await updateLastSelectedCampaign(userId, null)
  return {
    user: clearedUser ?? { ...user, lastSelectedCampaignId: null },
    activeCampaign,
  }
}
