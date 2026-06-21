import { cva } from 'class-variance-authority'

/**
 * Form layout spacing — three levels, single source of truth.
 *
 * - `fieldAnatomyStackClasses` — label / control / hint inside one field
 * - `fieldGroupStackClasses` — sibling fields within a group or form column
 * - `formSectionStackClasses` — top-level accordion sections
 */
export const fieldAnatomyStackClasses = 'space-y-3'
export const fieldGroupStackClasses = 'space-y-6'
export const formSectionStackClasses = 'flex flex-col gap-7'

export const fieldLabelVariants = cva(
  [
    'flex items-center gap-1.5 font-medium leading-none',
    "data-[required]:after:content-['*'] data-[required]:after:text-destructive",
  ],
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export const fieldGroupLegendVariants = cva(
  'mb-4 font-display text-lg font-semibold leading-none text-foreground',
)
