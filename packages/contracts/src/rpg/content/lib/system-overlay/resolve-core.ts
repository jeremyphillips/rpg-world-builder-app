import type { SeedFieldDelta, SeedRowReplace } from './intent'
import type { OverlayReadDiagnostics, OverlayApplyFailure } from './overlay-failures'
import {
  canonicalIdentityOrder,
  mergeCatalogSeedOrder,
  ordersEqual,
  readIdentityId,
  validateAuthoredOrder,
} from './order'
import type { OverlayPolicyNode } from './policy'
import type {
  LegacyHold,
  StoredCollection,
  StoredIdentityCollection,
  StoredOverlay,
  StoredSeedOverride,
} from './stored'
import { overlayValueEqual } from './value-equal'

export type ObjectOverlaySlice = {
  set?: Record<string, unknown>
  clear?: string[]
  restore?: string[]
  collections?: Record<string, StoredCollection>
}

export type ResolveFailure = OverlayApplyFailure

export type ResolveSuccess = {
  value: unknown
  diagnostics: OverlayReadDiagnostics
}

export type ResolveResult =
  | { ok: true; result: ResolveSuccess }
  | { ok: false; failure: ResolveFailure }

const EMPTY_DIAGNOSTICS: OverlayReadDiagnostics = {
  orphanedSeedOverrides: [],
  identityConflicts: [],
}

function mergeDiagnostics(
  left: OverlayReadDiagnostics,
  right: OverlayReadDiagnostics,
): OverlayReadDiagnostics {
  return {
    orphanedSeedOverrides: [...left.orphanedSeedOverrides, ...right.orphanedSeedOverrides],
    identityConflicts: [...left.identityConflicts, ...right.identityConflicts],
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) }
  }
  return {}
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function policyForUnionRow(
  row: Record<string, unknown>,
  policy: Extract<OverlayPolicyNode, { kind: 'union' }>,
): OverlayPolicyNode | undefined {
  for (const branch of policy.branches) {
    if (row[branch.discriminator] === branch.value) return branch.node
  }
  return undefined
}

/** Resolve policy for a concrete row when the schema root (or row) is a discriminated union. */
export function overlayPolicyForRow(
  row: Record<string, unknown>,
  policy: OverlayPolicyNode,
): OverlayPolicyNode | undefined {
  if (policy.kind === 'union') return policyForUnionRow(row, policy)
  return policy
}

function legacyRetentionFailure(
  retention: 'legacy-array' | 'legacy-hold',
  path: string,
): ResolveFailure {
  return { code: 'unsupported-overlay-retention', retention, path }
}

function resolveValueList(
  seedValue: unknown,
  stored: StoredCollection | undefined,
  slice: ObjectOverlaySlice,
  fieldKey: string,
  path: string,
): ResolveResult {
  if (stored?.kind === 'legacy-array') {
    return { ok: false, failure: legacyRetentionFailure('legacy-array', path) }
  }
  if (stored?.kind === 'identity') {
    return {
      ok: false,
      failure: {
        code: 'overlay-validation',
        issues: [`Stored identity collection at value-list path ${path}`],
      },
    }
  }
  const fromSet = slice.set?.[fieldKey]
  if (fromSet !== undefined) {
    return { ok: true, result: { value: fromSet, diagnostics: EMPTY_DIAGNOSTICS } }
  }
  if (stored?.kind === 'value-list') {
    return { ok: true, result: { value: [...stored.items], diagnostics: EMPTY_DIAGNOSTICS } }
  }
  return { ok: true, result: { value: asArray(seedValue), diagnostics: EMPTY_DIAGNOSTICS } }
}

type OverrideEntry = StoredSeedOverride | SeedRowReplace | LegacyHold

function overrideMaps(overrides: readonly OverrideEntry[]) {
  const byId = new Map<string, OverrideEntry>()
  for (const entry of overrides) {
    byId.set(entry.id, entry)
  }
  return byId
}

