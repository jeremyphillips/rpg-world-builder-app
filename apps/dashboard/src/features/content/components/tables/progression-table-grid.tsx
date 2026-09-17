import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@rpg/ui'

import type { ProgressionTablePresentation } from './progression-table-presentation'
import {
  progressionTableGridHeaderCellClasses,
  progressionTableGridLevelCellClasses,
  progressionTableGridLevelHeaderClasses,
  progressionTableGridValueCellClasses,
} from './progression-table-grid.variants'

const MISSING_VALUE = '—'

export type ProgressionTableGridProps = {
  presentation: ProgressionTablePresentation
  caption?: string
  /** When set, renders a leading row-header column (e.g. "Level"). Omit for general tables. */
  rowHeaderLabel?: string
}

export function ProgressionTableGrid({
  presentation,
  caption,
  rowHeaderLabel = 'Level',
}: ProgressionTableGridProps) {
  const heading = caption ?? presentation.name
  const showRowHeader = rowHeaderLabel !== undefined

  return (
    <Table>
      {heading ? <caption className="sr-only">{heading}</caption> : null}
      <TableHeader>
        <TableRow>
          {showRowHeader ? (
            <TableHead className={progressionTableGridLevelHeaderClasses}>
              {rowHeaderLabel}
            </TableHead>
          ) : null}
          {presentation.columns.map((column) => (
            <TableHead key={column.key} className={progressionTableGridHeaderCellClasses}>
              {column.label ?? column.key}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {presentation.rows.map((row, index) => (
          <TableRow key={row.level ?? `row-${index}`}>
            {showRowHeader ? (
              <TableCell className={progressionTableGridLevelCellClasses}>
                {row.level ?? MISSING_VALUE}
              </TableCell>
            ) : null}
            {presentation.columns.map((column) => (
              <TableCell key={column.key} className={progressionTableGridValueCellClasses}>
                {row.values[column.key] ?? MISSING_VALUE}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
