import { cva } from 'class-variance-authority'
import { cn, inlineIconTextClasses } from '@rpg/ui'

/** Selection-state line. Density matches supporting copy; the status cell owns the offset. */
export const pickerSelectionStateLineVariants = cva('min-w-0', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/**
 * State word stays in inline flow so its baseline matches provenance.
 * The icon aligns to the x-height and does not become the line's baseline.
 */
export const pickerSelectionStateWordVariants = cva('text-foreground font-body-emphasis')

export const pickerSelectionStateIconVariants = cva(cn('me-1', inlineIconTextClasses))
