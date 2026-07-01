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
  if (!previousRow) return false

  return level === previousRow.maxLevel + 1
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
  if (nextRow && level >= nextRow.minLevel) return false

  return true
}
