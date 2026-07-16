import { cva } from 'class-variance-authority'

export const segmentedControlRootVariants = cva(
  'inline-flex rounded-lg border border-border bg-muted/40 p-0.5',
  {
    variants: {
      fullWidth: {
        true: 'flex w-full',
        false: 'w-fit',
      },
    },
    defaultVariants: {
      fullWidth: false,
    },
  },
)

export const segmentedControlSegmentVariants = cva(
  'inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-body-emphasis transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      active: {
        true: 'bg-background text-foreground shadow-sm',
        false: 'bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

export const segmentedControlMetadataVariants = cva('tabular-nums text-muted-foreground')
