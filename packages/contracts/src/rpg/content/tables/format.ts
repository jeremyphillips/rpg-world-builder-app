import { formatDice, type Dice } from '../../primitives/dice'

import type { GeneralTable } from './general-table'
import type { ProgressionTableColumn } from './table-column'
import type { TableCellValue, TableColumnDef } from './table-column'
import type { ProgressionTableColumnValue } from './resolution'

function formatSignedNumber(value: number): string {
  return value >= 0 ? `+${value}` : String(value)
}

/** Display SSOT for table cell values across general and progression tables. */
export function formatTableValue(column: TableColumnDef, value: TableCellValue): string {
  switch (column.valueType) {
    case 'number':
      return column.format === 'signed' ? formatSignedNumber(value as number) : String(value)
    case 'dice':
      return formatDice(value as Dice)
    case 'text':
      return String(value)
  }
}

/** Display SSOT for general-table row/column counts (e.g. spell embed metadata). */
export function formatGeneralTableMetadata(table: Pick<GeneralTable, 'columns' | 'rows'>): string {
  const columnCount = table.columns.length
  const rowCount = table.rows.length
  return `${columnCount} column${columnCount === 1 ? '' : 's'} · ${rowCount} row${rowCount === 1 ? '' : 's'}`
}

/** Display SSOT for progression table cell values. */
export function formatProgressionTableValue(
  column: ProgressionTableColumn,
  value: ProgressionTableColumnValue,
): string {
  return formatTableValue(column, value)
}
