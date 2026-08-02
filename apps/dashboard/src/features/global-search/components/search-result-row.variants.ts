import { cva } from 'class-variance-authority'

export const searchResultRowVariants = cva(
  'block w-full px-0 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      inset: {
        panel: 'border-b-0',
        none: 'border-b border-border',
      },
    },
    defaultVariants: {
      inset: 'none',
    },
  },
)

export const searchResultRowHeaderVariants = cva('flex items-start justify-between gap-3')

export const searchResultRowTitleRowVariants = cva('flex min-w-0 flex-1 items-center gap-2')

export const searchResultRowTitleVariants = cva(
  'min-w-0 truncate text-sm font-semibold text-foreground',
)

export const searchResultRowTypeLabelVariants = cva('shrink-0 text-xs text-muted-foreground')

export const searchResultRowSecondaryVariants = cva('mt-1 text-muted-foreground', {
  variants: {
    inset: {
      panel: 'truncate text-xs',
      none: 'text-sm',
    },
  },
  defaultVariants: {
    inset: 'none',
  },
})

export const searchResultRowInsetContentVariants = cva('', {
  variants: {
    inset: {
      panel: 'px-3',
      none: '',
    },
  },
  defaultVariants: {
    inset: 'none',
  },
})
