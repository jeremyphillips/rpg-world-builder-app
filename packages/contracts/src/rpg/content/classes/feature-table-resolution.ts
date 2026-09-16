import type { FeatureTable, FeatureTableColumn } from './feature-table'

type FeatureProgressionSource = {
  id: string
  tables?: readonly FeatureTable[]
}

export type FeatureProgressionColumn = {
  featureId: string
  tableId: string
  columnId: string
  columnKey: string
  label: string
  column: FeatureTableColumn
}

/** Carry-forward: last entry where entry.level <= level; undefined before the first entry. */
export function resolveFeatureTableColumnValue(
  column: FeatureTableColumn,
  level: number,
): number | string | undefined {
  let result: number | string | undefined

  for (const entry of column.entries) {
    if (entry.level <= level) {
      result = entry.value
    }
  }

  return result
}

/** Sorted union of all breakpoint levels across columns in a table. */
export function collectFeatureTableBreakpoints(table: FeatureTable): number[] {
  const levels = new Set<number>()

  for (const column of table.columns) {
    for (const entry of column.entries) {
      levels.add(entry.level)
    }
  }

  return [...levels].sort((left, right) => left - right)
}

export type ProjectedFeatureTableRow = {
  level: number
  values: Record<string, number | string | undefined>
}

/** Derived row projection — never persisted. */
export function projectFeatureTableRows(table: FeatureTable): ProjectedFeatureTableRow[] {
  return collectFeatureTableBreakpoints(table).map((level) => ({
    level,
    values: Object.fromEntries(
      table.columns.map((column) => [column.id, resolveFeatureTableColumnValue(column, level)]),
    ),
  }))
}

/**
 * Flattens level-progression columns from features in persisted array order:
 * features[] → tables[] → columns[].
 */
export function collectFeatureProgressionColumns(
  features: readonly FeatureProgressionSource[],
): FeatureProgressionColumn[] {
  const columns: FeatureProgressionColumn[] = []

  for (const feature of features) {
    for (const table of feature.tables ?? []) {
      if (table.kind !== 'levelProgression') continue

      for (const column of table.columns) {
        columns.push({
          featureId: feature.id,
          tableId: table.id,
          columnId: column.id,
          columnKey: `${feature.id}.${table.id}.${column.id}`,
          label: column.label,
          column,
        })
      }
    }
  }

  return columns
}
