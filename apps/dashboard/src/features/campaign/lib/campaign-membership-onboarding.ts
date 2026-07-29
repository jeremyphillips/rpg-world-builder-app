import type { CampaignListItem } from '@rpg/contracts'

export function isCampaignMembershipOnboardingIncomplete(
  campaign: Pick<CampaignListItem, 'viewerOnboardingState'>,
): boolean {
  return campaign.viewerOnboardingState === 'incomplete'
}
