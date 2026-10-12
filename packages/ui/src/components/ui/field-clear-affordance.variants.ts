import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { ghostControlVisualStateClasses } from './ghost-control.variants'
import { interactiveFocusVariants } from './interactive-focus.variants'
import { resolveFieldGroupCaretSlotClass, resolveFieldGroupSizeClass } from './field-group.styles'
import { groupedEndLabelSegmentShellClasses } from './select-compact-trigger.variants'
import type { FieldSize } from './field.client'

/** Grouped trigger segment — full height × caret column (select/combobox clear). */
export function fieldClearAffordanceGroupedClasses(size: FieldSize): string {
  return cn(
    groupedEndLabelSegmentShellClasses(size),
    resolveFieldGroupSizeClass(size),
    resolveFieldGroupCaretSlotClass(),
    'inline-flex shrink-0 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground',
    interactiveFocusVariants({ context: 'embedded' }),
  )
}

/**
 * Inset clear inside a single-line field (SearchBar trailing slot).
 * Hit target: full control height × field-group caret column width.
 */
export const fieldClearAffordanceInsetVariants = cva(
  cn(
    'absolute inset-y-0 right-0 inline-flex cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground',
    ghostControlVisualStateClasses,
    interactiveFocusVariants({ context: 'embedded' }),
  ),
  {
    variants: {
      size: {
        xs: cn(resolveFieldGroupSizeClass('xs'), resolveFieldGroupCaretSlotClass()),
        sm: cn(resolveFieldGroupSizeClass('sm'), resolveFieldGroupCaretSlotClass()),
        md: cn(resolveFieldGroupSizeClass('md'), resolveFieldGroupCaretSlotClass()),
        lg: cn(resolveFieldGroupSizeClass('lg'), resolveFieldGroupCaretSlotClass()),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)
