import { cva } from 'class-variance-authority'

export const mediaSummaryCompactButtonVariants = cva(
  'group inline-flex min-w-28 flex-col items-center gap-2 rounded-md p-1 text-center outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
)

export const mediaSummaryWellVariants = cva(
  'flex items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground transition-colors group-hover:border-ring/50',
  {
    variants: {
      layout: {
        compact: 'size-24',
        expanded: 'min-h-24 w-full',
        tile: 'aspect-square w-24',
      },
    },
  },
)

export const mediaSummaryTileButtonVariants = cva(
  'rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
)