// fallow-ignore-next-line complexity — nested row override merge across deep collection paths
function mergeSeedOverrideRow(
  seedRow: Record<string, unknown>,
  override: StoredSeedOverride,
  rowPolicy: OverlayPolicyNode,
  path: string,
): ResolveResult {
  let row = { ...seedRow }
  for (const key of override.restore ?? []) {
    if (key in seedRow) row[key] = seedRow[key]
    else delete row[key]
  }
  for (const key of override.clear ?? []) {
    delete row[key]
  }
  if (override.set) {
    row = { ...row, ...override.set }
  }
  const collections = override.collections
  if (!collections) {
    return { ok: true, result: { value: row, diagnostics: EMPTY_DIAGNOSTICS } }
  }
  const activePolicy = overlayPolicyForRow(row, rowPolicy)
  if (!activePolicy || activePolicy.kind !== 'deep') {
    return {
      ok: false,
      failure: {
        code: 'overlay-validation',
        issues: [`Nested collection overrides at non-deep row policy ${path}`],
      },
    }
  }
  let diagnostics = EMPTY_DIAGNOSTICS
  for (const [key, storedCollection] of Object.entries(collections)) {
    const childPolicy = activePolicy.fields[key]
    if (!childPolicy) {
      return {
        ok: false,
        failure: {
          code: 'overlay-validation',
          issues: [`Unknown nested collection ${path}.${key}`],
        },
      }
    }
    const child = resolveCollection(
      row[key],
      storedCollection,
      childPolicy,
      {
        set: undefined,
        clear: undefined,
        restore: undefined,
        collections: undefined,
      },
      key,
      `${path}.${key}`,
    )
    if (!child.ok) return child
    row[key] = child.result.value
    diagnostics = mergeDiagnostics(diagnostics, child.result.diagnostics)
  }
  return { ok: true, result: { value: row, diagnostics } }
}

// fallow-ignore-next-line complexity — identity collection read merges seed, overrides, and order
function resolveIdentityCollection(
  seedValue: unknown,
  stored: StoredIdentityCollection | undefined,
  policy: Extract<OverlayPolicyNode, { kind: 'identity' }>,
  path: string,
): ResolveResult {
  const seedRows = asArray(seedValue)
  const seedIds = new Set<string>()
  for (const row of seedRows) {
    const id = readIdentityId(row, policy.idKey)
    if (id) seedIds.add(id)
  }

  const removed = new Set(stored?.removedIds ?? [])
  const overrides = overrideMaps(stored?.overrides ?? [])
  const additions = stored?.additions ?? []

  let diagnostics = EMPTY_DIAGNOSTICS
  const liveRows = new Map<string, unknown>()

  for (const row of seedRows) {
    const id = readIdentityId(row, policy.idKey)
    if (!id || removed.has(id)) continue
    const seedRecord = asRecord(row)
    const override = overrides.get(id)
    if (override && 'retention' in override && override.retention === 'legacy') {
      return { ok: false, failure: legacyRetentionFailure('legacy-hold', `${path}[${id}]`) }
    }
    if (override && 'mode' in override && override.mode === 'replace') {
      liveRows.set(id, { ...override.row })
      continue
    }
    if (override && override.origin === 'seed' && !('mode' in override)) {
      const merged = mergeSeedOverrideRow(seedRecord, override, policy.row, `${path}[${id}]`)
      if (!merged.ok) return merged
      liveRows.set(id, merged.result.value)
      diagnostics = mergeDiagnostics(diagnostics, merged.result.diagnostics)
      continue
    }
    liveRows.set(id, seedRecord)
  }

  for (const [id, override] of overrides) {
    if (seedIds.has(id)) continue
    if ('retention' in override && override.retention === 'legacy') {
      return { ok: false, failure: legacyRetentionFailure('legacy-hold', `${path}[${id}]`) }
    }
    if (override.origin === 'seed') {
      diagnostics = {
        ...diagnostics,
        orphanedSeedOverrides: [...diagnostics.orphanedSeedOverrides, id],
      }
    }
  }

  for (const addition of additions) {
    if (removed.has(addition.id)) continue
    if (seedIds.has(addition.id)) {
      diagnostics = {
        ...diagnostics,
        identityConflicts: [...diagnostics.identityConflicts, addition.id],
      }
      continue
    }
    liveRows.set(addition.id, { ...addition.row })
  }

  const liveIds = new Set(liveRows.keys())
  const canonical = canonicalIdentityOrder(seedRows, additions, removed, policy.idKey)

  let sequence = canonical
  if (policy.order === 'authored' && stored?.order) {
    const merged = mergeCatalogSeedOrder(stored.order, seedRows, liveIds, policy.idKey)
    const issue = validateAuthoredOrder(merged, liveIds)
    if (issue) {
      return { ok: false, failure: { code: 'overlay-invalid-order', path } }
    }
    sequence = merged
  }

  const rows = sequence.filter((id) => liveRows.has(id)).map((id) => liveRows.get(id))

  return { ok: true, result: { value: rows, diagnostics } }
}

