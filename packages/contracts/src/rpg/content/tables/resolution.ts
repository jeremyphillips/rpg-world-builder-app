import type { Dice } from '../../primitives/dice'

import type { ProgressionTable } from './progression-table'
import type { ProgressionTableColumn } from './table-column'

export type ProgressionTableColumnValue = number | string | Dice

/** Carry-forward: last entry where entry.level <= level; undefined before the first entry. */
export function resolveProgressionTableColumnValue(
  column: ProgressionTableColumn,
  level: number,
): ProgressionTableColumnValue | undefined {
  let result: ProgressionTableColumnValue | undefined

  for (const entry of column.entries) {
    if (entry.level <= level) {
      result = entry.value
    }
  }

  return result
}

/** Sorted union of all breakpoint levels across columns in a table. */
export function collectProgressionTableBreakpoints(table: ProgressionTable): number[] {
  const levels = new Set<number>()

  for (const column of table.columns) {
    for (const entry of column.entries) {
      levels.add(entry.level)
    }
  }

  return [...levels].sort((left, right) => left - right)
}

export type ProjectedProgressionTableRow = {
  level: number
  values: Record<string, ProgressionTableColumnValue | undefined>
}

/** Derived row projection — never persisted. */
export function projectProgressionTableRows(
  table: ProgressionTable,
): ProjectedProgressionTableRow[] {
  return collectProgressionTableBreakpoints(table).map((level) => ({
    level,
    values: Object.fromEntries(
      table.columns.map((column) => [column.id, resolveProgressionTableColumnValue(column, level)]),
    ),
  }))
}
