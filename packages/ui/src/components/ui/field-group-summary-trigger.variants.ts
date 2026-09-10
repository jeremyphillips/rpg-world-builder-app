import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  fieldInputDisabledClasses,
  fieldInputFocusClasses,
  fieldInputShellClasses,
} from './field-input-chrome.variants'
import { fieldControlSizeClasses } from './field-sizing.variants'

/** Layout + focus for the shared summary trigger. Fill chrome is applied separately. */
export const fieldGroupSummaryTriggerLayoutClasses =
  'flex w-full items-center justify-between gap-3 text-left'

/** Summary copy sits at 12px in both compact and comfortable forms. */
export const fieldGroupSummaryTriggerTypographyClasses = 'text-xs'

/** Faux-input shell for the shared summary trigger — matches filled field controls. */
export const fieldGroupSummaryTriggerShellClasses = cn(
  fieldGroupSummaryTriggerLayoutClasses,
  fieldInputShellClasses,
  fieldInputFocusClasses,
  fieldInputDisabledClasses,
)

export const fieldGroupSummaryTriggerSizeVariants = cva('', {
  variants: {
    size: {
      sm: cn(fieldControlSizeClasses.sm, fieldGroupSummaryTriggerTypographyClasses),
      md: cn(fieldControlSizeClasses.md, fieldGroupSummaryTriggerTypographyClasses),
      lg: cn(fieldControlSizeClasses.lg, fieldGroupSummaryTriggerTypographyClasses),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Status line and optional dirty suffix — truncates before the `Change` affordance. */
export const fieldGroupSummaryTriggerBodyClasses =
  'flex min-w-0 flex-1 flex-nowrap items-center gap-x-1.5 overflow-hidden'

/** Secondary explanatory copy drops below the status line inside the wrapping body. */
export const fieldGroupSummaryTriggerSecondaryClasses = 'basis-full'

/** `Change` visual affordance — not a separate control; `aria-hidden` on the trigger. */
export const fieldGroupSummaryTriggerAffordanceClasses = cn(
  'shrink-0 font-medium text-primary',
  fieldGroupSummaryTriggerTypographyClasses,
)
