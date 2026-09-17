import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@rpg/ui'

import type { TableGridPresentation } from './table-grid-presentation'
import {
  tableGridHeaderCellClasses,
  tableGridRowHeaderCellClasses,
  tableGridRowHeaderHeaderClasses,
  tableGridValueCellClasses,
} from './table-grid.variants'

const MISSING_VALUE = '—'

export type TableGridProps = {
  presentation: TableGridPresentation
  caption?: string
  /**
   * When set, renders a leading row-header column labeled with this string.
   * Progression tables pass `"Level"`; general tables omit this prop entirely.
   */
  rowHeaderLabel?: string
}

export function TableGrid({ presentation, caption, rowHeaderLabel }: TableGridProps) {
  const heading = caption ?? presentation.name
  const showRowHeader = rowHeaderLabel !== undefined

  return (
    <Table>
      {heading ? <caption className="sr-only">{heading}</caption> : null}
      <TableHeader>
        <TableRow>
          {showRowHeader ? (
            <TableHead className={tableGridRowHeaderHeaderClasses}>{rowHeaderLabel}</TableHead>
          ) : null}
          {presentation.columns.map((column) => (
            <TableHead key={column.key} className={tableGridHeaderCellClasses}>
              {column.label ?? column.key}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {presentation.rows.map((row, index) => (
          <TableRow key={row.rowHeader ?? `row-${index}`}>
            {showRowHeader ? (
              <TableCell className={tableGridRowHeaderCellClasses}>
                {row.rowHeader ?? MISSING_VALUE}
              </TableCell>
            ) : null}
            {presentation.columns.map((column) => (
              <TableCell key={column.key} className={tableGridValueCellClasses}>
                {row.cells[column.key] ?? MISSING_VALUE}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
