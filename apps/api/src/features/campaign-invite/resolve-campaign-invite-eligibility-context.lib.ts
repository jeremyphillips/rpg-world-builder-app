import type { CampaignContentEligibilityIndex } from '@rpg/contracts'

import { getRulesetPatchRead } from '../vocabulary'
import { buildCampaignContentEligibilityIndex } from './campaign-invite-eligibility.lib'

export type CampaignInviteEligibilityContext = {
  startingLevel: number
  contentIndex: CampaignContentEligibilityIndex
}

async function loadInviteStartingLevel(campaignId: string): Promise<number> {
  const patch = await getRulesetPatchRead(campaignId)
  return patch?.characterCreation.startingLevel ?? 1
}

export async function resolveCampaignInviteEligibilityContext(
  campaignId: string,
): Promise<CampaignInviteEligibilityContext> {
  const [contentIndex, startingLevel] = await Promise.all([
    buildCampaignContentEligibilityIndex(campaignId),
    loadInviteStartingLevel(campaignId),
  ])

  return { startingLevel, contentIndex }
}
