import { cva } from 'class-variance-authority'

import { collectionPanelShellClasses } from '@/lib/collection-panel/collection-panel-shell.variants'

export const detailCollectionPanelVariants = cva(collectionPanelShellClasses)

export const detailCollectionPanelHeaderVariants = cva('border-b border-border-subtle px-4 py-3', {
  variants: {
    surface: {
      card: 'bg-card',
      subtle: 'bg-surface-subtle',
      muted: 'bg-muted',
    },
  },
  defaultVariants: {
    surface: 'card',
  },
})

export const detailCollectionPanelHeaderRowVariants = cva('flex flex-wrap justify-between gap-3', {
  variants: {
    align: {
      start: 'items-start',
      center: 'items-center',
    },
  },
  defaultVariants: {
    align: 'start',
  },
})

export const detailCollectionPanelBodyVariants = cva('', {
  variants: {
    surface: {
      subtle: 'bg-surface-subtle',
      faint: 'bg-surface-faint',
      transparent: 'bg-transparent',
    },
  },
  defaultVariants: {
    surface: 'subtle',
  },
})

/** Panel header helper line — 14px muted copy below the title. */
export const detailCollectionPanelHeaderHelperClasses = 'text-style-supporting'
