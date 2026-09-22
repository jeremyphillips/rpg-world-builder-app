import { cva } from 'class-variance-authority'

export const detailCollectionPanelVariants = cva(
  'overflow-hidden rounded-md border border-border-subtle',
)

export const detailCollectionPanelHeaderVariants = cva('border-b border-border-subtle px-4 py-2', {
  variants: {
    surface: {
      card: 'bg-card',
      subtle: 'bg-surface-subtle',
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
      transparent: 'bg-transparent',
    },
  },
  defaultVariants: {
    surface: 'subtle',
  },
})
