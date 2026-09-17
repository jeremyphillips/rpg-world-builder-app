import { formatTableValue, parseTableCellValue, type GeneralTable } from '@rpg/contracts'

import { ProgressionTableGrid } from './progression-table-grid'
import type { ProgressionTablePresentation } from './progression-table-presentation'

export type GeneralTableViewProps = {
  table: GeneralTable
  caption?: string
}

function toPresentation(table: GeneralTable): ProgressionTablePresentation {
  return {
    name: table.name,
    columns: table.columns.map((column) => ({
      key: column.id,
      label: column.label,
    })),
    rows: table.rows.map((row) => ({
      values: Object.fromEntries(
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

export function GeneralTableView({ table, caption }: GeneralTableViewProps) {
  return (
    <ProgressionTableGrid
      presentation={toPresentation(table)}
      caption={caption ?? table.name}
      rowHeaderLabel={undefined}
    />
  )
}
