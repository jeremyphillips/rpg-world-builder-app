export const VOCABULARY_BULK_ACTIONS_MENU_LABEL = 'Bulk actions'
export const VOCABULARY_BULK_ACTION_EDIT_AVAILABILITY_LABEL = 'Edit availability'
export const VOCABULARY_BULK_AVAILABILITY_DIALOG_HEADLINE = 'Edit availability'
export const VOCABULARY_DISABLE_BLOCKED_HEADLINE = 'Cannot disable vocabulary entry'
export const VOCABULARY_DISABLE_BLOCKED_DESCRIPTION =
  'This entry is referenced by campaign content and cannot be disabled yet.'
export const VOCABULARY_DELETE_BLOCKED_HEADLINE = 'Cannot delete vocabulary entry'
export const VOCABULARY_DELETE_BLOCKED_DESCRIPTION =
  'This entry is referenced by campaign content and cannot be deleted yet.'

export const VOCABULARY_BULK_BLOCKED_DIALOG_HEADLINE = 'Some entries could not be disabled'
export const VOCABULARY_BULK_BLOCKED_DIALOG_DESCRIPTION =
  'The following entries are referenced by campaign content and could not be updated.'

/** Post-apply summary for full bulk availability success. */
export function formatBulkVocabularyAvailabilityFullSuccess(updatedCount: number): string {
  return `Updated ${updatedCount} ${updatedCount === 1 ? 'entry' : 'entries'}.`
}

/** Post-apply summary distinguishing blocked (in-use) from failed (errors). */
export function formatBulkVocabularyAvailabilityPartialSuccess(
  updatedCount: number,
  blockedCount: number,
  failedCount = 0,
): string {
  const parts: string[] = []
  if (updatedCount > 0) {
    parts.push(`Updated ${updatedCount} ${updatedCount === 1 ? 'entry' : 'entries'}.`)
  }
  if (blockedCount > 0) {
    parts.push(`${blockedCount} ${blockedCount === 1 ? 'entry' : 'entries'} blocked.`)
  }
  if (failedCount > 0) {
    parts.push(`${failedCount} ${failedCount === 1 ? 'entry' : 'entries'} failed.`)
  }
  return parts.join(' ')
}

export const VOCABULARY_OVERVIEW_USED_BY_CONTENT_LABEL = 'Used by content'
export const VOCABULARY_OVERVIEW_USED_BY_CONTENT_TOOLTIP =
  'Counts content references. Additional references may appear on the term details page.'
