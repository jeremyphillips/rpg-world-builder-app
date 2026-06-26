export const ACTIVE_IN_CAMPAIGN_LABEL = 'Active in campaign'

export const ACTIVE_IN_CAMPAIGN_TOOLTIP =
  'Hides this item from players in the current campaign. The item remains available globally.'

export const INACTIVE_ROW_BADGE_LABEL = 'Inactive'

/** Default is active; only an explicit `false` marks a row inactive. */
export function isContentRowActive(activeById: Record<string, boolean>, rowKey: string): boolean {
  return activeById[rowKey] !== false
}

/** Prefers a saved domain id; falls back to the RHF field-array id for new rows. */
export function resolveMasterDetailRowKey(
  fieldId: string,
  row: { id?: string } | undefined,
): string {
  const domainId = row?.id
  if (typeof domainId === 'string' && domainId.length > 0) return domainId
  return fieldId
}
