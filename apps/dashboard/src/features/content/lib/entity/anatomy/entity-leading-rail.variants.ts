import { cva } from 'class-variance-authority'

/** Fixed-width column for one leading utility control. */
export const entityLeadingRailColumnVariants = cva(
  'flex w-[var(--leading-chrome-size)] shrink-0 items-center justify-center',
)

/** Horizontal row of equal-width leading utility columns plus content-end gap. */
export const entityLeadingRailVariants = cva('flex shrink-0 items-center gap-0', {
  variants: {
    density: {
      compact: 'pe-[calc(var(--spacing)*2)]',
      comfortable: 'pe-[calc(var(--spacing)*3)]',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})
