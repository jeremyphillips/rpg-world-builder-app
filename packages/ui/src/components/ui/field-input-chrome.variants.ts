import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'
import { UI_FIELD_CONTROL_BLOCK_CLASS } from './field-control.styles'
import {
  UI_FIELD_GROUP_BLOCK_CLASS,
  UI_FIELD_GROUP_DIVIDER_PRIMARY_CLASS,
  UI_FIELD_GROUP_DIVIDER_SUBTLE_CLASS,
  UI_FIELD_GROUP_INPUT_COLUMN_CLASS,
  UI_FIELD_GROUP_INTRINSIC_LAYOUT_CLASS,
  UI_FIELD_GROUP_INVALID_CLASS,
  UI_FIELD_GROUP_SEGMENT_END_CLASS,
  UI_FIELD_GROUP_SEGMENT_RESET_CLASS,
  UI_FIELD_GROUP_SEGMENT_START_CLASS,
  UI_FIELD_GROUP_STRETCH_LAYOUT_CLASS,
} from './field-group.styles'

/** @deprecated Prefer {@link UI_FIELD_CONTROL_BLOCK_CLASS} — presentation lives in field-control.css. */
export const fieldInputShellClasses = UI_FIELD_CONTROL_BLOCK_CLASS

/** Grouped-control invalid shell — pairs with {@link UI_FIELD_GROUP_BLOCK_CLASS}. */
export const fieldInputInvalidClasses = UI_FIELD_GROUP_INVALID_CLASS

/** Grouped field shell base — border, fill, and focus-within ring on the outer wrapper. */
export const fieldGroupedShellClasses = cn('grid items-center', UI_FIELD_GROUP_BLOCK_CLASS)

/** Stretch layout: input grows, trailing segment stays intrinsic width. */
export const fieldGroupedShellStretchLayoutClasses = UI_FIELD_GROUP_STRETCH_LAYOUT_CLASS

/**
 * Intrinsic layout: shell width follows segment content.
 * `min-w-max` keeps the outer border wrapped around the full composite when the parent
 * track constricts — overflow moves to the row instead of mangling the grouped shell.
 */
export const fieldGroupedShellIntrinsicLayoutClasses = UI_FIELD_GROUP_INTRINSIC_LAYOUT_CLASS

/** Shared geometry for vertical dividers between grouped segments. */
export const fieldGroupedDividerBaseClasses = 'ui-field-group__divider'

/**
 * Grouped segment divider — `primary` separates major sub-controls; `subtle` separates
 * tightly related sub-segments within one logical control.
 */
export const groupedDividerVariants = cva(fieldGroupedDividerBaseClasses, {
  variants: {
    strength: {
      primary: cn(UI_FIELD_GROUP_DIVIDER_PRIMARY_CLASS, borderStrength()),
      subtle: cn(UI_FIELD_GROUP_DIVIDER_SUBTLE_CLASS, borderStrength('subtle')),
    },
  },
  defaultVariants: {
    strength: 'primary',
  },
})

/** @deprecated Prefer `groupedDividerVariants({ strength: 'primary' })`. */
export const fieldGroupedDividerClasses = groupedDividerVariants({ strength: 'primary' })

export type GroupedDividerVariantProps = VariantProps<typeof groupedDividerVariants>

/**
 * Suppresses standalone field chrome and per-segment focus rings so the group
 * shell owns border and focus-within treatment.
 */
export const fieldGroupedSegmentResetClasses = UI_FIELD_GROUP_SEGMENT_RESET_CLASS

/** Left segment corner radii (input/value column). */
export const fieldGroupedSegmentStartClasses = UI_FIELD_GROUP_SEGMENT_START_CLASS

/** Right segment corner radii (unit/action column). */
export const fieldGroupedSegmentEndClasses = UI_FIELD_GROUP_SEGMENT_END_CLASS

/** Right-hand segment wash — distinguishes unit/action columns from the value column. */
export const fieldGroupedEndSegmentSurfaceClasses = 'ui-field-group__segment--surface-faint'

/** Reset + faint wash + end radii — shared by JoinedPair and InputSelect trailing segments. */
export const fieldGroupedEndSegmentBaseClasses = cn(
  fieldGroupedSegmentResetClasses,
  fieldGroupedEndSegmentSurfaceClasses,
  fieldGroupedSegmentEndClasses,
)

/** Clip overflow on the left segment column (e.g. nested stepper chrome). */
export const fieldGroupedInputColumnClasses = UI_FIELD_GROUP_INPUT_COLUMN_CLASS
