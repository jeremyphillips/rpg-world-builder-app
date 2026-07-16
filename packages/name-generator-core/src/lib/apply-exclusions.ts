// ---------------------------------------------------------------------------
// Normalize exclusion lists into a lookup set.
// ---------------------------------------------------------------------------

export function toExclusionSet(exclude: readonly string[] | undefined): ReadonlySet<string> {
  return new Set(exclude ?? [])
}

export function mergeExclusions(...sets: ReadonlySet<string>[]): ReadonlySet<string> {
  const merged = new Set<string>()
  for (const set of sets) {
    for (const value of set) {
      merged.add(value)
    }
  }
  return merged
}
