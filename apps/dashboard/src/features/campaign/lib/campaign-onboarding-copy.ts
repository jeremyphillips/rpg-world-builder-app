import {
  CAMPAIGN_ONBOARDING_INCOMPLETE_BADGE,
  FINISH_JOINING_CAMPAIGN_ACTION,
  FINISH_JOINING_CAMPAIGN_BODY,
  finishJoiningCampaignTitle,
} from './campaign-invitation-copy'

export { finishJoiningCampaignTitle, FINISH_JOINING_CAMPAIGN_BODY, FINISH_JOINING_CAMPAIGN_ACTION }

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
