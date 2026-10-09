import { cva, type VariantProps } from 'class-variance-authority'

import { fieldControlSizeClasses } from '../components/ui/field-sizing.variants'
import { fieldInputFocusWithinClasses } from '../components/ui/field-input-chrome.variants'
import {
  ghostControlExpandedClasses,
  ghostControlVisualStateClasses,
} from '../components/ui/ghost-control.variants'
import {
  outlineControlExpandedClasses,
  outlineControlShellClasses,
} from '../components/ui/outline-control.variants'

/** Map outline disclosure open treatment to checked boolean filters. */
const filterInlineControlOutlineCheckedClasses = outlineControlExpandedClasses.replaceAll(
  'aria-expanded:',
  'has-[[data-state=checked]]:',
)

/** Map ghost disclosure open treatment to checked boolean filters. */
const filterInlineControlGhostCheckedClasses = ghostControlExpandedClasses.replaceAll(
  'aria-expanded:',
  'has-[[data-state=checked]]:',
)

const filterInlineControlBaseClasses = [
  'inline-flex w-auto min-w-0 max-w-[14rem] items-center gap-2 rounded-md transition-colors',
  fieldInputFocusWithinClasses,
  'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
].join(' ')

/** Inline boolean filter shell — outline or ghost surface; checkbox semantics stay native. */
export const filterInlineControlVariants = cva(filterInlineControlBaseClasses, {
  variants: {
    size: {
      sm: fieldControlSizeClasses.sm,
      md: fieldControlSizeClasses.md,
    },
    variant: {
      outline: [outlineControlShellClasses, filterInlineControlOutlineCheckedClasses].join(' '),
      ghost: [ghostControlVisualStateClasses, filterInlineControlGhostCheckedClasses].join(' '),
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'outline',
  },
})

export type FilterInlineControlVariantProps = VariantProps<typeof filterInlineControlVariants>
export type FilterInlineControlShellVariant = NonNullable<
  FilterInlineControlVariantProps['variant']
>
