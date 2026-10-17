type PlainObject = Record<string, unknown>

export type DeepMergeOptions = {
  /** Keys replaced wholesale instead of deep-merged when both sides are plain objects. */
  replaceKeys?: readonly string[]
  /**
   * Top-level keys whose `null` is stored instead of deleted. Nested nulls still delete.
   * Used for system-patch tombstones.
   */
  tombstoneKeys?: readonly string[]
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
  return mergeLevel(base, patch, options, true)
}

function mergedValue(
  baseValue: unknown,
  patchValue: unknown,
  options: DeepMergeOptions | undefined,
  replaceAtKey: boolean,
): unknown {
  if (!replaceAtKey && isPlainObject(baseValue) && isPlainObject(patchValue)) {
    return mergeLevel(baseValue, patchValue, options, false)
  }
  return patchValue
}

function applyPatchEntry(
  result: PlainObject,
  key: string,
  patchValue: unknown,
  options: DeepMergeOptions | undefined,
  replaceKeys: ReadonlySet<string>,
  tombstoneKeys: ReadonlySet<string>,
): void {
  if (patchValue === undefined) return
  if (patchValue === null) {
    if (tombstoneKeys.has(key)) result[key] = null
    else delete result[key]
    return
  }
  result[key] = mergedValue(result[key], patchValue, options, replaceKeys.has(key))
}

function mergeLevel<T extends object>(
  base: T,
  patch: PlainObject,
  options: DeepMergeOptions | undefined,
  topLevel: boolean,
): T {
  const replaceKeys = new Set(options?.replaceKeys ?? [])
  const tombstoneKeys = topLevel ? new Set(options?.tombstoneKeys ?? []) : new Set<string>()
  const result: PlainObject = { ...(base as PlainObject) }

  for (const [key, patchValue] of Object.entries(patch)) {
    applyPatchEntry(result, key, patchValue, options, replaceKeys, tombstoneKeys)
  }

  return result as T
}
