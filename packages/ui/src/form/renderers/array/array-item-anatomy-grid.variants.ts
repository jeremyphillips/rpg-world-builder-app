import { cva } from 'class-variance-authority'
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

/** 8px — chrome adjacency (grip/actions ↔ fields cluster). */
export const ARRAY_ITEM_CHROME_GAP_CLASS = 'gap-x-2'

/** 12px — array anatomy field column gap (dense). */
export const ARRAY_ITEM_FIELD_GAP_DENSE_CLASS = 'gap-x-3'

/** 16px — array anatomy field column gap (default / comfortable). */
export const ARRAY_ITEM_FIELD_GAP_DEFAULT_CLASS = 'gap-x-4'

export type ArrayFieldGap = 'dense' | 'default'

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
 * {@link fieldRowParticipationClasses} inside a fields cluster subgrid; grip and
 * actions center in the full row span.
 *
 * Do not nest a second `[grid-template-rows:auto_auto_auto]` grid for fields — that
 * duplicates track sizing and drifts when labels wrap or messages grow.
 */
export const arrayItemAnatomyGridVariants = cva(
  '@container/array-item array-item-anatomy-grid grid min-w-0 grid-rows-[auto_auto_auto]',
)

/**
 * Array inline rows use intrinsic-aware `auto` tracks so digit controls keep their
 * declared minimum. `full` stays shrinkable (`minmax(0, 1fr)`).
 */
export function resolveArrayItemAnatomyFieldColumnTracks(
  fieldWidths: readonly FieldWidth[],
): string[] {
  const { tracks } = resolveFieldRowColumnTracks(fieldWidths)
  return tracks.map((track, index) =>
    fieldWidths[index] === 'auto' ? 'minmax(min-content, max-content)' : track,
  )
}

/** Parent template: `[grip?] fieldsCluster [actions]`. */
export function buildArrayItemAnatomyTwoTierParentTemplateColumns(options: {
  showGrip: boolean
}): string {
  const gripColumn = options.showGrip ? `${ARRAY_ITEM_ANATOMY_GRIP_COLUMN_TRACK} ` : ''
  return `${gripColumn}minmax(0, 1fr) max-content`
}

/** Field tracks inside the fields cluster. */
export function buildArrayItemAnatomyFieldsClusterTemplateColumns(
  fieldWidths: readonly FieldWidth[],
): string {
  return resolveArrayItemAnatomyFieldColumnTracks(fieldWidths).join(' ')
}

export function resolveArrayItemAnatomyFieldGridColumn(
  fieldIndex: number,
  _showGrip: boolean,
): number {
  return fieldIndex + 1
}

export function resolveArrayItemAnatomyParentChromeColumn(options: {
  role: 'grip' | 'actions' | 'cluster'
  showGrip: boolean
}): number {
  if (options.role === 'grip') return 1
  if (options.role === 'cluster') return options.showGrip ? 2 : 1
  return (options.showGrip ? 2 : 1) + 1
}

export function resolveArrayItemFieldGapClass(fieldGap: ArrayFieldGap = 'dense'): string {
  return fieldGap === 'dense'
    ? ARRAY_ITEM_FIELD_GAP_DENSE_CLASS
    : ARRAY_ITEM_FIELD_GAP_DEFAULT_CLASS
}

export function resolveArrayItemAnatomyGridPresentation(
  _fieldWidths: readonly FieldWidth[],
  options: {
    showGrip?: boolean
    fieldGap?: ArrayFieldGap
  } = {},
): {
  className: string
  style: CSSProperties
  fieldGapClass: string
} {
  const showGrip = options.showGrip ?? true
  const fieldGap = options.fieldGap ?? 'dense'
  const fieldGapClass = resolveArrayItemFieldGapClass(fieldGap)

  return {
    className: cn(arrayItemAnatomyGridVariants(), ARRAY_ITEM_CHROME_GAP_CLASS),
    style: {
      ...buildCollapsibleListItemLeadingChromeStyle({
        showDragHandle: showGrip,
        reserveDragHandleSlot: showGrip,
        collapsible: false,
      }),
      gridTemplateColumns: buildArrayItemAnatomyTwoTierParentTemplateColumns({ showGrip }),
    } as CSSProperties,
    fieldGapClass,
  }
}
