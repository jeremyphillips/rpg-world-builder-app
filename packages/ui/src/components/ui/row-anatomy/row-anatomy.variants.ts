import { cva } from 'class-variance-authority'

import { cn } from '../../../lib/utils'
import type { RowAnatomyCellSpec } from './row-anatomy.types'

export const ROW_ANATOMY_ROOT_ATTRIBUTE = 'data-row-anatomy'
export const ROW_ANATOMY_SLOT_ATTRIBUTE = 'data-row-anatomy-slot'
export const ROW_ANATOMY_COLUMN_ATTRIBUTE = 'data-row-anatomy-column'

/** Spread on the host grid root so geometry checks and the anatomy overlay can find it. */
export const rowAnatomyRootProps = { [ROW_ANATOMY_ROOT_ATTRIBUTE]: '' } as const

const UI_ROW_ANATOMY_BLOCK = 'ui-row-anatomy'

const BAND_MODIFIER: Record<'control' | 'media-xs' | 'media-sm', string> = {
  control: `${UI_ROW_ANATOMY_BLOCK}--band-control`,
  'media-xs': `${UI_ROW_ANATOMY_BLOCK}--band-media-xs`,
  'media-sm': `${UI_ROW_ANATOMY_BLOCK}--band-media-sm`,
}

/**
 * Row tracks only — never columns, gaps, padding, or inset (host-owned).
 *
 * `slack-start` / `slack-end` are `1fr` gutters: only spanning (`full` / `stretch`) cells
 * cross them, so a spanning cell taller than band+meta+status grows the gutters evenly
 * instead of inflating content rows. With indefinite height they resolve to 0 otherwise.
 */
export const rowAnatomyTracksVariants = cva(UI_ROW_ANATOMY_BLOCK, {
  variants: {
    band: {
      control: BAND_MODIFIER.control,
      'media-xs': BAND_MODIFIER['media-xs'],
      'media-sm': BAND_MODIFIER['media-sm'],
    },
  },
  defaultVariants: {
    band: 'control',
  },
})

/** Sole cell resolver — one row placement and one self-alignment per slot. */
export function rowAnatomyCellClasses(cell: RowAnatomyCellSpec<string>): string {
  return cn(
    'ui-row-anatomy__cell',
    `ui-row-anatomy__cell--${cell.slot}`,
    `ui-row-anatomy__cell--${cell.column}`,
  )
}
