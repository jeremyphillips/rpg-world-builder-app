import type { CollectionDelta, ObjectDelta, SeedFieldDelta, SeedRowReplace } from './intent'
import type { OverlayPolicyNode } from './policy'
import { canonicalIdentityOrder, readIdentityId, seedIdentityIds } from './order'
import { overlayPolicyForRow } from './resolve-core'
import { overlayValueEqual } from './value-equal'

export type BuildSystemOverlayIntentInput = {
  policy: OverlayPolicyNode
  catalogSeed: Record<string, unknown>
  baseline: Record<string, unknown>
  draft: Record<string, unknown>
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? [...value] : []
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key)
}

function unionDiscriminator(policy: OverlayPolicyNode): string | undefined {
  return policy.kind === 'union' ? policy.branches[0]?.discriminator : undefined
}

function mergeObjectDelta(left: ObjectDelta, right: ObjectDelta): ObjectDelta {
  return {
    set: { ...(left.set ?? {}), ...(right.set ?? {}) },
    clear: [...(left.clear ?? []), ...(right.clear ?? [])],
    restore: [...(left.restore ?? []), ...(right.restore ?? [])],
    collections: { ...(left.collections ?? {}), ...(right.collections ?? {}) },
  }
}

function pruneObjectDelta(delta: ObjectDelta): ObjectDelta {
  const next: ObjectDelta = {}
  if (delta.set && Object.keys(delta.set).length > 0) next.set = delta.set
  if ((delta.clear?.length ?? 0) > 0) next.clear = delta.clear
  if ((delta.restore?.length ?? 0) > 0) next.restore = delta.restore
  if (delta.collections && Object.keys(delta.collections).length > 0) {
    next.collections = delta.collections
  }
  return next
}

// fallow-ignore-next-line complexity — policy walk diffing baseline versus draft fields
function diffScalarsAndAtomics(
  baseline: Record<string, unknown>,
  draft: Record<string, unknown>,
  catalogSeed: Record<string, unknown>,
  policy: Extract<OverlayPolicyNode, { kind: 'deep' }>,
  pathPrefix: string,
): ObjectDelta {
  let delta: ObjectDelta = {}
  for (const [key, node] of Object.entries(policy.fields)) {
    const baselineValue = baseline[key]
    const draftValue = draft[key]
    const baselinePresent = hasOwn(baseline, key)
    const draftPresent = hasOwn(draft, key)
    const fieldPath = pathPrefix ? `${pathPrefix}.${key}` : key

    if (node.kind === 'deep') {
      if (!baselinePresent && !draftPresent) continue
      const child = diffObjectLevel(
        (asRecord(baselineValue) ?? {}) as Record<string, unknown>,
        (asRecord(draftValue) ?? {}) as Record<string, unknown>,
        (asRecord(catalogSeed[key]) ?? {}) as Record<string, unknown>,
        node,
        fieldPath,
      )
      if (child.collections) {
        delta = mergeObjectDelta(delta, { collections: child.collections })
      }
      const hasScalars = Object.keys(child.set ?? {}).length > 0 || (child.clear?.length ?? 0) > 0
      if (hasScalars) {
        delta = mergeObjectDelta(delta, { set: { [key]: draftValue } })
      }
      continue
    }

    if (node.kind === 'value-list') {
      if (overlayValueEqual(baselineValue, draftValue)) continue
      delta = mergeObjectDelta(delta, { set: { [key]: draftValue } })
      continue
    }

    if (node.kind === 'identity') {
      const collectionDelta = diffIdentityOrValueCollection(
        baselineValue,
        draftValue,
        catalogSeed[key],
        node,
        fieldPath,
      )
      if (collectionDelta) {
        delta = mergeObjectDelta(delta, { collections: { [fieldPath]: collectionDelta } })
      }
      continue
    }

    if (!draftPresent && baselinePresent && node.presence !== 'required') {
      delta = mergeObjectDelta(delta, { clear: [key] })
      continue
    }
    if (!draftPresent && !baselinePresent) continue
    if (overlayValueEqual(baselineValue, draftValue)) continue
    delta = mergeObjectDelta(delta, { set: { [key]: draftValue } })
  }
  return pruneObjectDelta(delta)
}

function diffIdentityOrValueCollection(
  baselineValue: unknown,
  draftValue: unknown,
  catalogSeedValue: unknown,
  policy: OverlayPolicyNode,
  path: string,
): CollectionDelta | undefined {
  if (policy.kind === 'value-list') {
    if (overlayValueEqual(baselineValue, draftValue)) return undefined
    if (overlayValueEqual(draftValue, catalogSeedValue)) {
      return { reset: true }
    }
    return undefined
  }
  if (policy.kind !== 'identity') return undefined
  return diffIdentityCollection(
    asArray(baselineValue),
    asArray(draftValue),
    asArray(catalogSeedValue),
    policy,
    path,
  )
}

function indexRows(
  rows: readonly unknown[],
  idKey: 'id' | 'entryId',
): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>()
  for (const row of rows) {
    const record = asRecord(row)
    const id = record ? readIdentityId(record, idKey) : undefined
    if (id && record) map.set(id, record)
  }
  return map
}

