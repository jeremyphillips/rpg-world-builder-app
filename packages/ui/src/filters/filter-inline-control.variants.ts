import { cva, type VariantProps } from 'class-variance-authority'

import { fieldControlSizeClasses } from '../components/ui/field-sizing.variants'
import {
  fieldInputDisabledClasses,
  fieldInputFocusWithinClasses,
  fieldInputShellClasses,
} from '../components/ui/field-input-chrome.variants'

/** Shared inline boolean filter shell — checkbox/switch beside label inside field chrome. */
export const filterInlineControlVariants = cva(
  [
    'inline-flex w-auto min-w-0 max-w-[14rem] items-center gap-2',
    fieldInputShellClasses,
    fieldInputFocusWithinClasses,
    fieldInputDisabledClasses,
    'has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-input-disabled has-[:disabled]:text-input-disabled',
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
