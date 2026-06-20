import { MAX_CHARACTER_LEVEL, type Spellcasting } from '@rpg/contracts'

type CantripsKnownEntry = NonNullable<Spellcasting['cantrips']>[number]
type SpellsAvailableEntry = NonNullable<Spellcasting['spellsAvailable']>[number]

export type ProgressionTableFormValue = {
  cantrips: (number | null)[]
  spellsAvailable: (number | null)[]
}

function emptyProgressionTable(rowCount = MAX_CHARACTER_LEVEL): ProgressionTableFormValue {
  return {
    cantrips: Array.from({ length: rowCount }, () => null),
    spellsAvailable: Array.from({ length: rowCount }, () => null),
  }
}

function fillForwardAtLevel(
  entries: { level: number; value: number }[],
  level: number,
): number | null {
  const sorted = [...entries].sort((a, b) => a.level - b.level)
  let result: number | undefined
  for (const entry of sorted) {
    if (entry.level <= level) result = entry.value
  }
  return result ?? null
}

function sparseToDense(
  entries: { level: number; value: number }[] | undefined,
  rowCount: number,
): (number | null)[] {
  return Array.from({ length: rowCount }, (_, index) =>
    fillForwardAtLevel(entries ?? [], index + 1),
  )
}

function denseToSparse<T extends { level: number }>(
  dense: (number | null)[] | undefined,
  buildEntry: (level: number, value: number) => T,
): T[] {
  if (!dense?.length) return []

  const result: T[] = []
  let lastEmitted: number | undefined

  dense.forEach((value, index) => {
    if (value === null) return
    if (lastEmitted === undefined || value !== lastEmitted) {
      result.push(buildEntry(index + 1, value))
      lastEmitted = value
    }
  })

  return result
}

/** Whether two sparse progressions resolve to the same fill-forward curve. */
export function sparseProgressionsEquivalent(
  left: { level: number; value: number }[] | undefined,
  right: { level: number; value: number }[] | undefined,
  rowCount = MAX_CHARACTER_LEVEL,
): boolean {
  for (let level = 1; level <= rowCount; level += 1) {
    if (fillForwardAtLevel(left ?? [], level) !== fillForwardAtLevel(right ?? [], level)) {
      return false
    }
  }
  return true
}

export function cantripProgressionsEquivalent(
  left: CantripsKnownEntry[] | undefined,
  right: CantripsKnownEntry[] | undefined,
  rowCount = MAX_CHARACTER_LEVEL,
): boolean {
  return sparseProgressionsEquivalent(
    left?.map((entry) => ({ level: entry.level, value: entry.known })),
    right?.map((entry) => ({ level: entry.level, value: entry.known })),
    rowCount,
  )
}

export function spellsAvailableProgressionsEquivalent(
  left: SpellsAvailableEntry[] | undefined,
  right: SpellsAvailableEntry[] | undefined,
  rowCount = MAX_CHARACTER_LEVEL,
): boolean {
  return sparseProgressionsEquivalent(
    left?.map((entry) => ({ level: entry.level, value: entry.count })),
    right?.map((entry) => ({ level: entry.level, value: entry.count })),
    rowCount,
  )
}

/** Expands sparse contract progressions into a dense grid for editing. */
export function progressionTableToFormValues(
  cantrips: CantripsKnownEntry[] | undefined,
  spellsAvailable: SpellsAvailableEntry[] | undefined,
  rowCount = MAX_CHARACTER_LEVEL,
): ProgressionTableFormValue {
  return {
    cantrips: sparseToDense(
      cantrips?.map((entry) => ({ level: entry.level, value: entry.known })),
      rowCount,
    ),
    spellsAvailable: sparseToDense(
      spellsAvailable?.map((entry) => ({ level: entry.level, value: entry.count })),
      rowCount,
    ),
  }
}

/** Compresses a dense grid back into sparse fill-forward contract tables. */
export function progressionTableFromFormValues(table: ProgressionTableFormValue | undefined): {
  cantrips?: CantripsKnownEntry[]
  spellsAvailable?: SpellsAvailableEntry[]
} {
  if (!table) return {}

  const cantrips = denseToSparse(table.cantrips, (level, known) => ({ level, known }))
  const spellsAvailable = denseToSparse(table.spellsAvailable, (level, count) => ({ level, count }))

  return {
    ...(cantrips.length ? { cantrips } : {}),
    ...(spellsAvailable.length ? { spellsAvailable } : {}),
  }
}

export { emptyProgressionTable }
