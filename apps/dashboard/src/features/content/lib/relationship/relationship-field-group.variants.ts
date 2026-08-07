import { cva } from 'class-variance-authority'

export const relationshipFieldGroupVariants = cva(
  'overflow-hidden rounded-md border border-border-subtle',
)

export const relationshipFieldGroupHeaderVariants = cva('bg-card px-4 py-2')

export const relationshipFieldGroupBodyVariants = cva('bg-surface-subtle')

export const relationshipFieldGroupRowVariants = cva(
  'border-b border-border-subtle px-4 py-2 last:border-b-0',
)
