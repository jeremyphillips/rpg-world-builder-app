import type { CampaignContentEligibilityIndex } from '@rpg/contracts'

import { getRulesetPatchRead } from '../../../vocabulary'
import { buildCampaignContentEligibilityIndex } from '../../../campaign-invite/campaign-invite-eligibility.lib'

export type CampaignCharacterEligibilityContext = {
  startingLevel: number
  contentIndex: CampaignContentEligibilityIndex
}

async function loadCampaignStartingLevel(campaignId: string): Promise<number> {
  const patch = await getRulesetPatchRead(campaignId)
  return patch?.characterCreation.startingLevel ?? 1
}

export async function resolveCampaignCharacterEligibilityContext(
  campaignId: string,
): Promise<CampaignCharacterEligibilityContext> {
  const [contentIndex, startingLevel] = await Promise.all([
    buildCampaignContentEligibilityIndex(campaignId),
    loadCampaignStartingLevel(campaignId),
  ])

  return { startingLevel, contentIndex }
}
