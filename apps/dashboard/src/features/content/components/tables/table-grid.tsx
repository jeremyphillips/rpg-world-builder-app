import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableHeaderRowClasses,
} from '@rpg/ui'

import {
  isTableGridDataRow,
  isTableGridTierSeparatorRow,
  type TableGridPresentation,
} from './table-grid-presentation'
import { ProgressionTierSeparatorTableRow } from './progression-tier-separator'
import {
  tableGridEmptyBodyCellClasses,
  tableGridHeaderCellClasses,
  tableGridRowHeaderCellClasses,
  tableGridRowHeaderHeaderClasses,
  tableGridTableClasses,
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
  /** Centered body placeholder when the presentation has columns but no rows. */
  emptyBodyMessage?: string
  /**
   * `embedded` renders a bare `<table>` so a parent owns horizontal scroll (table
   * builder preview). Default `table-shell` keeps the `@rpg/ui` Table scroll wrapper.
   */
  scrollMode?: 'table-shell' | 'embedded'
}

export function TableGrid({
  presentation,
  caption,
  rowHeaderLabel,
  emptyBodyMessage,
  scrollMode = 'table-shell',
}: TableGridProps) {
  const heading = caption ?? presentation.name
  const showRowHeader = rowHeaderLabel !== undefined
  const columnCount = presentation.columns.length + (showRowHeader ? 1 : 0)

  const tableBody = (
    <>
      {heading ? <caption className="sr-only">{heading}</caption> : null}
      <TableHeader>
        <TableRow className={tableHeaderRowClasses}>
          {showRowHeader ? (
            <TableHead scope="col" className={tableGridRowHeaderHeaderClasses}>
              {rowHeaderLabel}
            </TableHead>
          ) : null}
          {presentation.columns.map((column) => (
            <TableHead key={column.key} scope="col" className={tableGridHeaderCellClasses}>
              {column.label ?? column.key}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {presentation.rows.length === 0 && emptyBodyMessage ? (
          <TableRow>
            <TableCell colSpan={columnCount} className={tableGridEmptyBodyCellClasses}>
              {emptyBodyMessage}
            </TableCell>
          </TableRow>
        ) : (
          presentation.rows.map((row, index) => {
            if (isTableGridTierSeparatorRow(row)) {
              return (
                <ProgressionTierSeparatorTableRow
                  key={`tier-separator-${index}`}
                  colSpan={columnCount}
                  label={row.label}
                  variant="preview"
                />
              )
            }

            if (!isTableGridDataRow(row)) return null

            return (
              <TableRow key={row.rowHeader ?? `row-${index}`}>
                {showRowHeader ? (
                  <TableHead scope="row" className={tableGridRowHeaderCellClasses}>
                    {row.rowHeader ?? MISSING_VALUE}
                  </TableHead>
                ) : null}
                {presentation.columns.map((column) => (
                  <TableCell key={column.key} className={tableGridValueCellClasses}>
                    {row.cells[column.key] ?? MISSING_VALUE}
                  </TableCell>
                ))}
              </TableRow>
            )
          })
        )}
      </TableBody>
    </>
  )

  if (scrollMode === 'embedded') {
    return <table className={tableGridTableClasses}>{tableBody}</table>
  }

  return <Table className={tableGridTableClasses}>{tableBody}</Table>
}
