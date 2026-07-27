import type { CampaignContentEligibilityEntry } from '@rpg/contracts'

import { getRulesetPatchRead } from '../vocabulary'
import { buildCampaignContentEligibilityMap } from './campaign-invite-eligibility.lib'

export type CampaignInviteEligibilityContext = {
  startingLevel: number
  campaignContentById: Map<string, CampaignContentEligibilityEntry>
}

async function loadInviteStartingLevel(campaignId: string): Promise<number> {
  const patch = await getRulesetPatchRead(campaignId)
  return patch?.characterCreation.startingLevel ?? 1
}

export async function resolveCampaignInviteEligibilityContext(
  campaignId: string,
): Promise<CampaignInviteEligibilityContext> {
  const [campaignContentById, startingLevel] = await Promise.all([
    buildCampaignContentEligibilityMap(campaignId),
    loadInviteStartingLevel(campaignId),
  ])

  return { startingLevel, campaignContentById }
}
