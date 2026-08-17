export type PersistedFieldOption = {
  value: string
  label: string
}

export type AuthorizedDisplayEntry = {
  label: string
}

/**
 * Merges purpose-filtered selectable options with persisted reference ids.
 *
 * Preservation and label disclosure are separate: callers supply
 * `authorizedDisplay` with labels already authorized for the current viewer.
 * Ids absent from both selectable and authorizedDisplay receive
 * `formatUnresolvedLabel` without revealing protected names.
 */
export function unionPersistedOptions(input: {
  selectable: readonly PersistedFieldOption[]
  persistedIds: readonly string[]
  authorizedDisplay: ReadonlyMap<string, AuthorizedDisplayEntry>
  formatUnresolvedLabel?: (id: string) => string
}): PersistedFieldOption[] {
  const selectableValues = new Set(input.selectable.map((option) => option.value))
  const seenPersisted = new Set<string>()
  const orphans: PersistedFieldOption[] = []

  for (const id of input.persistedIds) {
    if (selectableValues.has(id) || seenPersisted.has(id)) {
      continue
    }
    seenPersisted.add(id)

    const authorized = input.authorizedDisplay.get(id)
    if (authorized) {
      orphans.push({ value: id, label: authorized.label })
      continue
    }

    const formatUnresolved = input.formatUnresolvedLabel ?? ((rawId: string) => rawId)
    orphans.push({ value: id, label: formatUnresolved(id) })
  }

  if (orphans.length === 0) {
    return [...input.selectable]
  }

  return [...input.selectable, ...orphans]
}