function resolveCollection(
  seedValue: unknown,
  stored: StoredCollection | undefined,
  policy: OverlayPolicyNode,
  slice: ObjectOverlaySlice,
  fieldKey: string,
  path: string,
): ResolveResult {
  if (stored?.kind === 'legacy-array') {
    return { ok: false, failure: legacyRetentionFailure('legacy-array', path) }
  }
  if (policy.kind === 'value-list') {
    return resolveValueList(seedValue, stored, slice, fieldKey, path)
  }
  if (policy.kind === 'identity') {
    if (stored && stored.kind !== 'identity') {
      return {
        ok: false,
        failure: {
          code: 'overlay-validation',
          issues: [
            `Stored collection kind ${stored.kind} does not match identity policy at ${path}`,
          ],
        },
      }
    }
    return resolveIdentityCollection(seedValue, stored, policy, path)
  }
  return {
    ok: false,
    failure: { code: 'overlay-validation', issues: [`Path ${path} is not a collection`] },
  }
}

// fallow-ignore-next-line complexity — slices dotted collection paths for nested deep overlays
function childOverlaySlice(parent: ObjectOverlaySlice, fieldKey: string): ObjectOverlaySlice {
  const childPrefix = fieldKey ? `${fieldKey}.` : ''
  const childCollections: Record<string, StoredCollection> = {}
  for (const [path, value] of Object.entries(parent.collections ?? {})) {
    if (fieldKey === '' && !path.includes('.')) {
      childCollections[path] = value
      continue
    }
    if (path.startsWith(childPrefix)) {
      childCollections[path.slice(childPrefix.length)] = value
    }
  }
  const parentSet = parent.set?.[fieldKey]
  const childSet =
    typeof parentSet === 'object' && parentSet !== null && !Array.isArray(parentSet)
      ? (parentSet as Record<string, unknown>)
      : undefined
  return {
    set: childSet,
    clear: undefined,
    restore: undefined,
    collections: Object.keys(childCollections).length > 0 ? childCollections : undefined,
  }
}

function storedCollectionAt(
  collections: Record<string, StoredCollection> | undefined,
  fieldPath: string,
  fieldKey: string,
): StoredCollection | undefined {
  return collections?.[fieldPath] ?? collections?.[fieldKey]
}

