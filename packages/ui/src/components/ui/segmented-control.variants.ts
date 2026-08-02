import { cva } from 'class-variance-authority'

export const segmentedControlRootVariants = cva(
  'inline-flex rounded-lg border border-border bg-segmented-track p-0.5',
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
  'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-body-emphasis transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      active: {
        true: 'bg-background text-foreground shadow-sm',
        false: 'bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground',
      },
      segmentWidth: {
        equal: 'min-w-0 flex-1',
        auto: 'shrink-0',
      },
    },
    defaultVariants: {
      active: false,
      segmentWidth: 'equal',
    },
  },
)

export const segmentedControlLabelVariants = cva('', {
  variants: {
    segmentWidth: {
      equal: 'truncate',
      auto: 'whitespace-nowrap',
    },
  },
  defaultVariants: {
    segmentWidth: 'equal',
  },
})

export const segmentedControlMetadataVariants = cva('text-xs tabular-nums', {
  variants: {
    active: {
      true: 'text-foreground-subtle',
      false: 'text-foreground-disabled',
    },
  },
  defaultVariants: {
    active: false,
  },
})
