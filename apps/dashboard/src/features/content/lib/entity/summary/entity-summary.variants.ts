import { cva } from 'class-variance-authority'
import { cn, textActionVariants } from '@rpg/ui'

/** Fills the anatomy content cell. The heading line owns end alignment. */
export const entitySummaryHeadingRowVariants = cva('flex min-w-0 w-full flex-1')

export const entitySummaryHeadingEndValueVariants = cva(
  'ui-copy-title shrink-0 tabular-nums font-body-emphasis text-muted-foreground',
  {
    variants: {
      density: {
        /** Size comes from the title-line end slot (`text-style-caption`, 12px). */
        compact: 'text-style-caption',
        comfortable: '',
        spacious: '',
      },
    },
  },
)

/**
 * Text status line. Density matches supporting copy; tone distinguishes muted
 * detail, selection guidance, and warning advisories. `inline` text flows inside the
 * metadata composition and never truncates. The status cell owns the top offset.
 */
export const entitySummaryStatusVariants = cva('ui-copy-supporting', {
  variants: {
    density: {
      compact: 'text-style-caption',
      comfortable: '',
      spacious: '',
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
    tone: 'muted',
    layout: 'block',
  },
})

/** Status items wrap within the lane; the row-anatomy status cell owns the top offset. */
export const entitySummaryStatusRowVariants = cva('flex min-w-0 flex-wrap gap-x-2 gap-y-1')

/** Consecutive badges inside one metadata line — spacing only, no middle-dot separators. */
export const entitySummaryStatusBadgeGroupVariants = cva(
  'inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1',
)

/** Selection-state line stacked above status and provenance actions inside the status cell. */
export const entitySummaryStatusLaneVariants = cva('flex min-w-0 flex-col gap-1')

/** Provenance segment copy — foreground source labels on the third line, beside status. */
export const entitySummaryProvenanceTextVariants = cva('ui-copy-supporting text-foreground', {
  variants: {
    density: {
      compact: 'text-style-caption',
      comfortable: '',
      spacious: '',
    },
  },
})

/** Inline release/remove action inside a provenance segment. Standalone text action: no resting underline. */
export const entitySummaryProvenanceActionVariants = cva(
  cn(
    textActionVariants({ context: 'standalone' }),
    'cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:text-muted-foreground',
  ),
  {
    variants: {
      density: {
        compact: 'text-style-caption',
        comfortable: '',
        spacious: '',
      },
    },
  },
)

/** Metadata composition root — one wrapping inline-metadata line sized by density. */
export const entitySummaryStatusMetadataVariants = cva('ui-copy-supporting block min-w-0', {
  variants: {
    density: {
      compact: 'text-style-caption',
      comfortable: '',
      spacious: '',
    },
  },
})
