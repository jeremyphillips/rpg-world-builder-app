type PlainObject = Record<string, unknown>

export type DeepMergeOptions = {
  /** Keys replaced wholesale instead of deep-merged when both sides are plain objects. */
  replaceKeys?: readonly string[]
}

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Deep-merge a (partial) patch onto a base object.
 *
 * - Nested plain objects merge recursively unless the key is listed in `replaceKeys`.
 * - `null` patch values remove the key from the result (explicit clear).
 * - Arrays and primitives are **replaced wholesale** (override `features` or
 *   `features` entirely, not element-wise) — the documented overlay-patch
 *   granularity. `undefined` patch values are skipped so a partial patch only
 *   touches the fields it provides.
 *
 * Type-agnostic: used by every content type's overlay merge.
 */
export function deepMerge<T extends object>(
  base: T,
  patch: PlainObject,
  options?: DeepMergeOptions,
): T {
  const replaceKeys = new Set(options?.replaceKeys ?? [])
  const result: PlainObject = { ...(base as PlainObject) }

  for (const [key, patchValue] of Object.entries(patch)) {
    if (patchValue === undefined) continue
    if (patchValue === null) {
      delete result[key]
      continue
    }

    const baseValue = result[key]
    const replaceAtKey = replaceKeys.has(key)
    result[key] =
      !replaceAtKey && isPlainObject(baseValue) && isPlainObject(patchValue)
        ? deepMerge(baseValue, patchValue, options)
        : patchValue
  }

  return result as T
}
