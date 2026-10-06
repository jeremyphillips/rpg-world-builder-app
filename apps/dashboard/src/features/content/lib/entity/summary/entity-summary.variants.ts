import { cva } from 'class-variance-authority'
import { cn, textActionVariants } from '@rpg/ui'

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
 * detail, selection guidance, and warning advisories. `inline` text flows inside the
 * metadata composition and never truncates. The status cell owns the top offset.
 */
export const entitySummaryStatusVariants = cva('', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
    tone: {
      muted: 'text-muted-foreground',
      guidance: 'text-foreground',
      warning: 'text-warning',
    },
    layout: {
      block: 'truncate',
      inline: '',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    tone: 'muted',
    layout: 'block',
  },
})

/** Status items wrap within the lane; the row-anatomy status cell owns the top offset. */
export const entitySummaryStatusRowVariants = cva('flex min-w-0 flex-wrap gap-x-2 gap-y-1')

/** Provenance segment copy — muted detail that reads alongside status on the third line. */
export const entitySummaryProvenanceTextVariants = cva('text-muted-foreground', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/** Inline release/remove action inside a provenance segment. */
export const entitySummaryProvenanceActionVariants = cva(
  cn(
    textActionVariants({ context: 'inline' }),
    'cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:text-muted-foreground',
  ),
  {
    variants: {
      density: {
        compact: 'text-xs',
        comfortable: 'text-sm',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

/** Metadata composition root — one wrapping inline-metadata line sized by density. */
export const entitySummaryStatusMetadataVariants = cva('block min-w-0', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})
