export const CAMPAIGN_INVITATION_COPY = {
  cardTitle: 'Campaign invitation',
  body: (inviterDisplayName: string) => `${inviterDisplayName} invited you to join this campaign.`,
  action: 'Review invitation',
  homeSectionHeading: (count: number) =>
    count > 1 ? `Campaign invitations · ${count}` : 'Campaign invitation',
  indexSectionHeading: 'Invitations',
} as const

export function finishJoiningCampaignTitle(campaignName: string): string {
  return `Finish joining ${campaignName}`
}

export const FINISH_JOINING_CAMPAIGN_BODY =
  'Create or connect a character to complete your campaign setup.' as const

export const FINISH_JOINING_CAMPAIGN_ACTION = 'Continue setup' as const

export const CAMPAIGN_ONBOARDING_INCOMPLETE_BADGE = 'Setup incomplete' as const
