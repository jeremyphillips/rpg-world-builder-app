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

export const characterDetailStatTileCompactWidthClasses = 'w-[100px] shrink-0'

export const characterDetailStatTileHitPointsWidthClasses = 'w-[200px] shrink-0'

/** One visual step below `Eyebrow` `size="xs"` for dense stat tiles. */
export const characterDetailStatTileEyebrowClasses = 'origin-top scale-[0.92]'

export const characterDetailStatTileFooterClasses =
  'flex h-5 w-full shrink-0 items-center justify-center'

export const characterDetailStatTileFooterMetaClasses =
  'heading-style-subsection font-body-emphasis text-muted-foreground'

export const characterDetailStatTileFooterLabelClasses = 'origin-top scale-[0.92]'

export const characterDetailStatTileHitPointsGridClasses =
  'grid w-full grid-cols-3 grid-rows-[auto_auto] items-start gap-x-2 gap-y-[4px]'

export const characterDetailStatTileHitPointsPairClasses =
  'relative inline-flex items-center justify-center'

export const characterDetailStatTileHitPointsSlashClasses =
  'absolute left-1/2 -translate-x-1/2 heading-style-page font-semibold text-muted-foreground'

export const characterDetailStatTileHitPointsNumberClasses =
  'heading-style-page font-semibold tabular-nums text-foreground px-3'

export const characterDetailAbilitiesStatsSectionClasses = 'flex flex-wrap items-start gap-2'

export const characterDetailAbilitiesContainerClasses = 'w-fit rounded-md bg-surface-subtle p-3'

export const characterDetailAbilitiesRowClasses = 'flex flex-wrap gap-2'

export const characterDetailStatsRowClasses = 'flex flex-wrap gap-2'

/** Main body — combat/proficiencies beside tabs on large screens. */
export const characterDetailBodyGridClasses = 'grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start'

/** Combat section — actions/saves beside proficiencies on medium screens. */
export const characterDetailCombatSectionClasses =
  'grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start'

/** Stacks actions and saving throws in the combat section's first column. */
export const characterDetailCombatPrimaryColumnClasses = 'space-y-4'

export const characterDetailCombatColumnClasses = 'space-y-2'

export const characterDetailCombatCardClasses = 'rounded-md bg-surface-subtle p-4'

export const characterDetailActionsPanelClasses = 'space-y-3 rounded-md border border-border p-4'

export const characterDetailListItemClasses = 'rounded-md bg-surface-subtle px-3 py-2 text-sm'

export const characterDetailTabPanelClasses = 'rounded-md bg-surface-subtle p-4'
