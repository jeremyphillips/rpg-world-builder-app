import type { LevelRangeRow } from './level-range-table'

/** Default min/max for a newly appended level-range row. */
export function nextLevelRangeRowDefaults(
  rows: readonly LevelRangeRow[],
  effectiveMax: number,
): Pick<LevelRangeRow, 'minLevel' | 'maxLevel'> {
  if (rows.length === 0) {
    return { minLevel: 1, maxLevel: effectiveMax }
  }

  const lastRow = rows[rows.length - 1]!
  const nextMin = lastRow.maxLevel + 1
  return { minLevel: nextMin, maxLevel: effectiveMax }
}

function cloneLevelRangeRows(rows: readonly LevelRangeRow[]): LevelRangeRow[] {
  return rows.map((row) => ({ ...row }))
}

/** Keeps rows [startIndex..] contiguous after an upstream boundary change. */
function snapForwardContiguousRows(rows: LevelRangeRow[], startIndex: number): void {
  for (let index = Math.max(1, startIndex); index < rows.length; index++) {
    const previousRow = rows[index - 1]!
    const row = rows[index]!
    row.minLevel = previousRow.maxLevel + 1
    if (row.maxLevel < row.minLevel) {
      row.maxLevel = row.minLevel
    }
  }
}

/** Whether `level` is a valid min-level choice for row `rowIndex`. */
export function minLevelSelectable(
  rows: readonly LevelRangeRow[],
  rowIndex: number,
  level: number,
  effectiveMax: number,
): boolean {
  if (level < 1 || level > effectiveMax) return false

  if (rowIndex === 0) {
    return level === 1
  }

  const previousRow = rows[rowIndex - 1]
  const row = rows[rowIndex]
  if (!previousRow || !row) return false

  const lowerBound = previousRow.minLevel + 1
  return level >= lowerBound && level <= row.maxLevel
}

/** Whether `level` is a valid max-level choice for row `rowIndex`. */
export function maxLevelSelectable(
  rows: readonly LevelRangeRow[],
  rowIndex: number,
  level: number,
  rowMin: number,
  effectiveMax: number,
): boolean {
  if (level < rowMin || level > effectiveMax) return false

  const nextRow = rows[rowIndex + 1]
  const upperBound = nextRow ? nextRow.maxLevel : effectiveMax
  return level <= upperBound
}

/** Applies a max-level edit and ripples contiguous boundaries through later rows. */
export function applyLevelRangeMaxChange(
  rows: readonly LevelRangeRow[],
  rowIndex: number,
  newMax: number,
): LevelRangeRow[] {
  const result = cloneLevelRangeRows(rows)
  const row = result[rowIndex]
  if (!row) return result

  row.maxLevel = newMax
  if (row.maxLevel < row.minLevel) {
    row.minLevel = row.maxLevel
  }

  snapForwardContiguousRows(result, rowIndex + 1)
  return result
}

/** Applies a min-level edit, adjusts the previous row max, and ripples forward. */
export function applyLevelRangeMinChange(
  rows: readonly LevelRangeRow[],
  rowIndex: number,
  newMin: number,
): LevelRangeRow[] {
  const result = cloneLevelRangeRows(rows)
  const row = result[rowIndex]
  if (!row) return result

  row.minLevel = newMin
  if (row.maxLevel < row.minLevel) {
    row.maxLevel = row.minLevel
  }

  if (rowIndex > 0) {
    const previousRow = result[rowIndex - 1]!
    previousRow.maxLevel = newMin - 1
    if (previousRow.maxLevel < previousRow.minLevel) {
      previousRow.minLevel = previousRow.maxLevel
    }
  }

  snapForwardContiguousRows(result, rowIndex + 1)
  return result
}

/** Returns true when two tables have identical min/max pairs. */
export function levelRangeRowsEqual(
  left: readonly LevelRangeRow[],
  right: readonly LevelRangeRow[],
): boolean {
  if (left.length !== right.length) return false

  return left.every(
    (row, index) =>
      row.minLevel === right[index]?.minLevel && row.maxLevel === right[index]?.maxLevel,
  )
}
