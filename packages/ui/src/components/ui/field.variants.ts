import { cva } from 'class-variance-authority'

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
