/** Synthetic row key from a `useFieldArray` field record (respects configured `keyName`). */
export function resolveFieldArrayRowKey(
  field: Record<string, unknown>,
  keyName: string | undefined,
): string {
  const rowKeyProp = keyName ?? 'id'
  const rowKey = field[rowKeyProp]
  if (typeof rowKey === 'string' && rowKey.length > 0) {
    return rowKey
  }
  return String(field.id ?? '')
}
