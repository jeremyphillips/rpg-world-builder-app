import { cva } from 'class-variance-authority'

export const characterDetailStatTileVariants = cva(
  'flex min-h-30 flex-col items-center rounded-md px-3 py-3 text-center',
  {
    variants: {
      surface: {
        subtle: 'bg-surface-subtle',
        strong: 'bg-surface-strong',
        outline: 'border border-border bg-background',
      },
    },
    defaultVariants: {
      surface: 'subtle',
    },
  },
)

export const characterDetailStatTileValueClasses =
  'heading-style-page font-semibold tabular-nums text-foreground'

export const characterDetailStatTileCaptionClasses =
  'heading-style-subsection font-body-emphasis text-muted-foreground'
