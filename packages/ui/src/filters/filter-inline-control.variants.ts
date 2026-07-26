import { cva, type VariantProps } from 'class-variance-authority'

import { fieldControlSizeClasses } from '../components/ui/field-sizing.variants'
import { fieldInputFocusWithinClasses } from '../components/ui/field-input-chrome.variants'
import {
  outlineControlExpandedClasses,
  outlineControlShellClasses,
} from '../components/ui/outline-control.variants'

/** Map outline disclosure open treatment to checked boolean filters. */
const filterInlineControlCheckedClasses = outlineControlExpandedClasses.replaceAll(
  'aria-expanded:',
  'has-[[data-state=checked]]:',
)

/** Inline boolean filter shell — outline row control matching select triggers and More filters. */
export const filterInlineControlVariants = cva(
  [
    'inline-flex w-auto min-w-0 max-w-[14rem] items-center gap-2',
    outlineControlShellClasses,
    filterInlineControlCheckedClasses,
    fieldInputFocusWithinClasses,
    'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
  ].join(' '),
  {
    variants: {
      size: {
        sm: fieldControlSizeClasses.sm,
        md: fieldControlSizeClasses.md,
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
)

export type FilterInlineControlVariantProps = VariantProps<typeof filterInlineControlVariants>
