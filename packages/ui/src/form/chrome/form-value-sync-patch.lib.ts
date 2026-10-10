export const VALUE_SYNC_SET_VALUE_OPTIONS = {
  shouldDirty: true,
  shouldValidate: false,
  shouldTouch: false,
} as const

/** Leaf `setValue` paths for nested object patches (arrays stay at the parent key). */
export function flattenPatchToLeafSetValues(
  patch: Record<string, unknown>,
  prefix = '',
): Array<{ path: string; value: unknown }> {
  const entries: Array<{ path: string; value: unknown }> = []
  for (const [key, value] of Object.entries(patch)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      entries.push(...flattenPatchToLeafSetValues(value as Record<string, unknown>, path))
      continue
    }
    entries.push({ path, value })
  }
  return entries
}
