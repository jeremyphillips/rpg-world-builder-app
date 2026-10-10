import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  UI_FIELD_CONTROL_BLOCK_CLASS,
  UI_FIELD_CONTROL_GROUPED_SHELL_CLASS,
  UI_FIELD_CONTROL_GROUPED_SHELL_INVALID_CLASS,
} from './field-control.styles'

/** @deprecated Prefer {@link UI_FIELD_CONTROL_BLOCK_CLASS} — presentation lives in field-control.css. */
export const fieldInputShellClasses = UI_FIELD_CONTROL_BLOCK_CLASS

/** @deprecated Field focus presentation lives on {@link UI_FIELD_CONTROL_BLOCK_CLASS} in CSS. */
export const fieldInputFocusClasses = ''

/** @deprecated Grouped focus-within lives on {@link UI_FIELD_CONTROL_GROUPED_SHELL_CLASS} in CSS. */
export const fieldInputFocusWithinClasses = ''

/** @deprecated Invalid treatment lives on {@link UI_FIELD_CONTROL_BLOCK_CLASS} in CSS. */
export const fieldInputInvalidAriaClasses = ''

/** Grouped-control invalid shell — pairs with {@link UI_FIELD_CONTROL_GROUPED_SHELL_CLASS}. */
export const fieldInputInvalidClasses = UI_FIELD_CONTROL_GROUPED_SHELL_INVALID_CLASS

/** @deprecated Disabled treatment lives on {@link UI_FIELD_CONTROL_BLOCK_CLASS} in CSS. */
export const fieldInputDisabledClasses = ''

/** @deprecated Readonly treatment lives on {@link UI_FIELD_CONTROL_BLOCK_CLASS} in CSS. */
export const fieldInputReadonlyClasses = ''

/** @deprecated Placeholder colors live on {@link UI_FIELD_CONTROL_BLOCK_CLASS} in CSS. */
export const fieldInputPlaceholderClasses = ''

/** @deprecated Autofill treatment lives on {@link UI_FIELD_CONTROL_BLOCK_CLASS} in CSS. */
export const fieldInputAutofillClasses = ''

/** Grouped field shell base — border, fill, and focus-within ring on the outer wrapper. */
export const fieldGroupedShellClasses = cn(
  'grid items-center',
  UI_FIELD_CONTROL_GROUPED_SHELL_CLASS,
)

/** Stretch layout: input grows, trailing segment stays intrinsic width. */
export const fieldGroupedShellStretchLayoutClasses = 'w-full grid-cols-[1fr_1px_auto]'

/**
 * Intrinsic layout: shell width follows segment content.
 * `min-w-max` keeps the outer border wrapped around the full composite when the parent
 * track constricts — overflow moves to the row instead of mangling the grouped shell.
 */
export const fieldGroupedShellIntrinsicLayoutClasses =
  'w-fit min-w-max max-w-full grid-cols-[auto_minmax(1px,1px)_auto]'

/** Shared geometry for vertical dividers between grouped segments. */
export const fieldGroupedDividerBaseClasses = 'relative z-[1] w-px min-w-px shrink-0 self-stretch'

/**
 * Grouped segment divider — `primary` separates major sub-controls; `subtle` separates
 * tightly related sub-segments within one logical control.
 */
export const groupedDividerVariants = cva(fieldGroupedDividerBaseClasses, {
  variants: {
    strength: {
      primary: 'bg-border',
      subtle: 'bg-border-subtle',
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
export const fieldGroupedSegmentResetClasses =
  'border-0 bg-transparent shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'

/** Left segment corner radii (input/value column). */
export const fieldGroupedSegmentStartClasses = 'rounded-l-md rounded-r-none'

/** Right segment corner radii (unit/action column). */
export const fieldGroupedSegmentEndClasses = 'rounded-l-none rounded-r-md'

/** Right-hand segment wash — distinguishes unit/action columns from the value column. */
export const fieldGroupedEndSegmentSurfaceClasses = 'bg-surface-faint'

/** Reset + faint wash + end radii — shared by JoinedPair and InputSelect trailing segments. */
export const fieldGroupedEndSegmentBaseClasses = cn(
  fieldGroupedSegmentResetClasses,
  fieldGroupedEndSegmentSurfaceClasses,
  fieldGroupedSegmentEndClasses,
)

/** Clip overflow on the left segment column (e.g. nested stepper chrome). */
export const fieldGroupedInputColumnClasses = 'min-w-0 overflow-hidden rounded-l-md'
