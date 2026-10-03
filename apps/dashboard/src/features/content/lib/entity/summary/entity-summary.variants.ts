import { cva } from 'class-variance-authority'

export const entitySummaryHeadingRowVariants = cva('flex min-w-0 flex-1 items-center gap-2')

export const entitySummaryHeadingEndValueVariants = cva(
  'shrink-0 tabular-nums font-body-emphasis text-muted-foreground',
  {
    variants: {
      density: {
        compact: 'text-sm',
        comfortable: 'text-base',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

/**
 * Text status line. Density matches supporting copy; tone distinguishes muted
 * detail from warning advisories. The status cell owns the top offset.
 */
export const entitySummaryStatusVariants = cva('truncate', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
    tone: {
      muted: 'text-muted-foreground',
      warning: 'text-warning',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    tone: 'muted',
  },
})

/** Status items wrap within the lane; the row-anatomy status cell owns the top offset. */
export const entitySummaryStatusRowVariants = cva('flex min-w-0 flex-wrap gap-x-2 gap-y-1')
