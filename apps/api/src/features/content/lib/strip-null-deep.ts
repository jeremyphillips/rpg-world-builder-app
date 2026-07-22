type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Removes null entries recursively so optional Zod fields are left absent. */
export function stripNullDeep<T>(value: T): T {
  if (value === null) return undefined as T
  if (Array.isArray(value)) return value.map(stripNullDeep) as T
  if (!isPlainObject(value)) return value

  const result: PlainObject = {}
  for (const [key, entry] of Object.entries(value)) {
    if (entry === null) continue
    const stripped = stripNullDeep(entry)
    if (stripped !== undefined) result[key] = stripped
  }
  return result as T
}
