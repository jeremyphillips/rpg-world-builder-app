export const CAMPAIGN_ONBOARDING_INCOMPLETE_COPY = {
  label: 'Character setup incomplete',
  message: 'Complete your character setup to finish joining this campaign.',
  action: 'Continue setup',
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
