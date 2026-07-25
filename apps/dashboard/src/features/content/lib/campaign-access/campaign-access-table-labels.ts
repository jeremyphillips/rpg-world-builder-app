import { CAMPAIGN_ACCESS_SECTION_LEGEND } from './campaign-access-labels'

/** Collapsible filter label for campaign availability. */
export const CAMPAIGN_ACCESS_TABLE_FILTER_LABEL = CAMPAIGN_ACCESS_SECTION_LEGEND

/** Filter option labels. */
export const CAMPAIGN_ACCESS_TABLE_FILTER_AVAILABLE = 'Available'
export const CAMPAIGN_ACCESS_TABLE_FILTER_UNAVAILABLE = 'Unavailable'
export const CAMPAIGN_ACCESS_TABLE_FILTER_ALL = 'All'

/** Row-action popover labels. */
export const CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL = 'Unavailable in this campaign'

/** Row-action helper when availability is on. */
export const CAMPAIGN_ACCESS_TABLE_AVAILABLE_HELPER =
  'Controls whether this content can be discovered and selected in this campaign.'

/** Row metadata tooltips — expanded explanations beyond visible compact text. */
export const CAMPAIGN_ACCESS_TABLE_DM_ONLY_TOOLTIP =
  'Only the DM can discover and select this content.'

export const CAMPAIGN_ACCESS_TABLE_SELECTED_PLAYERS_TOOLTIP =
  'Available to the selected players in this campaign.'

export const CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_TOOLTIP =
  'Hidden from discovery and selection in this campaign.'

/** Hidden-count notice action labels. */
export const CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL = 'Show'
export const CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL = 'Hide unavailable'
export const CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL = 'Show unavailable'

export function formatHiddenUnavailableNotice(count: number): string {
  return count === 1 ? '1 hidden' : `${count} hidden`
}

export function formatUnavailableItemsShownNotice(count: number): string {
  return count === 1 ? '1 unavailable shown' : `${count} unavailable shown`
}

export function formatNoAvailableMatchesLabel(pluralNoun: string): string {
  return `No available ${pluralNoun} match these filters.`
}

export function formatUnavailableMatchesLine(count: number, pluralNoun: string): string {
  const verb = count === 1 ? 'matches' : 'match'
  return `${count} unavailable ${pluralNoun} ${verb}.`
}

export function formatShowAllCampaignAvailabilityAriaLabel(): string {
  return 'Show all campaign availability states'
}

export function formatHideUnavailableAriaLabel(): string {
  return 'Hide unavailable items'
}

export function formatShowUnavailableAriaLabel(pluralNoun: string): string {
  return `Show unavailable ${pluralNoun}`
}
