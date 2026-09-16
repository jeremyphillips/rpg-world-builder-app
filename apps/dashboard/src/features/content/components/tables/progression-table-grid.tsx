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
}

export function ProgressionTableGrid({ presentation, caption }: ProgressionTableGridProps) {
  const heading = caption ?? presentation.name

  return (
    <Table>
      {heading ? <caption className="sr-only">{heading}</caption> : null}
      <TableHeader>
        <TableRow>
          <TableHead className={progressionTableGridLevelHeaderClasses}>Level</TableHead>
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
            <TableCell className={progressionTableGridLevelCellClasses}>
              {row.level ?? MISSING_VALUE}
            </TableCell>
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
