import type { CampaignListItem } from '@rpg/contracts'

export function isCampaignMembershipOnboardingIncomplete(
  campaign: Pick<CampaignListItem, 'campaignRole' | 'controlledCharacterIds'>,
): boolean {
  return campaign.campaignRole === 'pc' && campaign.controlledCharacterIds.length === 0
}
