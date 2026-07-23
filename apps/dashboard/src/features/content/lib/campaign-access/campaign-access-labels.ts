/** Subgroup legend for the campaign access field group. */
export const CAMPAIGN_ACCESS_SECTION_LEGEND = 'Campaign access'

/** Switch label for the campaign access section. */
export const CAMPAIGN_ACCESS_AVAILABLE_LABEL = 'Available in this campaign'

/** Switch hint for the campaign access section. */
export const CAMPAIGN_ACCESS_AVAILABLE_HINT =
  'When off, players cannot discover or select this content for new characters.'

/** Shown when specific_players is disabled until the participant system ships. */
export const CAMPAIGN_ACCESS_SPECIFIC_PLAYERS_DISABLED_HINT =
  'Set up campaign players before choosing specific players.'

/** Non-blocking create-time failure when the deferred campaign-access PATCH fails. */
export const CAMPAIGN_ACCESS_CREATE_DEFERRED_ERROR =
  'Item created, but campaign access could not be saved — set it on the edit page.'

/** Blocked availability-off dialog headline. */
export function formatCampaignAccessBlockedHeadline(): string {
  return 'Cannot turn off availability'
}

/** Blocked availability-off dialog body when characters still reference the content. */
export function formatCampaignAccessBlockedDescription(count: number): string {
  const noun = count === 1 ? 'character' : 'characters'
  return `This content is currently used by ${count} active ${noun}. Remove the references before making it unavailable.`
}
