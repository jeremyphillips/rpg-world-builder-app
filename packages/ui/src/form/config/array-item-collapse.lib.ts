export type ArrayItemCollapseOverride = 'open' | 'closed'

export interface ArrayItemCollapseSnapshot {
  overrides: Map<string, ArrayItemCollapseOverride>
}

export function createArrayItemCollapseSnapshot(
  stored?: Record<string, ArrayItemCollapseOverride>,
): ArrayItemCollapseSnapshot {
  return {
    overrides: new Map(stored ? Object.entries(stored) : []),
  }
}

export function serializeArrayItemCollapseOverrides(
  snapshot: ArrayItemCollapseSnapshot,
): Record<string, ArrayItemCollapseOverride> {
  return Object.fromEntries(snapshot.overrides.entries())
}

/** Stable key for persisting collapse overrides across navigation. */
export function resolveArrayItemCollapseKey(
  itemValues: Record<string, unknown>,
  index: number,
  collapseKeyField: string,
): string {
  const stable = itemValues[collapseKeyField]
  if (typeof stable === 'string' && stable.length > 0) return stable
  return `index:${index}`
}

/**
 * Default: one item open; two or more closed. User overrides take precedence.
 */
export function isArrayItemCollapsed(options: {
  itemCount: number
  itemKey: string
  overrides: Map<string, ArrayItemCollapseOverride>
}): boolean {
  const override = options.overrides.get(options.itemKey)
  if (override === 'open') return false
  if (override === 'closed') return true
  return options.itemCount >= 2
}

export function toggleArrayItemCollapseOverride(
  snapshot: ArrayItemCollapseSnapshot,
  itemKey: string,
  nextCollapsed: boolean,
): ArrayItemCollapseSnapshot {
  const overrides = new Map(snapshot.overrides)
  overrides.set(itemKey, nextCollapsed ? 'closed' : 'open')
  return { overrides }
}

export function pruneArrayItemCollapseOverrides(
  snapshot: ArrayItemCollapseSnapshot,
  activeItemKeys: ReadonlySet<string>,
): ArrayItemCollapseSnapshot {
  const overrides = new Map<string, ArrayItemCollapseOverride>()
  for (const [key, value] of snapshot.overrides) {
    if (activeItemKeys.has(key)) overrides.set(key, value)
  }
  return { overrides }
}

export function collapsedIdsFromSnapshot(
  fields: ReadonlyArray<{ id: string }>,
  itemKeysByFieldId: ReadonlyMap<string, string>,
  snapshot: ArrayItemCollapseSnapshot,
  itemCount: number,
): ReadonlySet<string> {
  const collapsed = new Set<string>()
  for (const field of fields) {
    const itemKey = itemKeysByFieldId.get(field.id)
    if (itemKey === undefined) continue
    if (isArrayItemCollapsed({ itemCount, itemKey, overrides: snapshot.overrides })) {
      collapsed.add(field.id)
    }
  }
  return collapsed
}

export function buildItemKeysByFieldId(
  fields: ReadonlyArray<{ id: string }>,
  getItemValues: (index: number) => Record<string, unknown>,
  collapseKeyField: string,
): Map<string, string> {
  const map = new Map<string, string>()
  fields.forEach((field, index) => {
    map.set(field.id, resolveArrayItemCollapseKey(getItemValues(index), index, collapseKeyField))
  })
  return map
}
