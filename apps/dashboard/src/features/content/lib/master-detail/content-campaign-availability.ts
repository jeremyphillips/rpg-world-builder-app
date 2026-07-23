/** Prefers a saved domain id; falls back to the RHF field-array id for new rows. */
export function resolveMasterDetailRowKey(
  fieldId: string,
  row: { id?: string } | undefined,
): string {
  const domainId = row?.id
  if (typeof domainId === 'string' && domainId.length > 0) return domainId
  return fieldId
}
