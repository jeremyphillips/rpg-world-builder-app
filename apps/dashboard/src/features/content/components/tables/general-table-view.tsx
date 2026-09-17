import type { GeneralTable } from '@rpg/contracts'

import { TableGrid } from './table-grid'
import { generalTableToGridPresentation } from './table-grid-presentation.lib'

export type GeneralTableViewProps = {
  table: GeneralTable
  caption?: string
}

export function GeneralTableView({ table, caption }: GeneralTableViewProps) {
  return (
    <TableGrid
      presentation={generalTableToGridPresentation(table)}
      caption={caption ?? table.name}
    />
  )
}
