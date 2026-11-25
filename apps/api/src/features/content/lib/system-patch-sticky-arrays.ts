import { stripContentProvenanceForPatch } from '@rpg/contracts'

import { deepMerge, type DeepMergeOptions } from './deep-merge'
import { stripNullDeep } from './strip-null-deep'

/**
 * Monster system-patch policy for id-keyed lists (`traits`, `actions`,
 * `bonusActions`, `reactions`).
 *
 * This is a field-level diff against the catalog seed, not a row-level patch.
 * When a sticky list differs from the seed, the whole array is stored. Until
 * that override is removed, later catalog additions stay hidden, untouched seed
 * rows stay at the patched values, and reordering changes the stored array.
 * A list that deep-equals the seed is omitted, so later seed edits show up.
 *
 * Omitted update keys are left on the effective body. A present array is an
 * explicit replacement: seed-origin ids are put back, and homebrew ids that
 * are absent from the request are removed. The server cannot tell an accidental
 * `[]` from an intentional clear. Already-dropped homebrew rows cannot be
 * rebuilt from the seed.
 *
 * Read repair uses the same row restore in memory and does not write Mongo.
 * Writes replace the patch document (`$set` of this result). That read-modify-write
 * has no patch revision: a concurrent save can drop the other update. This does
 * not add a transaction.
 */

type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function rowId(row: unknown): string | undefined {
  if (!isPlainObject(row)) return undefined
  const id = row.id
  return typeof id === 'string' && id.length > 0 ? id : undefined
}

function asRows(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

/** Key order independent. Missing and `undefined` are equal. */
export function systemPatchDeepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (left === undefined || right === undefined) return left === right
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((entry, index) => systemPatchDeepEqual(entry, right[index]))
    )
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left)
    if (leftKeys.length !== Object.keys(right).length) return false
    return leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(right, key) &&
        systemPatchDeepEqual(left[key], right[key]),
    )
  }
  return false
}

function indexRowsById(rows: readonly unknown[]): Map<string, unknown> {
  const byId = new Map<string, unknown>()
  for (const row of rows) {
    const id = rowId(row)
    if (id && !byId.has(id)) byId.set(id, row)
  }
  return byId
}

function appendRequestedRows(requestedRows: readonly unknown[], seen: Set<string>): unknown[] {
  const result: unknown[] = []
  for (const row of requestedRows) {
    const id = rowId(row)
    if (id) {
      if (seen.has(id)) continue
      seen.add(id)
    }
    result.push(row)
  }
  return result
}

/**
 * Request order first, then missing seed ids in catalog order.
 * An empty seed list stays empty. Duplicate ids keep the first row.
 */
export function reconcileStickyRows(
  seedRows: readonly unknown[],
  effectiveRows: readonly unknown[],
  requestedRows: readonly unknown[],
): unknown[] {
  const seedById = indexRowsById(seedRows)
  const effectiveById = indexRowsById(effectiveRows)
  const seen = new Set<string>()
  const result = appendRequestedRows(requestedRows, seen)
  for (const id of seedById.keys()) {
    if (seen.has(id)) continue
    const restored = effectiveById.get(id) ?? seedById.get(id)
    if (restored !== undefined) result.push(restored)
  }
  return result
}

/** In-memory fill of missing seed-origin rows. Returns `merged` unchanged when nothing is missing. */
export function restoreStickySeedRows<T extends PlainObject>(
  seed: PlainObject,
  merged: T,
  stickyArrayKeys: readonly string[],
): T {
  let next: PlainObject | undefined
  for (const key of stickyArrayKeys) {
    const seedRows = seed[key]
    if (!Array.isArray(seedRows)) continue
    const mergedRows = asRows(merged[key])
    const repaired = reconcileStickyRows(seedRows, mergedRows, mergedRows)
    if (systemPatchDeepEqual(repaired, mergedRows)) continue
    next ??= { ...merged }
    next[key] = repaired
  }
  return (next as T | undefined) ?? merged
}

export type ComposeMonsterSystemPatchArgs = {
  seedBody: PlainObject
  existingPatch: PlainObject | undefined
  update: PlainObject
  replaceKeys?: DeepMergeOptions['replaceKeys']
  tombstoneKeys?: readonly string[]
  stickyArrayKeys: readonly string[]
}

/**
 * Builds the resolved monster body and the patch document that replaces the
 * stored overlay. Response rows are read-repaired. The stored patch is the
 * field diff of the unrepaired body against the seed, so an omitted list does
 * not drop a poisoned `[]` until a later update includes that list.
 */
function applySystemPatchUpdate(
  effective: PlainObject,
  seedBody: PlainObject,
  update: PlainObject,
  stickyArrayKeys: readonly string[],
  replaceKeys: DeepMergeOptions['replaceKeys'],
): PlainObject {
  const desired: PlainObject = { ...effective }
  const updateRest: PlainObject = {}
  for (const [key, value] of Object.entries(update)) {
    if (value === undefined) continue
    if (value === null) {
      delete desired[key]
      continue
    }
    if (stickyArrayKeys.includes(key) && Array.isArray(value)) {
      desired[key] = reconcileStickyRows(asRows(seedBody[key]), asRows(effective[key]), value)
      continue
    }
    updateRest[key] = value
  }
  return deepMerge(desired, updateRest, { replaceKeys })
}

function diffAgainstSeed(
  comparableSeed: PlainObject,
  comparableDesired: PlainObject,
  tombstoneKeys: ReadonlySet<string>,
): PlainObject {
  const cumulativePatch: PlainObject = {}
  const keys = new Set([...Object.keys(comparableSeed), ...Object.keys(comparableDesired)])
  for (const key of keys) {
    const seedValue = comparableSeed[key]
    const desiredValue = comparableDesired[key]
    if (systemPatchDeepEqual(seedValue, desiredValue)) continue
    if (desiredValue === undefined) {
      if (seedValue !== undefined && tombstoneKeys.has(key)) cumulativePatch[key] = null
      continue
    }
    cumulativePatch[key] = desiredValue
  }
  return cumulativePatch
}

export function composeMonsterSystemPatch(args: ComposeMonsterSystemPatchArgs): {
  mergedBody: PlainObject
  cumulativePatch: PlainObject
} {
  const { seedBody, update, stickyArrayKeys } = args
  const effective = stripNullDeep(
    deepMerge(seedBody, args.existingPatch ?? {}, {
      replaceKeys: args.replaceKeys,
      tombstoneKeys: args.tombstoneKeys,
    }),
  ) as PlainObject
  const storedBody = stripNullDeep(
    applySystemPatchUpdate(effective, seedBody, update, stickyArrayKeys, args.replaceKeys),
  ) as PlainObject

  // Entry provenance is reattached on read and is not part of the overlay.
  // Compare stripped bodies so a traits list that only lost provenance is not
  // stored as a permanent override.
  const comparableSeed = stripContentProvenanceForPatch(seedBody, 'monsters')
  const comparableDesired = stripContentProvenanceForPatch(storedBody, 'monsters')

  return {
    mergedBody: restoreStickySeedRows(seedBody, storedBody, stickyArrayKeys),
    cumulativePatch: diffAgainstSeed(
      comparableSeed,
      comparableDesired,
      new Set(args.tombstoneKeys ?? []),
    ),
  }
}
