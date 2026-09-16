import { cva, type VariantProps } from 'class-variance-authority'
import type { CSSProperties } from 'react'

import type { FieldWidth } from '../../../components/ui/field-control.variants'
import { resolveFieldRowColumnTracks } from '../../../components/ui/field-row-column-tracks.lib'
import {
  buildCollapsibleListItemLeadingChromeStyle,
  LEADING_CHROME_SIZE_VAR,
} from '../../../components/ui/collapsible-list-item/collapsible-list-item-leading-chrome.lib'
import { collapsibleListItemChromeColumnClasses } from '../../../components/ui/collapsible-list-item/collapsible-list-item-leading-chrome.lib'
import { FIELD_ANATOMY_GRID_ROW_SPAN } from '../../../components/ui/field-row-anatomy.context'
import { cn } from '../../../lib/utils'

/** Shared anatomy row index for the control track (1-based grid row). */
export const ARRAY_ITEM_ANATOMY_CONTROL_TRACK_ROW = 2 as const

/** Grip column track — fixed to the leading-chrome hit target, not free `auto` space. */
export const ARRAY_ITEM_ANATOMY_GRIP_COLUMN_TRACK = `var(${LEADING_CHROME_SIZE_VAR})`

/** Field columns span all three anatomy tracks via subgrid. */
export const ARRAY_ITEM_ANATOMY_FIELD_GRID_ROW = FIELD_ANATOMY_GRID_ROW_SPAN

/**
 * Chrome column — spans all anatomy rows and vertically centers grip/actions in the
 * shared grid cell (label + control + message height).
 */
export const arrayItemAnatomyChromeColumnClasses = cn(
  collapsibleListItemChromeColumnClasses,
  'min-w-0',
)

/**
 * Parent grid for compact array inline items.
 *
 * Owns the label / control / message tracks. Field columns participate via
 * {@link fieldRowParticipationClasses}; grip and actions center in the full row span.
 *
 * Do not nest a second `[grid-template-rows:auto_auto_auto]` grid for fields — that
 * duplicates track sizing and drifts when labels wrap or messages grow.
 */
export const arrayItemAnatomyGridVariants = cva(
  '@container/array-item array-item-anatomy-grid grid min-w-0 grid-rows-[auto_auto_auto]',
  {
    variants: {
      gap: {
        compact: 'gap-x-4',
        form: 'gap-x-6',
      },
    },
    defaultVariants: {
      gap: 'compact',
    },
  },
)

export type ArrayItemAnatomyGridVariantProps = VariantProps<typeof arrayItemAnatomyGridVariants>

/**
 * Array inline rows run inside constrained shells — `auto` fields absorb leftover
 * space instead of `max-content`, which refuses to shrink and overflows the shell.
 */
export function resolveArrayItemAnatomyFieldColumnTracks(
  fieldWidths: readonly FieldWidth[],
): string[] {
  const { tracks } = resolveFieldRowColumnTracks(fieldWidths)
  return tracks.map((track, index) => (fieldWidths[index] === 'auto' ? 'minmax(0, 1fr)' : track))
}

/** Builds `grid-template-columns` for `[grip?] [field tracks…] [actions]`. */
export function buildArrayItemAnatomyGridTemplateColumns(
  fieldWidths: readonly FieldWidth[],
  showGrip: boolean,
): string {
  const fieldColumns = resolveArrayItemAnatomyFieldColumnTracks(fieldWidths).join(' ')
  const gripColumn = showGrip ? `${ARRAY_ITEM_ANATOMY_GRIP_COLUMN_TRACK} ` : ''
  return `${gripColumn}${fieldColumns} max-content`
}

export function resolveArrayItemAnatomyFieldGridColumn(
  fieldIndex: number,
  showGrip: boolean,
): number {
  return fieldIndex + (showGrip ? 2 : 1)
}

export function resolveArrayItemAnatomyGridChromeColumn(options: {
  role: 'grip' | 'actions'
  fieldCount: number
  showGrip?: boolean
}): number {
  if (options.role === 'grip') return 1
  const showGrip = options.showGrip ?? true
  return options.fieldCount + (showGrip ? 2 : 1)
}

export function resolveArrayItemAnatomyGridPresentation(
  fieldWidths: readonly FieldWidth[],
  options: {
    showGrip?: boolean
    gap?: NonNullable<ArrayItemAnatomyGridVariantProps['gap']>
  } = {},
): {
  className: string
  style: CSSProperties
} {
  const showGrip = options.showGrip ?? true
  const gap = options.gap ?? 'compact'

  return {
    className: arrayItemAnatomyGridVariants({ gap }),
    style: {
      ...buildCollapsibleListItemLeadingChromeStyle({
        showDragHandle: showGrip,
        reserveDragHandleSlot: showGrip,
        collapsible: false,
      }),
      gridTemplateColumns: buildArrayItemAnatomyGridTemplateColumns(fieldWidths, showGrip),
    } as CSSProperties,
  }
}
