import { cva } from 'class-variance-authority'

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

/** State word. Provenance stays on the muted inline-metadata item at regular weight. */
export const pickerSelectionStateWordVariants = cva(
  'inline-flex items-center gap-1 text-foreground font-body-emphasis',
)

export const pickerSelectionStateIconVariants = cva('size-3.5 shrink-0')
