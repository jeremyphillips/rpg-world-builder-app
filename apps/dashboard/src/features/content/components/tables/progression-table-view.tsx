import type { ProgressionTable } from '@rpg/contracts'

import { TableGrid } from './table-grid'
import { progressionTableToGridPresentation } from './table-grid-presentation.lib'

export type ProgressionTableViewProps = {
  table: ProgressionTable
  caption?: string
}

export function ProgressionTableView({ table, caption }: ProgressionTableViewProps) {
  return (
    <TableGrid
      presentation={progressionTableToGridPresentation(table)}
      caption={caption}
      rowHeaderLabel="Level"
    />
  )
}
