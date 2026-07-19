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

export const characterDetailAbilitiesContainerClasses = 'rounded-md bg-surface-subtle p-3'

export const characterDetailAbilitiesGridClasses =
  'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6'

export const characterDetailStatsRowClasses = 'flex flex-wrap gap-2'

export const characterDetailHitPointsContainerClasses = 'rounded-md bg-surface-subtle p-3'

export const characterDetailHitPointsGridClasses = 'grid grid-cols-3 gap-2'

export const characterDetailCombatRowGridClasses = 'grid grid-cols-1 gap-4 md:grid-cols-3'

export const characterDetailCombatCardClasses = 'rounded-md bg-surface-subtle p-4'

export const characterDetailActionsPanelClasses = 'space-y-3 rounded-md border border-border p-4'

export const characterDetailListItemClasses = 'rounded-md bg-surface-subtle px-3 py-2 text-sm'

export const characterDetailTabPanelClasses = 'rounded-md bg-surface-subtle p-4'
