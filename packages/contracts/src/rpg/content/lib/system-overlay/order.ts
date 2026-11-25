import type { HomebrewAddition } from './stored'

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

export function readIdentityId(row: unknown, idKey: 'id' | 'entryId'): string | undefined {
  const record = asRecord(row)
  const id = record?.[idKey]
  return typeof id === 'string' && id.length > 0 ? id : undefined
}

export function seedIdentityIds(
  seedRows: readonly unknown[],
  idKey: 'id' | 'entryId',
): readonly string[] {
  const ids: string[] = []
  for (const row of seedRows) {
    const id = readIdentityId(row, idKey)
    if (id) ids.push(id)
  }
  return ids
}

export function canonicalIdentityOrder(
  seedRows: readonly unknown[],
  additions: readonly HomebrewAddition[],
  removedIds: ReadonlySet<string>,
  idKey: 'id' | 'entryId',
): string[] {
  const order: string[] = []
  const seen = new Set<string>()
  for (const row of seedRows) {
    const id = readIdentityId(row, idKey)
    if (!id || removedIds.has(id) || seen.has(id)) continue
    seen.add(id)
    order.push(id)
  }
  for (const addition of additions) {
    if (removedIds.has(addition.id) || seen.has(addition.id)) continue
    seen.add(addition.id)
    order.push(addition.id)
  }
  return order
}

/** Insert catalog seed ids that are absent from a stored authored sequence. */
export function mergeCatalogSeedOrder(
  storedOrder: readonly string[],
  seedRows: readonly unknown[],
  liveIds: ReadonlySet<string>,
  idKey: 'id' | 'entryId',
): string[] {
  const storedSet = new Set(storedOrder)
  const seedIds = seedIdentityIds(seedRows, idKey).filter((id) => liveIds.has(id))
  const missingSeed = seedIds.filter((id) => !storedSet.has(id))
  if (missingSeed.length === 0) {
    return storedOrder.filter((id) => liveIds.has(id))
  }

  const next = [...storedOrder.filter((id) => liveIds.has(id))]
  const present = new Set(next)
  for (const seedId of missingSeed) {
    const seedIndex = seedIds.indexOf(seedId)
    let insertAt = 0
    for (let index = seedIndex - 1; index >= 0; index -= 1) {
      const predecessor = seedIds[index]
      if (!predecessor) continue
      const position = next.indexOf(predecessor)
      if (position >= 0) {
        insertAt = position + 1
        break
      }
    }
    next.splice(insertAt, 0, seedId)
    present.add(seedId)
  }
  return next
}

export function ordersEqual(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false
  return left.every((value, index) => value === right[index])
}

export function validateAuthoredOrder(
  order: readonly string[],
  liveIds: ReadonlySet<string>,
): string | undefined {
  const seen = new Set<string>()
  for (const id of order) {
    if (!liveIds.has(id)) {
      return `Order references unknown or removed id ${id}`
    }
    if (seen.has(id)) {
      return `Order contains duplicate id ${id}`
    }
    seen.add(id)
  }
  if (seen.size !== liveIds.size) {
    return 'Order must contain each live id exactly once'
  }
  return undefined
}
