import {
  formatProgressionTableValue,
  formatTableValue,
  parseTableCellValue,
  projectProgressionTableRows,
  type GeneralTable,
  type ProgressionTable,
} from '@rpg/contracts'

import type { TableGridPresentation } from './table-grid-presentation'

export function progressionTableToGridPresentation(table: ProgressionTable): TableGridPresentation {
  const columnById = new Map(table.columns.map((column) => [column.id, column]))

  return {
    name: table.name,
    columns: table.columns.map((column) => ({
      key: column.id,
      label: column.label,
    })),
    rows: projectProgressionTableRows(table).map((row) => ({
      rowHeader: row.level,
      cells: Object.fromEntries(
        Object.entries(row.values).map(([columnId, value]) => {
          const column = columnById.get(columnId)
          return [
            columnId,
            value === undefined || column === undefined
              ? undefined
              : formatProgressionTableValue(column, value),
          ]
        }),
      ),
    })),
  }
}

export function generalTableToGridPresentation(table: GeneralTable): TableGridPresentation {
  return {
    name: table.name,
    columns: table.columns.map((column) => ({
      key: column.id,
      label: column.label,
    })),
    rows: table.rows.map((row) => ({
      cells: Object.fromEntries(
        table.columns.map((column) => {
          const rawValue = row.cells[column.id]
          if (rawValue === undefined) return [column.id, undefined]
          const parsed = parseTableCellValue(column, rawValue)
          if (parsed === undefined) return [column.id, undefined]
          return [column.id, formatTableValue(column, parsed)]
        }),
      ),
    })),
  }
}
