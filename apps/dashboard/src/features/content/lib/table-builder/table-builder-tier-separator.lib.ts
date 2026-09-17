import { formatProgressionTierSeparatorLabel } from '../../components/tables/progression-tier-separator'
import {
  isTableGridDataRow,
  type TableGridPresentationRow,
} from '../../components/tables/table-grid-presentation'

export function presentationIncludesExtendedLevels(
  rows: readonly TableGridPresentationRow[],
  standardMaxLevel: number,
): boolean {
  return rows.some(
    (row) =>
      isTableGridDataRow(row) &&
      typeof row.rowHeader === 'number' &&
      row.rowHeader > standardMaxLevel,
  )
}

export function withTierSeparatorAfterStandardMax(
  rows: readonly TableGridPresentationRow[],
  standardMaxLevel: number,
  tierName: string,
  options?: { suffixTierLabel?: boolean },
): TableGridPresentationRow[] {
  const label = formatProgressionTierSeparatorLabel(tierName, options?.suffixTierLabel ?? true)
  if (label === '') return [...rows]
  if (!presentationIncludesExtendedLevels(rows, standardMaxLevel)) return [...rows]

  const result: TableGridPresentationRow[] = []
  let inserted = false

  for (const row of rows) {
    result.push(row)
    if (!inserted && isTableGridDataRow(row) && row.rowHeader === standardMaxLevel) {
      result.push({ kind: 'tierSeparator', label })
      inserted = true
    }
  }

  return result
}

export function shouldRenderValuesTierSeparator(
  level: number | undefined,
  standardMaxLevel: number,
  extendedTierName: string,
  nextLevel: number | undefined,
): boolean {
  if (level !== standardMaxLevel) return false
  if (extendedTierName.trim() === '') return false
  return nextLevel !== undefined && nextLevel > standardMaxLevel
}
