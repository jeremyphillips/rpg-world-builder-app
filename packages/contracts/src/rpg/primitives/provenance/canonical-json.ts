function canonicalize(value: unknown): unknown {
  if (typeof value === 'string') return value.normalize('NFC')
  if (typeof value !== 'object' || value === null) return value
  if (Array.isArray(value)) return value.map(canonicalize)

  const record = value as Record<string, unknown>
  const normalized: Record<string, unknown> = {}
  for (const key of Object.keys(record).sort()) {
    if (record[key] !== undefined) normalized[key] = canonicalize(record[key])
  }
  return normalized
}

/** Deterministic JSON: sorted keys, NFC strings, no insignificant whitespace, omitted undefined. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}
