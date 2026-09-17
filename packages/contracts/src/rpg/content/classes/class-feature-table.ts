import type { z } from 'zod'

import type { ContentTable, ProgressionTableColumn } from '../tables'
import { classFeatureTableValidationMessages } from './class-feature-table-messages'

export type ClassFeatureTable = ContentTable

type FeatureProgressionSource = {
  id: string
  tables?: readonly ContentTable[]
}

export type FeatureProgressionColumn = {
  featureId: string
  tableId: string
  columnId: string
  columnKey: string
  label: string
  column: ProgressionTableColumn
}

export function refineFeatureTablesOnFeature(
  feature: { level: number; tables?: ContentTable[] },
  ctx: z.RefinementCtx,
): void {
  const tables = feature.tables
  if (!tables?.length) return

  const seenTableIds = new Set<string>()

  for (const [tableIndex, table] of tables.entries()) {
    if (seenTableIds.has(table.id)) {
      ctx.addIssue({
        code: 'custom',
        message: classFeatureTableValidationMessages.duplicateTableId({ tableId: table.id }),
        path: ['tables', tableIndex, 'id'],
      })
    }
    seenTableIds.add(table.id)

    if (table.kind !== 'levelProgression') continue

    for (const [columnIndex, column] of table.columns.entries()) {
      for (const [entryIndex, entry] of column.entries.entries()) {
        if (entry.level < feature.level) {
          ctx.addIssue({
            code: 'custom',
            message: classFeatureTableValidationMessages.entryBeforeFeatureLevel({
              entryLevel: entry.level,
              featureLevel: feature.level,
            }),
            path: ['tables', tableIndex, 'columns', columnIndex, 'entries', entryIndex, 'level'],
          })
        }
      }
    }
  }
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