// fallow-ignore-next-line complexity — walks compiled policy tree while applying overlay slices
export function resolveDeepObject(
  seedValue: unknown,
  overlay: ObjectOverlaySlice | undefined,
  policy: Extract<OverlayPolicyNode, { kind: 'deep' }>,
  path: string,
): ResolveResult {
  const seed = asRecord(seedValue)
  const slice = overlay ?? {}
  const restore = new Set(slice.restore ?? [])
  const clear = new Set(slice.clear ?? [])
  const result: Record<string, unknown> = { ...seed }
  let diagnostics = EMPTY_DIAGNOSTICS

  for (const key of clear) {
    const node = policy.fields[key]
    if (!node) {
      return {
        ok: false,
        failure: { code: 'overlay-validation', issues: [`Unknown clear path ${path}.${key}`] },
      }
    }
    if (node.presence === 'required') {
      return {
        ok: false,
        failure: {
          code: 'overlay-validation',
          issues: [`Cannot clear required field ${path}.${key}`],
        },
      }
    }
    delete result[key]
  }

  for (const [key, node] of Object.entries(policy.fields)) {
    if (restore.has(key)) {
      result[key] = seed[key]
      continue
    }
    if (clear.has(key)) continue

    const fieldPath = path ? `${path}.${key}` : key
    const storedCollection = storedCollectionAt(slice.collections, fieldPath, key)
    if (node.kind === 'identity' || node.kind === 'value-list') {
      const resolved = resolveCollection(seed[key], storedCollection, node, slice, key, fieldPath)
      if (!resolved.ok) return resolved
      result[key] = resolved.result.value
      diagnostics = mergeDiagnostics(diagnostics, resolved.result.diagnostics)
      continue
    }
    if (node.kind === 'deep') {
      const childOverlay = childOverlaySlice(slice, key)
      const resolved = resolveDeepObject(seed[key], childOverlay, node, fieldPath)
      if (!resolved.ok) return resolved
      result[key] = resolved.result.value
      diagnostics = mergeDiagnostics(diagnostics, resolved.result.diagnostics)
      continue
    }
    if (slice.set && key in slice.set) {
      result[key] = slice.set[key]
    }
  }

  if (slice.set) {
    for (const [key, value] of Object.entries(slice.set)) {
      const node = policy.fields[key]
      if (!node) {
        return {
          ok: false,
          failure: { code: 'overlay-validation', issues: [`Unknown set path ${path}.${key}`] },
        }
      }
      if (node.kind === 'scalar' || node.kind === 'atomic' || node.kind === 'value-list') {
        result[key] = value
      }
    }
  }

  return { ok: true, result: { value: result, diagnostics } }
}

export function resolveWithPolicy(
  seed: Record<string, unknown>,
  overlay: StoredOverlay | null,
  policy: OverlayPolicyNode,
): ResolveResult {
  const activePolicy = overlayPolicyForRow(seed, policy)
  if (!activePolicy || activePolicy.kind !== 'deep') {
    return {
      ok: false,
      failure: {
        code: 'overlay-validation',
        issues: [
          activePolicy
            ? 'Root overlay policy must be deep'
            : 'No overlay union branch matches seed row',
        ],
      },
    }
  }
  const slice: ObjectOverlaySlice | undefined = overlay
    ? {
        set: overlay.set,
        clear: overlay.clear,
        restore: overlay.restore,
        collections: overlay.collections,
      }
    : undefined
  return resolveDeepObject(seed, slice, activePolicy, '')
}

export function resolveSeedOverrideIntent(
  seedRow: Record<string, unknown>,
  delta: SeedFieldDelta,
  rowPolicy: OverlayPolicyNode,
  path: string,
): ResolveResult {
  const stored: StoredSeedOverride = {
    origin: 'seed',
    id: delta.id,
    set: delta.set,
    clear: delta.clear,
    restore: delta.restore,
    collections: delta.collections as Record<string, StoredCollection> | undefined,
  }
  return mergeSeedOverrideRow(seedRow, stored, rowPolicy, path)
}

export function storedOrderAfterLiveIds(
  order: readonly string[] | undefined,
  canonical: readonly string[],
  policyOrder: 'authored' | 'immaterial',
): string[] | undefined {
  if (policyOrder === 'immaterial' || !order) return undefined
  const filtered = order.filter((id) => canonical.includes(id))
  if (filtered.length === 0) return undefined
  if (ordersEqual(filtered, canonical)) return undefined
  return filtered
}

