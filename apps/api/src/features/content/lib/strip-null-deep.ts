type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export type StripNullDeepOptions = {
  /** Top-level keys that keep an explicit null (system-patch tombstones). */
  preserveTopLevelNullKeys?: readonly string[]
}

/** Removes null entries recursively so optional Zod fields are left absent. */
export function stripNullDeep<T>(value: T, options?: StripNullDeepOptions): T {
  return stripNullDeepLevel(value, options, true)
}

function stripNullDeepLevel<T>(
  value: T,
  options: StripNullDeepOptions | undefined,
  topLevel: boolean,
): T {
  if (value === null) return undefined as T
  if (Array.isArray(value))
    return value.map((entry) => stripNullDeepLevel(entry, options, false)) as T
  if (!isPlainObject(value)) return value

  const preserve = topLevel ? new Set(options?.preserveTopLevelNullKeys ?? []) : new Set<string>()
  const result: PlainObject = {}
  for (const [key, entry] of Object.entries(value)) {
    if (entry === null) {
      if (preserve.has(key)) result[key] = null
      continue
    }
    const stripped = stripNullDeepLevel(entry, options, false)
    if (stripped !== undefined) result[key] = stripped
  }
  return result as T
}

/** Strips null leaves from selected top-level entity fields (preserves valid null envelope values). */
export function stripNullDeepFields(
  entity: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> {
  const result = { ...entity }
  for (const key of keys) {
    const value = result[key]
    if (value !== null && value !== undefined && typeof value === 'object') {
      result[key] = stripNullDeep(value)
    }
  }
  return result
}
