import type { ReactNode } from 'react'

import type { RowAnatomyCellSpec, RowColumn } from './row-anatomy.types'
import {
  ROW_ANATOMY_COLUMN_ATTRIBUTE,
  ROW_ANATOMY_SLOT_ATTRIBUTE,
  rowAnatomyCellClasses,
} from './row-anatomy.variants'

type RowAnatomyDataAttributes = { [key: `data-${string}`]: string | undefined }

export type RowAnatomyCellProps<C extends string = RowColumn> = RowAnatomyDataAttributes & {
  cell: RowAnatomyCellSpec<C>
  children: ReactNode
}

/**
 * Grid item placed by slot (rows, vertical alignment) and host column line name.
 * No `className` — horizontal spacing belongs to the host's column variants.
 */
export function RowAnatomyCell<C extends string = RowColumn>({
  cell,
  children,
  ...dataAttributes
}: RowAnatomyCellProps<C>) {
  return (
    <div
      {...dataAttributes}
      className={rowAnatomyCellClasses(cell)}
      style={{ gridColumn: cell.column }}
      {...{
        [ROW_ANATOMY_SLOT_ATTRIBUTE]: cell.slot,
        [ROW_ANATOMY_COLUMN_ATTRIBUTE]: cell.column,
      }}
    >
      {children}
    </div>
  )
}
