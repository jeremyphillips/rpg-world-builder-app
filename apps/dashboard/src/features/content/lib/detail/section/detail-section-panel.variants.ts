import { cva } from 'class-variance-authority'

export const detailSectionPanelVariants = cva(
  'overflow-hidden rounded-md border border-border-subtle',
)

export const detailSectionPanelHeaderVariants = cva(
  'border-b border-border-subtle bg-card px-4 py-2',
)

export const detailSectionPanelHeaderRowVariants = cva(
  'flex flex-wrap items-start justify-between gap-3',
)

export const detailSectionPanelBodyVariants = cva('bg-surface-subtle')
