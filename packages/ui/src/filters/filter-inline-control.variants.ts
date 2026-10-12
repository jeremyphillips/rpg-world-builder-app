import { cva, type VariantProps } from 'class-variance-authority'

import { fieldControlSizeClasses } from '../components/ui/field-sizing.variants'
import {
  FILTER_INLINE_APPEARANCE_SPECS,
  UI_FILTER_INLINE_SHELL_CLASS,
} from '../components/ui/field-control.styles'

const filterInlineAppearanceClass = Object.fromEntries(
  FILTER_INLINE_APPEARANCE_SPECS.map((spec) => [spec.appearance, spec.className]),
) as Record<'outline' | 'ghost', string>

/** Inline boolean filter shell — outline or ghost surface; checkbox semantics stay native. */
export const filterInlineControlVariants = cva(UI_FILTER_INLINE_SHELL_CLASS, {
  variants: {
    size: {
      sm: fieldControlSizeClasses.sm,
      md: fieldControlSizeClasses.md,
    },
    variant: filterInlineAppearanceClass,
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
