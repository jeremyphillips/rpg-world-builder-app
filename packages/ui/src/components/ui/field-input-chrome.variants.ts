import { cn } from '../../lib/utils'

/**
 * Shared chrome for text-like field controls and grouped field shells.
 * Border, fill, focus, invalid, readonly, and disabled treatments use
 * `--field-control-*` semantic roles via `border-input` / `bg-input` utilities.
 */
export const fieldInputShellClasses =
  'rounded-md border border-input bg-input shadow-sm transition-colors hover:border-input-hover'

/** Single-control focus (Input, Textarea, native focus). */
export const fieldInputFocusClasses =
  'focus-visible:outline-none focus-visible:border-input-focus focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** Grouped-control focus (InputSelect, DiceFormula, RichText). */
export const fieldInputFocusWithinClasses =
  'focus-within:outline-none focus-within:border-input-focus focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background'

/** Driven by `aria-invalid` on the control or shell. */
export const fieldInputInvalidAriaClasses =
  'aria-invalid:border-input-invalid aria-invalid:bg-input-invalid-subtle aria-invalid:focus-visible:ring-input-invalid'

/** For CVA `invalid` variant on group shells. */
export const fieldInputInvalidClasses =
  'border-input-invalid bg-input-invalid-subtle focus-within:ring-input-invalid'

/** Inner segment wash (input-select value cell, etc.). */
export const fieldInputInvalidSegmentClasses =
  '[&_[data-input-select-value]]:bg-input-invalid-subtle'

export const fieldInputDisabledClasses =
  'disabled:cursor-not-allowed disabled:bg-input-disabled disabled:border-input-disabled disabled:text-input-disabled'

export const fieldInputReadonlyClasses =
  '[readonly]:bg-input-readonly [readonly]:border-input-readonly'

export const fieldInputPlaceholderClasses =
  'placeholder:text-input-placeholder disabled:placeholder:text-input-disabled'

/** Browser autofill often bypasses `bg-input` — pin fill to field-control bg. */
export const fieldInputAutofillClasses =
  '[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--field-control-bg)] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--field-control-fg)]'

/** Grouped field shell base — border, fill, and focus-within ring on the outer wrapper. */
export const fieldGroupedShellClasses = cn(
  'grid items-center',
  fieldInputShellClasses,
  fieldInputFocusWithinClasses,
)

/** Stretch layout: input grows, trailing segment stays intrinsic width. */
export const fieldGroupedShellStretchLayoutClasses = 'w-full grid-cols-[1fr_1px_auto]'

/** Intrinsic layout: shell width follows segment content. */
export const fieldGroupedShellIntrinsicLayoutClasses = 'w-fit max-w-full grid-cols-[auto_1px_auto]'

/** Vertical divider between grouped segments. */
export const fieldGroupedDividerClasses = 'w-px shrink-0 self-stretch bg-border'

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

/** Clip overflow on the left segment column (e.g. nested stepper chrome). */
export const fieldGroupedInputColumnClasses = 'min-w-0 overflow-hidden rounded-l-md'
