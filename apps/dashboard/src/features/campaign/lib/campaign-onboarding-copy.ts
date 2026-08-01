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

export const CAMPAIGN_CONNECTION_RESTORE_ACTION = 'Reconnect character' as const

export const CAMPAIGN_CONNECTION_RESTORE_TITLE = 'Connection needs restore' as const

export function campaignConnectionRestoreTitle(campaignName: string): string {
  return `${campaignName} — connection needs restore`
}

export const CAMPAIGN_CONNECTION_RESTORE_BODY =
  'Your campaign character connection needs to be restored.' as const

export const CAMPAIGN_ONBOARDING_INCOMPLETE_BADGE = 'Setup incomplete' as const

export const CAMPAIGN_CONNECTION_RESTORE_BADGE = 'Connection issue' as const

export const CAMPAIGN_MEMBERSHIP_INVALID_BADGE = 'Membership issue' as const

export const CAMPAIGN_ONBOARDING_INDEX_ROW_BODY =
  'Create or connect a character to finish joining.' as const

export const CAMPAIGN_CONNECTION_RESTORE_INDEX_ROW_BODY =
  'Your character connection for this campaign needs attention.' as const

export const CAMPAIGN_MEMBERSHIP_INVALID_INDEX_ROW_BODY =
  'This campaign membership cannot be repaired from the dashboard.' as const

export const CAMPAIGN_MEMBERSHIP_INVALID_BODY =
  'This campaign membership is in an unsupported state. Contact the campaign owner for help.' as const

export function campaignMembershipInvalidTitle(campaignName: string): string {
  return `${campaignName} membership needs attention`
}

export const CAMPAIGN_ONBOARDING_RECONNECT_HEADING = 'Restore your campaign connection' as const

export const CAMPAIGN_ONBOARDING_RECONNECT_BODY =
  'Choose a character to reconnect your membership with this campaign.' as const

/** @deprecated Use {@link CAMPAIGN_CONNECTION_RESTORE_BADGE}. */
export const CAMPAIGN_PARTICIPATION_INVALID_BADGE = CAMPAIGN_CONNECTION_RESTORE_BADGE

/** @deprecated Use {@link CAMPAIGN_CONNECTION_RESTORE_BODY}. */
export const CAMPAIGN_PARTICIPATION_INVALID_BODY = CAMPAIGN_CONNECTION_RESTORE_BODY

/** @deprecated Use {@link CAMPAIGN_CONNECTION_RESTORE_INDEX_ROW_BODY}. */
export const CAMPAIGN_PARTICIPATION_INVALID_INDEX_ROW_BODY =
  CAMPAIGN_CONNECTION_RESTORE_INDEX_ROW_BODY

/** @deprecated Use {@link campaignConnectionRestoreTitle}. */
export function campaignParticipationInvalidTitle(campaignName: string): string {
  return campaignConnectionRestoreTitle(campaignName)
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
