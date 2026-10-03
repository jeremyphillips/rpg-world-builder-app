import { cva } from 'class-variance-authority'

import { cn } from '../../../lib/utils'
import type { RowAnatomyCellSpec } from './row-anatomy.types'

export const ROW_ANATOMY_ROOT_ATTRIBUTE = 'data-row-anatomy'
export const ROW_ANATOMY_SLOT_ATTRIBUTE = 'data-row-anatomy-slot'
export const ROW_ANATOMY_COLUMN_ATTRIBUTE = 'data-row-anatomy-column'

/** Spread on the host grid root so geometry checks and the anatomy overlay can find it. */
export const rowAnatomyRootProps = { [ROW_ANATOMY_ROOT_ATTRIBUTE]: '' } as const

/**
 * Row tracks only — never columns, gaps, padding, or inset (host-owned).
 *
 * `slack-start` / `slack-end` are `1fr` gutters: only spanning (`full` / `stretch`) cells
 * cross them, so a spanning cell taller than band+meta+status grows the gutters evenly
 * instead of inflating content rows. With indefinite height they resolve to 0 otherwise.
 */
export const rowAnatomyTracksVariants = cva(
  'grid grid-rows-[[slack-start]_1fr_[band]_minmax(var(--row-band-height),auto)_[meta]_auto_[status]_auto_[slack-end]_1fr_[row-end]]',
  {
    variants: {
      band: {
        control: '[--row-band-height:var(--control-action-compact-height)]',
        /** Mirrors IdentityFrame `xs` (`size-8`). */
        'media-xs': '[--row-band-height:calc(var(--spacing)*8)]',
        /** Mirrors IdentityFrame `sm` (`size-10`). */
        'media-sm': '[--row-band-height:calc(var(--spacing)*10)]',
      },
    },
    defaultVariants: {
      band: 'control',
    },
  },
)

const ROW_ANATOMY_CELL_BASE_CLASSES = 'min-w-0'

const ROW_ANATOMY_SPAN_ALL_ROWS_CLASSES = 'row-start-[slack-start] row-end-[row-end]'

/** Sole cell resolver — one row placement and one self-alignment per slot. */
export function rowAnatomyCellClasses(cell: RowAnatomyCellSpec<string>): string {
  switch (cell.slot) {
    case 'band':
      return cn(ROW_ANATOMY_CELL_BASE_CLASSES, 'row-start-[band] self-center')
    case 'meta':
      return cn(ROW_ANATOMY_CELL_BASE_CLASSES, 'row-start-[meta] self-start mt-0.5')
    case 'status':
      return cn(ROW_ANATOMY_CELL_BASE_CLASSES, 'row-start-[status] self-start mt-1')
    case 'full':
      return cn(ROW_ANATOMY_CELL_BASE_CLASSES, ROW_ANATOMY_SPAN_ALL_ROWS_CLASSES, 'self-center')
    case 'stretch':
      return cn(ROW_ANATOMY_CELL_BASE_CLASSES, ROW_ANATOMY_SPAN_ALL_ROWS_CLASSES, 'self-stretch')
    default: {
      const _exhaustive: never = cell
      return _exhaustive
    }
  }
}
