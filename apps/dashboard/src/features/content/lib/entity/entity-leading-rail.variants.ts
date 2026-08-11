import { cva } from 'class-variance-authority'

/** Fixed-width column for one leading utility control. */
export const entityLeadingRailColumnVariants = cva(
  'flex w-[var(--leading-chrome-size)] shrink-0 items-center justify-center',
)

/** Horizontal row of equal-width leading utility columns. */
export const entityLeadingRailVariants = cva('flex shrink-0 items-center gap-0')
