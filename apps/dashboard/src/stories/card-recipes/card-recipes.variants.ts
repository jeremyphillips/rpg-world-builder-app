import { cva } from 'class-variance-authority'

export const cardRecipesPageClasses = 'flex max-w-5xl flex-col gap-10'

export const cardRecipesSectionClasses = 'flex flex-col gap-4'

export const cardRecipesGridClasses = 'grid grid-cols-1 gap-4 lg:grid-cols-2'

export const cardRecipeTileClasses =
  'flex min-w-0 flex-col gap-3 rounded-md border border-border-faint p-4'

export const cardRecipeTileHeaderClasses = 'flex min-w-0 flex-wrap items-center justify-between gap-2'

export const cardRecipeTileMetaListClasses =
  'grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs text-muted-foreground'

export const cardRecipeTileMetaTermClasses = 'font-medium text-foreground'

export const cardRecipeTileChainClasses = 'flex min-w-0 flex-wrap gap-1'

export const cardRecipeTilePreviewClasses = 'min-w-0 border-t border-border-faint pt-3'

/**
 * Debug outlines for the "Show anatomy" toolbar. Row-track roots, cells, and the legacy
 * `data-entity-item-slot` hooks get distinct dashed outlines.
 */
export const rowAnatomyOutlineVariants = cva('', {
  variants: {
    enabled: {
      true: [
        '[&_[data-row-anatomy]]:outline-1 [&_[data-row-anatomy]]:outline-dashed [&_[data-row-anatomy]]:outline-primary',
        '[&_[data-row-anatomy-slot]]:outline-1 [&_[data-row-anatomy-slot]]:outline-dashed [&_[data-row-anatomy-slot]]:outline-warning [&_[data-row-anatomy-slot]]:-outline-offset-1',
        '[&_[data-entity-item-slot]:not([data-row-anatomy-slot])]:outline-1 [&_[data-entity-item-slot]:not([data-row-anatomy-slot])]:outline-dotted [&_[data-entity-item-slot]:not([data-row-anatomy-slot])]:outline-destructive',
      ],
      false: '',
    },
  },
  defaultVariants: { enabled: false },
})
