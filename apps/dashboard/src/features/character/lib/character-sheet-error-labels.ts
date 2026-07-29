/** User-facing character sheet route error copy — mirrors API error mapping. */
export const CHARACTER_SHEET_ERROR_LABELS = {
  standaloneNotFound: 'Character not found.',
  loadFailed: 'Could not load character.',
  campaignNotFoundInCampaign: 'This character could not be found in this campaign.',
  campaignNotFound: 'Campaign not found.',
  campaignPermissionDenied: 'You do not have permission to view this character.',
  catalogLoadFailed: 'Could not load ruleset content.',
} as const
