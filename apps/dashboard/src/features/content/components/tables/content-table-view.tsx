import type { ContentTable, GeneralTable, ProgressionTable } from '@rpg/contracts'

import { GeneralTableView } from './general-table-view'
import { ProgressionTableView } from './progression-table-view'

export type ContentTableViewProps = {
  table: ContentTable
  caption?: string
}

export function ContentTableView({ table, caption }: ContentTableViewProps) {
  return table.kind === 'general' ? (
    <GeneralTableView table={table as GeneralTable} caption={caption ?? table.name} />
  ) : (
    <ProgressionTableView table={table as ProgressionTable} caption={caption ?? table.name} />
  )
}
