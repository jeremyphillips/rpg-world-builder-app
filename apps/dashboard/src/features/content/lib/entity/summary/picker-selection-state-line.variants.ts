import { cva } from 'class-variance-authority'

/** Selection-state line. Density matches supporting copy; the status cell owns the offset. */
export const pickerSelectionStateLineVariants = cva('ui-copy-supporting min-w-0', {
  variants: {
    density: {
      compact: 'text-style-caption',
      comfortable: '',
      spacious: '',
    },
  },
})

/**
 * State word stays in inline flow so its baseline matches provenance.
 * The icon aligns to the x-height and does not become the line's baseline.
 */
export const pickerSelectionStateWordVariants = cva('text-foreground font-body-emphasis')
