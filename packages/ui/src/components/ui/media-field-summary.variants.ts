import { cva } from 'class-variance-authority'

export const mediaSummaryCompactInteractiveRootVariants = cva(
  'group relative block size-image-preview shrink-0 overflow-hidden rounded-md',
)

export const mediaSummaryCompactPreviewButtonVariants = cva(
  'relative block size-full rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 enabled:cursor-pointer disabled:pointer-events-none disabled:opacity-50',
)

export const mediaSummaryCompactOverlayVariants = cva(
  'absolute inset-x-px bottom-px z-10 flex h-5 items-center justify-center rounded-b-[calc(var(--radius-md)-1px)] border-t border-border bg-sunken/80 px-1 text-xs leading-none',
)

export const mediaSummaryCompactCountVariants = cva(
  'min-w-0 flex-1 text-center font-medium text-foreground',
)

export const mediaSummaryCompactGearButtonVariants = cva(
  'absolute bottom-px right-px z-20 flex h-5 items-center pr-0.5 text-muted-foreground outline-none transition-colors enabled:cursor-pointer hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
)

export const mediaSummaryCompactGearIconVariants = cva('size-3.5')

export const mediaSummaryWellVariants = cva(
  'absolute inset-0 flex items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground transition-[color,background-color,border-color,box-shadow]',
  {
    variants: {
      layout: {
        compact:
          'group-hover:border-ring/50 group-hover:bg-accent group-focus-within:border-ring group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-2',
        expanded: 'relative min-h-24 w-full',
        tile: 'relative aspect-square w-24',
      },
    },
  },
)

export const mediaSummaryTileButtonVariants = cva(
  'rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
)
