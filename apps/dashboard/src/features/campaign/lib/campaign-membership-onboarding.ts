import type { CampaignListItem } from '@rpg/contracts'

export function isCampaignMembershipOnboardingIncomplete(
  campaign: Pick<CampaignListItem, 'campaignRole' | 'openControlledCharacterIds'>,
): boolean {
  return campaign.campaignRole === 'pc' && campaign.openControlledCharacterIds.length === 0
}
