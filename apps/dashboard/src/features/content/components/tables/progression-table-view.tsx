import {
  formatProgressionTableValue,
  projectProgressionTableRows,
  type ProgressionTable,
} from '@rpg/contracts'

import { ProgressionTableGrid } from './progression-table-grid'
import type { ProgressionTablePresentation } from './progression-table-presentation'

export type ProgressionTableViewProps = {
  table: ProgressionTable
  caption?: string
}

function toPresentation(table: ProgressionTable): ProgressionTablePresentation {
  const columnById = new Map(table.columns.map((column) => [column.id, column]))

  return {
    name: table.name,
    columns: table.columns.map((column) => ({
      key: column.id,
      label: column.label,
    })),
    rows: projectProgressionTableRows(table).map((row) => ({
      level: row.level,
      values: Object.fromEntries(
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

export function ProgressionTableView({ table, caption }: ProgressionTableViewProps) {
  return <ProgressionTableGrid presentation={toPresentation(table)} caption={caption} />
}
