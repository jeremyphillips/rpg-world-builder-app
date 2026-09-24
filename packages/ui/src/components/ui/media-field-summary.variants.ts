import { cva } from 'class-variance-authority'

export const mediaSummaryCompactButtonVariants = cva(
  'group inline-flex w-fit max-w-full cursor-pointer flex-col items-center gap-1.5 rounded-md p-1 text-center outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
)

export const mediaSummaryCompactMetaVariants = cva('w-24 text-center text-xs leading-tight')

export const mediaSummaryCompactSplitVariants = cva('flex flex-wrap justify-center gap-x-1')

export const mediaSummaryCompactSplitPrefixVariants = cva('whitespace-nowrap text-muted-foreground')

export const mediaSummaryCompactActionVariants = cva(
  'underline-offset-4 transition-[color,text-decoration] group-hover:underline group-focus-visible:underline',
)

export const mediaSummaryWellVariants = cva(
  'flex items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground transition-[color,background-color,border-color,box-shadow]',
  {
    variants: {
      layout: {
        compact:
          'size-24 group-hover:border-ring/50 group-hover:bg-accent group-focus-visible:border-ring group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2',
        expanded: 'min-h-24 w-full',
        tile: 'aspect-square w-24',
      },
    },
  },
)

export const mediaSummaryTileButtonVariants = cva(
  'rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
)
