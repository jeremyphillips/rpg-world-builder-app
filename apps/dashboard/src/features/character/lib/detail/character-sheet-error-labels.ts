/** User-facing character sheet route error copy — mirrors API error mapping. */
export const CHARACTER_SHEET_ERROR_LABELS = {
  standaloneNotFound: 'Character not found.',
  loadFailed: 'Could not load character.',
  campaignNotFoundInCampaign: 'This character could not be found in this campaign.',
  campaignNotFound: 'Campaign not found.',
  campaignPermissionDenied: 'You do not have permission to view this character.',
  catalogLoadFailed: 'Could not load ruleset content.',
  missingRuleset: 'This campaign has no ruleset.',
  rulesetMismatch: 'This character uses a different ruleset than the campaign.',
} as const

/** Copy for a campaign sheet that cannot derive because campaign identity is missing or drifted. */
export function campaignSheetUnavailableMessage(
  unavailable: { kind: string } | null | undefined,
): string | undefined {
  switch (unavailable?.kind) {
    case 'missing_campaign_id':
      return CHARACTER_SHEET_ERROR_LABELS.campaignNotFound
    case 'missing_ruleset':
      return CHARACTER_SHEET_ERROR_LABELS.missingRuleset
    case 'ruleset_mismatch':
      return CHARACTER_SHEET_ERROR_LABELS.rulesetMismatch
    default:
      return undefined
  }
}
