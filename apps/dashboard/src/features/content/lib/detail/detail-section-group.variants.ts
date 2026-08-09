import { cva } from 'class-variance-authority'

export const detailSectionGroupVariants = cva(
  'border-b border-border-subtle px-4 py-2 last:border-b-0',
)

export const detailSectionGroupHeaderVariants = cva('mb-1 flex items-center justify-between gap-3')
