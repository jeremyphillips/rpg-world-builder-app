import {
  CONTENT_AVAILABILITY_OFF_ACTION,
  formatActionBlockedDescription,
  formatActionBlockedTitle,
} from '@/lib/actions/action-messages'

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
  return formatActionBlockedTitle({ mode: 'single', action: CONTENT_AVAILABILITY_OFF_ACTION })
}

/** Blocked availability-off dialog body when characters still reference the content. */
export function formatCampaignAccessBlockedDescription(count: number): string {
  return formatActionBlockedDescription({
    blockedCount: count,
    selectedCount: count,
    noun: 'item',
    referenceNoun: 'character',
  })
}

/** Bulk campaign-access modal headline. */
export const BULK_CAMPAIGN_ACCESS_DIALOG_HEADLINE = 'Edit campaign availability'

/** Bulk campaign-access modal description. */
export function formatBulkCampaignAccessDialogDescription(
  selectedCount: number,
  itemLabelPlural: string,
): string {
  return `Apply changes to ${selectedCount} selected ${itemLabelPlural}.`
}

/** Bulk availability field label. */
export const BULK_CAMPAIGN_ACCESS_AVAILABILITY_LABEL = 'Availability'

/** Bulk player-access field label. */
export const BULK_CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL = 'Player access'

/** Bulk preview line for selected count. */
export function formatBulkCampaignAccessSelectedCount(selectedCount: number): string {
  return `${selectedCount} item${selectedCount === 1 ? '' : 's'} selected.`
}

/** Bulk preview line for changed vs unchanged counts. */
export function formatBulkCampaignAccessChangePreview(
  wouldChangeCount: number,
  unchangedCount: number,
): string {
  const changedLabel = `${wouldChangeCount} item${wouldChangeCount === 1 ? '' : 's'} will change.`
  const unchangedLabel = `${unchangedCount} item${unchangedCount === 1 ? '' : 's'} unchanged.`
  return `${changedLabel} ${unchangedLabel}`
}

/** Neutral copy when blocked counts cannot be predicted pre-apply. */
export const BULK_CAMPAIGN_ACCESS_BLOCKED_PREVIEW_NOTE =
  'Blocked items cannot be predicted before applying.'

/** Reminder that bulk access edits do not publish drafts. */
export const BULK_CAMPAIGN_ACCESS_DRAFT_NOTE = 'Draft items remain draft.'

/** Bulk apply button label. */
export const BULK_CAMPAIGN_ACCESS_APPLY_LABEL = 'Apply changes'

/** Bulk apply disclosure referencing the selection cap. */
export function formatBulkCampaignAccessApplyDisclosure(limit: number): string {
  return `Applies to up to ${limit} selected items.`
}

/** Post-apply summary for full success. */
export function formatBulkCampaignAccessFullSuccess(updatedCount: number): string {
  return `Updated ${updatedCount} item${updatedCount === 1 ? '' : 's'}.`
}

/** Post-apply summary for partial success (blocked or failed rows). */
export function formatBulkCampaignAccessPartialSuccess(
  updatedCount: number,
  blockedCount: number,
  failedCount = 0,
): string {
  const parts: string[] = []
  if (updatedCount > 0) {
    parts.push(`Updated ${updatedCount} item${updatedCount === 1 ? '' : 's'}.`)
  }
  if (blockedCount > 0) {
    parts.push(`${blockedCount} item${blockedCount === 1 ? '' : 's'} blocked.`)
  }
  if (failedCount > 0) {
    parts.push(`${failedCount} item${failedCount === 1 ? '' : 's'} failed.`)
  }
  return parts.join(' ')
}

/** Bulk actions menu trigger label. */
export const CONTENT_BULK_ACTIONS_MENU_LABEL = 'Bulk actions'

/** Bulk actions menu item for campaign access. */
export const CONTENT_BULK_ACTION_EDIT_CAMPAIGN_ACCESS_LABEL = 'Edit campaign availability'

/** Availability toast tail — available. */
export const CAMPAIGN_ACCESS_NOW_AVAILABLE_TAIL = 'now available in this campaign.'

/** Availability toast tail — unavailable. */
export const CAMPAIGN_ACCESS_NO_LONGER_AVAILABLE_TAIL = 'no longer available in this campaign.'

export type CampaignAccessAvailabilityToastInput = {
  available: boolean
  count: number
  /** When count is 1, use the quoted entity name instead of "1 item". */
  name?: string
}

/** Toast copy for availability changes — one named item or a count of items. */
export function formatCampaignAccessAvailabilityToast(
  input: CampaignAccessAvailabilityToastInput,
): string {
  const tail = input.available
    ? CAMPAIGN_ACCESS_NOW_AVAILABLE_TAIL
    : CAMPAIGN_ACCESS_NO_LONGER_AVAILABLE_TAIL

  if (input.count === 1 && input.name) {
    const quoted = `"${input.name.trim() || 'This item'}"`
    return `${quoted} is ${tail}`
  }

  const noun = input.count === 1 ? 'item' : 'items'
  const verb = input.count === 1 ? 'is' : 'are'
  return `${input.count} ${noun} ${verb} ${tail}`
}

/** Row-toggle toast when availability is turned on. */
export function formatCampaignAccessNowAvailableMessage(name: string): string {
  return formatCampaignAccessAvailabilityToast({ count: 1, name, available: true })
}

/** Row-toggle toast when availability is turned off. */
export function formatCampaignAccessNoLongerAvailableMessage(name: string): string {
  return formatCampaignAccessAvailabilityToast({ count: 1, name, available: false })
}

/** Row-toggle failure toast title when turning availability on fails. */
export const CAMPAIGN_ACCESS_MAKE_AVAILABLE_FAILED_TITLE = 'Could not make available.'

/** Row-toggle failure toast title when turning availability off fails. */
export const CAMPAIGN_ACCESS_MARK_UNAVAILABLE_FAILED_TITLE = 'Could not mark unavailable.'
