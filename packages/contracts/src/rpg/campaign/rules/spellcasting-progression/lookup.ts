import type { ProgressionExtension } from '../../../vocab/spell/progression-extension'
import type { ProgressionCurveRow } from './progression-curve'
import { progressionCurveRowMap, resolveMaxAuthoredCurveLevel } from './progression-curve'

// ---------------------------------------------------------------------------
// Progression lookup — kind-specific sparse semantics and extension policies.
// ---------------------------------------------------------------------------

export type ProgressionValueProvenance = 'authored' | 'derived' | 'unresolved'

export type ResolvedProgressionValue = {
  count: number
  provenance: ProgressionValueProvenance
}

export type ProgressionLookupKind = 'capacity' | 'gain'

function resolveCapacityWithinRange(
  rows: readonly ProgressionCurveRow[],
  level: number,
  rowMap: ReadonlyMap<number, number>,
): ResolvedProgressionValue {
  let value: number | undefined
  for (const row of [...rows].sort((left, right) => left.level - right.level)) {
    if (row.level <= level) value = row.count
  }
  return {
    count: value ?? 0,
    provenance: rowMap.has(level) ? 'authored' : value !== undefined ? 'derived' : 'derived',
  }
}

function resolveGainWithinRange(
  _rows: readonly ProgressionCurveRow[],
  level: number,
  rowMap: ReadonlyMap<number, number>,
): ResolvedProgressionValue {
  const authored = rowMap.get(level)
  return {
    count: authored ?? 0,
    provenance: authored !== undefined ? 'authored' : 'derived',
  }
}

function resolveWithinAuthoredRange(input: {
  kind: ProgressionLookupKind
  rows: readonly ProgressionCurveRow[]
  level: number
}): ResolvedProgressionValue {
  const rowMap = progressionCurveRowMap(input.rows)
  return input.kind === 'gain'
    ? resolveGainWithinRange(input.rows, input.level, rowMap)
    : resolveCapacityWithinRange(input.rows, input.level, rowMap)
}

/**
 * Capacity: missing row within authored range → previous capacity (fill-forward).
 * Gain: missing row within authored range → 0.
 */
export function resolveProgressionValueAtLevel(input: {
  kind: ProgressionLookupKind
  rows: readonly ProgressionCurveRow[]
  level: number
  extension: ProgressionExtension
}): ResolvedProgressionValue {
  const maxAuthored = resolveMaxAuthoredCurveLevel(input.rows)

  if (maxAuthored === 0) {
    return resolveBeyondAuthoredRange({ ...input, maxAuthored })
  }

  if (input.level <= maxAuthored) {
    return resolveWithinAuthoredRange(input)
  }

  return resolveBeyondAuthoredRange({ ...input, maxAuthored })
}

function resolveBeyondAuthoredRange(input: {
  kind: ProgressionLookupKind
  rows: readonly ProgressionCurveRow[]
  level: number
  extension: ProgressionExtension
  maxAuthored: number
}): ResolvedProgressionValue {
  if (input.extension === 'explicit') {
    return { count: 0, provenance: 'unresolved' }
  }

  if (input.extension === 'zero') {
    return { count: 0, provenance: 'derived' }
  }

  const anchor =
    input.maxAuthored > 0
      ? resolveWithinAuthoredRange({
          kind: input.kind,
          rows: input.rows,
          level: input.maxAuthored,
        })
      : { count: 0, provenance: 'derived' as const }

  return { count: anchor.count, provenance: 'derived' }
}

/** Cumulative sum of gain rows from level 1 through `level` (inclusive). */
export function resolveGainQuotaThroughLevel(input: {
  rows: readonly ProgressionCurveRow[]
  level: number
  extension: ProgressionExtension
}): ResolvedProgressionValue {
  let total = 0
  let hasUnresolved = false

  for (let current = 1; current <= input.level; current += 1) {
    const resolved = resolveProgressionValueAtLevel({
      kind: 'gain',
      rows: input.rows,
      level: current,
      extension: input.extension,
    })
    if (resolved.provenance === 'unresolved') {
      hasUnresolved = true
    }
    total += resolved.count
  }

  return {
    count: total,
    provenance: hasUnresolved ? 'unresolved' : total > 0 ? 'derived' : 'derived',
  }
}

/** Normalize slot arrays by trimming trailing zeros. */
export function normalizeSlotCounts(slots: readonly number[]): number[] {
  const copy = [...slots]
  while (copy.length > 0 && (copy.at(-1) ?? 0) === 0) {
    copy.pop()
  }
  return copy
}

/** Expand normalized slots to a fixed display width (e.g. 9 spell levels). */
export function expandSlotCountsForDisplay(
  slots: readonly number[],
  width: number,
): readonly number[] {
  return Array.from({ length: width }, (_, index) => slots[index] ?? 0)
}
