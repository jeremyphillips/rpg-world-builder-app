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
      sm: cn(
        fieldControlSizeClasses.sm,
        'h-auto min-h-8',
        fieldGroupSummaryTriggerTypographyClasses,
      ),
      md: cn(
        fieldControlSizeClasses.md,
        'h-auto min-h-9',
        fieldGroupSummaryTriggerTypographyClasses,
      ),
      lg: cn(
        fieldControlSizeClasses.lg,
        'h-auto min-h-11',
        fieldGroupSummaryTriggerTypographyClasses,
      ),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Status line, dirty suffix, and the `Change` affordance share one wrapping row. */
export const fieldGroupSummaryTriggerBodyClasses =
  'flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5'

/** Secondary explanatory copy drops below the status line inside the wrapping body. */
export const fieldGroupSummaryTriggerSecondaryClasses = 'basis-full'

/** `Change` visual affordance — not a separate control; `aria-hidden` on the trigger. */
export const fieldGroupSummaryTriggerAffordanceClasses = cn(
  'shrink-0 font-medium text-primary',
  fieldGroupSummaryTriggerTypographyClasses,
)
