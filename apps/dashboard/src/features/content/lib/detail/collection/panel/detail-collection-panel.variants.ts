import { cva } from 'class-variance-authority'

export const detailCollectionPanelVariants = cva(
  'overflow-hidden rounded-md border border-border-subtle',
)

export const detailCollectionPanelHeaderVariants = cva(
  'border-b border-border-subtle bg-card px-4 py-2',
)

export const detailCollectionPanelHeaderRowVariants = cva(
  'flex flex-wrap items-start justify-between gap-3',
)

export const detailCollectionPanelBodyVariants = cva('bg-surface-subtle')
