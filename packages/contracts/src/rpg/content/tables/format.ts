import { formatDice, type Dice } from '../../primitives/dice'

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

/** Display SSOT for progression table cell values. */
export function formatProgressionTableValue(
  column: ProgressionTableColumn,
  value: ProgressionTableColumnValue,
): string {
  return formatTableValue(column, value)
}
