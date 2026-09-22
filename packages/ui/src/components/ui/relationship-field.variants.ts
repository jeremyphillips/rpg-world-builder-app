import { cva } from 'class-variance-authority'

export const relationshipFieldListVariants = cva(
  'divide-y divide-border-subtle rounded-md border border-border-subtle',
)

export const relationshipFieldRowVariants = cva('px-4 py-2')

export const relationshipFieldEmptyVariants = cva('py-6')

export const relationshipFieldFooterVariants = cva(
  'flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-subtle px-4 py-2',
)
