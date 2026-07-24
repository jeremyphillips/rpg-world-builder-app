/** Subgroup legend for the campaign access disclosure. */
export const CAMPAIGN_ACCESS_SECTION_LEGEND = 'Campaign availability'

/** Switch label for the campaign access section. */
export const CAMPAIGN_ACCESS_AVAILABLE_LABEL = 'Available in this campaign'

/** Switch hint when availability is on. */
export const CAMPAIGN_ACCESS_AVAILABLE_HINT =
  'When unavailable, this content is removed from campaign selection and discovery.'

/** Switch hint when availability is off. */
export const CAMPAIGN_ACCESS_UNAVAILABLE_HINT =
  'This content cannot be discovered or selected in this campaign.'

/** Collapsed disclosure secondary line when availability is off. */
export const CAMPAIGN_ACCESS_UNAVAILABLE_SUMMARY_SECONDARY =
  'Hidden from discovery and selection in this campaign.'

/** Label-level tooltip for the availability switch. */
export const CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP =
  'Unavailable content is removed from campaign discovery and new-selection surfaces. Existing character references remain readable, and turning availability off may be blocked while active characters depend on the content.'

/** Select label for player-oriented visibility. */
export const CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL = 'Player access'

/** Select hint when availability is on and specific players is enabled. */
export const CAMPAIGN_ACCESS_PLAYER_ACCESS_HINT =
  'Controls which players can discover and select this content while it is available.'

/** Select hint when availability is off — visibility is preserved but not effective. */
export const CAMPAIGN_ACCESS_PLAYER_ACCESS_PRESERVED_HINT =
  'This setting is saved and will be restored if availability is turned back on.'

/** Label-level tooltip for the player access select. */
export const CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP =
  'Player access narrows who can discover and newly select this content while it is available. It does not remove content already assigned to a character.'

/** Shown when specific_players is disabled until the participant system ships. */
export const CAMPAIGN_ACCESS_SPECIFIC_PLAYERS_DISABLED_HINT =
  'Set up campaign players before choosing specific players.'

/** Multi-select label for specific player grants. */
export const CAMPAIGN_ACCESS_PARTICIPANTS_LABEL = 'Selected players'

/** Multi-select hint when limiting discovery to specific players. */
export const CAMPAIGN_ACCESS_PARTICIPANTS_HINT =
  'Choose which submitted campaign characters can discover and select this content.'

/** Label-level tooltip for the participant multi-select. */
export const CAMPAIGN_ACCESS_PARTICIPANTS_TOOLTIP =
  'Only characters submitted to this campaign appear here. Players without a submitted character cannot be granted access.'

/** Formats a roster entry for combobox options. */
export function formatCampaignAccessParticipantOptionLabel(
  name: string,
  playerDisplayName: string,
): string {
  return `${name} · ${playerDisplayName}`
}

/** Non-blocking create-time failure when the deferred campaign-access PATCH fails. */
export const CAMPAIGN_ACCESS_CREATE_DEFERRED_ERROR =
  'Item created, but campaign access could not be saved — set it on the edit page.'

/** Collapsed disclosure action to expand settings. */
export const CAMPAIGN_ACCESS_CHANGE_LABEL = 'Change'

/** Expanded disclosure action to collapse settings. */
export const CAMPAIGN_ACCESS_DONE_LABEL = 'Done'

/** Quiet suffix appended to the collapsed summary when the form is dirty. */
export const CAMPAIGN_ACCESS_UNSAVED_SUFFIX = ' · Unsaved'

/** Blocked availability-off dialog headline. */
export function formatCampaignAccessBlockedHeadline(): string {
  return 'Cannot turn off availability'
}

/** Blocked availability-off dialog body when characters still reference the content. */
export function formatCampaignAccessBlockedDescription(count: number): string {
  const noun = count === 1 ? 'character' : 'characters'
  return `This content is currently used by ${count} active ${noun}. Remove the references before making it unavailable.`
}
