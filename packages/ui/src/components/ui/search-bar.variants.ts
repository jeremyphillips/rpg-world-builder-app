import { cva } from 'class-variance-authority'

export const searchBarRootVariants = cva('relative w-full min-w-0')

export const searchBarLeadingIconVariants = cva(
  'pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-input-placeholder',
  {
    variants: {
      disabled: {
        true: 'text-input-disabled',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
)

export const searchBarClearButtonVariants = cva(
  'absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground',
)
