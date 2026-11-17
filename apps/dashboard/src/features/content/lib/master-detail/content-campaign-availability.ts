/**
 * List selection and persisted row identity: domain `row.id` when present,
 * otherwise the RHF field-array id. Do not use for inline-title React keys
 * (use stable RHF `field.id` for reconciliation and title input ids).
 */
export function resolveMasterDetailRowKey(
  fieldId: string,
  row: { id?: string } | undefined,
): string {
  const domainId = row?.id
  if (typeof domainId === 'string' && domainId.length > 0) return domainId
  return fieldId
}
