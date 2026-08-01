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

export const CAMPAIGN_ONBOARDING_INDEX_ROW_BODY =
  'Create or connect a character to finish joining.' as const

export const CAMPAIGN_PARTICIPATION_INVALID_BADGE = 'Connection issue' as const

export const CAMPAIGN_PARTICIPATION_INVALID_BODY =
  'Your campaign character connection needs attention.' as const

export const CAMPAIGN_PARTICIPATION_INVALID_INDEX_ROW_BODY =
  'Your character connection for this campaign needs attention.' as const

export const CAMPAIGN_PARTICIPATION_INVALID_ACTION = 'Open campaign' as const

export function campaignParticipationInvalidTitle(campaignName: string): string {
  return `${campaignName} needs attention`
}

export const CAMPAIGN_ONBOARDING_INCOMPLETE_COPY = {
  badge: CAMPAIGN_ONBOARDING_INCOMPLETE_BADGE,
  message: FINISH_JOINING_CAMPAIGN_BODY,
  action: FINISH_JOINING_CAMPAIGN_ACTION,
} as const

export const CAMPAIGN_ONBOARDING_EXISTING_CHARACTER_SUBMIT_ERROR =
  'Could not add this character to the campaign. Try again in a moment.' as const

export const CAMPAIGN_ONBOARDING_UNEXPECTED_STATUS_COPY = {
  complete: {
    message:
      'Campaign onboarding is already complete for this membership. Open the campaign to continue.',
    action: 'Go to campaign',
  },
  activeWithoutCharacter: {
    message:
      'Your campaign membership is active, but no character is linked to this onboarding session.',
    action: 'Go to campaign',
  },
} as const
