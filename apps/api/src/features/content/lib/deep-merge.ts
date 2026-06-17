type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Deep-merge a (partial) patch onto a base object.
 *
 * - Nested plain objects merge recursively.
 * - Arrays and primitives are **replaced wholesale** (override `features` or
 *   `asiLevels` entirely, not element-wise) — the documented overlay-patch
 *   granularity. `undefined` patch values are skipped so a partial patch only
 *   touches the fields it provides.
 *
 * Type-agnostic: used by every content type's overlay merge.
 */
export function deepMerge<T extends object>(base: T, patch: PlainObject): T {
  const result: PlainObject = { ...(base as PlainObject) }

  for (const [key, patchValue] of Object.entries(patch)) {
    if (patchValue === undefined) continue
    const baseValue = result[key]
    result[key] =
      isPlainObject(baseValue) && isPlainObject(patchValue)
        ? deepMerge(baseValue, patchValue)
        : patchValue
  }

  return result as T
}