// fallow-ignore-next-line complexity — identity collection add/remove/override/order diff
function diffIdentityCollection(
  baselineRows: unknown[],
  draftRows: unknown[],
  catalogSeedRows: unknown[],
  policy: Extract<OverlayPolicyNode, { kind: 'identity' }>,
  path: string,
): CollectionDelta | undefined {
  if (overlayValueEqual(baselineRows, draftRows)) return undefined
  if (overlayValueEqual(draftRows, catalogSeedRows)) {
    return { reset: true }
  }

  const catalogSeedIds = new Set(seedIdentityIds(catalogSeedRows, policy.idKey))
  const baselineById = indexRows(baselineRows, policy.idKey)
  const draftById = indexRows(draftRows, policy.idKey)

  const removedIds: string[] = []
  const restoreIds: string[] = []
  const additions: Array<{ id: string; row: Record<string, unknown> }> = []
  const overrides: Array<SeedFieldDelta | SeedRowReplace> = []

  for (const id of baselineById.keys()) {
    if (!draftById.has(id)) removedIds.push(id)
  }

  for (const [id, draftRow] of draftById) {
    const baselineRow = baselineById.get(id)
    if (!baselineRow) {
      if (catalogSeedIds.has(id)) {
        const catalogRow = indexRows(catalogSeedRows, policy.idKey).get(id)
        if (catalogRow && !overlayValueEqual(draftRow, catalogRow)) {
          const rowDelta = diffSeedRow(catalogRow, draftRow, policy.row, `${path}.${id}`)
          if (rowDelta) overrides.push({ origin: 'seed', id, ...rowDelta })
        }
        restoreIds.push(id)
      } else {
        additions.push({ id, row: draftRow })
      }
      continue
    }

    if (!catalogSeedIds.has(id)) continue

    const catalogRow = indexRows(catalogSeedRows, policy.idKey).get(id)
    const discriminator = unionDiscriminator(policy.row)
    if (
      discriminator &&
      catalogRow &&
      baselineRow[discriminator] !== draftRow[discriminator] &&
      baselineRow[discriminator] !== undefined
    ) {
      overrides.push({ origin: 'seed', id, mode: 'replace', row: draftRow })
      continue
    }

    const seedBase = catalogRow ?? baselineRow
    const rowDelta = diffSeedRow(seedBase, draftRow, policy.row, `${path}.${id}`)
    if (rowDelta) {
      overrides.push({ origin: 'seed', id, ...rowDelta })
    }
  }

  const delta: CollectionDelta = {}
  if (removedIds.length > 0) delta.removedIds = removedIds
  if (restoreIds.length > 0) delta.restoreIds = restoreIds
  if (additions.length > 0) delta.additions = additions
  if (overrides.length > 0) delta.overrides = overrides

  if (policy.order === 'authored') {
    const removed = new Set(removedIds)
    const homebrewAdditions = additions.map((row) => ({
      origin: 'homebrew' as const,
      id: row.id,
      row: row.row,
    }))
    const canonical = canonicalIdentityOrder(
      catalogSeedRows,
      homebrewAdditions,
      removed,
      policy.idKey,
    )
    const draftOrder = draftRows
      .map((row) => readIdentityId(row, policy.idKey))
      .filter((id): id is string => Boolean(id))
    if (!overlayValueEqual(draftOrder, canonical)) {
      delta.order = draftOrder
    }
  }

  if (Object.keys(delta).length === 0) return undefined
  return delta
}

// fallow-ignore-next-line complexity — nested seed row field and collection deltas
function diffSeedRow(
  seedRow: Record<string, unknown>,
  draftRow: Record<string, unknown>,
  rowPolicy: OverlayPolicyNode,
  path: string,
): Omit<SeedFieldDelta, 'origin' | 'id'> | undefined {
  const activePolicy = overlayPolicyForRow(draftRow, rowPolicy) ?? rowPolicy
  if (activePolicy.kind === 'deep') {
    const nested = diffObjectLevel(seedRow, draftRow, seedRow, activePolicy, path)
    if (Object.keys(nested).length === 0) return undefined
    if (nested.collections && Object.keys(nested.set ?? {}).length === 0 && !nested.clear) {
      return { collections: nested.collections }
    }
    const set: Record<string, unknown> = { ...(nested.set ?? {}) }
    for (const [key, value] of Object.entries(draftRow)) {
      if (!(key in set) && !overlayValueEqual(seedRow[key], value)) {
        set[key] = value
      }
    }
    if (Object.keys(set).length === 0 && !nested.collections) return undefined
    return {
      ...(Object.keys(set).length > 0 ? { set } : {}),
      ...(nested.clear ? { clear: nested.clear } : {}),
      ...(nested.collections ? { collections: nested.collections } : {}),
    }
  }
  if (overlayValueEqual(seedRow, draftRow)) return undefined
  return { set: { ...draftRow } }
}

function diffObjectLevel(
  baseline: Record<string, unknown>,
  draft: Record<string, unknown>,
  catalogSeed: Record<string, unknown>,
  policy: OverlayPolicyNode,
  path: string,
): ObjectDelta {
  if (policy.kind !== 'deep') {
    if (overlayValueEqual(baseline, draft)) return {}
    return { set: { ...draft } }
  }

  const pathPrefix = path
  const scalarDelta = diffScalarsAndAtomics(baseline, draft, catalogSeed, policy, pathPrefix)
  return pruneObjectDelta(scalarDelta)
}

function resolveRootOverlayPolicy(
  catalogSeed: Record<string, unknown>,
  baseline: Record<string, unknown>,
  draft: Record<string, unknown>,
  policy: OverlayPolicyNode,
): OverlayPolicyNode {
  return (
    overlayPolicyForRow(draft, policy) ??
    overlayPolicyForRow(baseline, policy) ??
    overlayPolicyForRow(catalogSeed, policy) ??
    policy
  )
}

/** Build overlay update intent by diffing normalized baseline and draft form bodies. */
export function buildSystemOverlayIntent(input: BuildSystemOverlayIntentInput): ObjectDelta {
  const { policy, catalogSeed, baseline, draft } = input
  const activePolicy = resolveRootOverlayPolicy(catalogSeed, baseline, draft, policy)
  return diffObjectLevel(baseline, draft, catalogSeed, activePolicy, '')
}
