/**
 * Shared chrome for radio/checkbox choice indicators on panel surfaces.
 * Uses `--choice-control-border` (mixed toward `--surface-current`), not field-input chrome.
 */
export const choiceControlIndicatorShellClasses =
  'border border-choice-control shadow-sm transition-colors'

export const choiceControlIndicatorFocusClasses =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const choiceControlIndicatorCheckedBorderClasses = 'data-[state=checked]:border-primary'

/** Decorative indicator inside a Radix group item (RadioCard shell). */
export const choiceControlIndicatorGroupCheckedBorderClasses =
  'group-data-[state=checked]:border-primary'

export const choiceControlIndicatorInvalidClasses = 'aria-invalid:border-input-invalid'

export const choiceControlIndicatorDisabledClasses =
  'disabled:cursor-not-allowed disabled:opacity-50'