// fallow-ignore-next-line complexity — merges identity collection intent into stored overlay state
export function intentCollectionToStoredIdentity(
  current: StoredIdentityCollection | undefined,
  delta: import('./intent').CollectionDelta,
  seedRows: readonly unknown[],
  policy: Extract<OverlayPolicyNode, { kind: 'identity' }>,
): { stored?: StoredIdentityCollection; failure?: ResolveFailure } {
  if (delta.reset) return { stored: undefined }

  const seedIds = new Set<string>()
  for (const row of seedRows) {
    const id = readIdentityId(row, policy.idKey)
    if (id) seedIds.add(id)
  }

  for (const id of delta.removedIds ?? []) {
    if (seedIds.has(id) && policy.missingSeedRow === 'restore') {
      return {
        failure: {
          code: 'overlay-validation',
          issues: [`Seed row ${id} cannot be removed when missingSeedRow is restore`],
        },
      }
    }
  }

  let overrides = [...(current?.overrides ?? [])]
  const byId = new Map(overrides.map((row) => [row.id, row]))
  for (const entry of delta.overrides ?? []) {
    if ('mode' in entry && entry.mode === 'replace') {
      byId.set(entry.id, { origin: 'seed', id: entry.id, mode: 'replace', row: entry.row })
      continue
    }
    byId.set(entry.id, {
      origin: 'seed',
      id: entry.id,
      set: entry.set,
      clear: entry.clear,
      restore: entry.restore,
      collections: entry.collections as Record<string, StoredCollection> | undefined,
    })
  }
  overrides = [...byId.values()]

  const additionById = new Map((current?.additions ?? []).map((row) => [row.id, row]))
  for (const addition of delta.additions ?? []) {
    additionById.set(addition.id, { origin: 'homebrew', id: addition.id, row: addition.row })
  }
  for (const id of delta.removedIds ?? []) {
    additionById.delete(id)
  }
  const homebrewAdditions = [...additionById.values()]

  let removed = new Set(current?.removedIds ?? [])
  for (const id of delta.removedIds ?? []) removed.add(id)
  for (const id of delta.restoreIds ?? []) removed.delete(id)

  const canonical = canonicalIdentityOrder(seedRows, homebrewAdditions, removed, policy.idKey)

  let order = current?.order
  if (delta.restoreOrder) order = undefined
  if (delta.order) order = [...delta.order]

  order = storedOrderAfterLiveIds(order, canonical, policy.order)

  const stored: StoredIdentityCollection = {
    kind: 'identity',
    overrides,
    additions: homebrewAdditions,
    removedIds: [...removed],
    ...(order ? { order } : {}),
  }

  if (
    overrides.length === 0 &&
    homebrewAdditions.length === 0 &&
    stored.removedIds.length === 0 &&
    !stored.order
  ) {
    return { stored: undefined }
  }

  return { stored }
}

// fallow-ignore-next-line complexity — drops scalar set entries that match current seed values
export function normalizeScalarSet(
  seed: Record<string, unknown>,
  overlay: StoredOverlay,
  policy: OverlayPolicyNode,
): StoredOverlay {
  const activePolicy = overlayPolicyForRow(seed, policy) ?? policy
  if (activePolicy.kind !== 'deep' || !overlay.set) return overlay
  const nextSet: Record<string, unknown> = { ...overlay.set }
  const restore = new Set(overlay.restore ?? [])
  for (const key of Object.keys(nextSet)) {
    const node = activePolicy.fields[key]
    if (!node) continue
    if (node.kind !== 'scalar' && node.kind !== 'atomic' && node.kind !== 'value-list') continue
    if (overlayValueEqual(nextSet[key], seed[key])) {
      delete nextSet[key]
      restore.add(key)
    }
  }
  return {
    ...overlay,
    set: Object.keys(nextSet).length > 0 ? nextSet : undefined,
    restore: restore.size > 0 ? [...restore] : overlay.restore,
  }
}
