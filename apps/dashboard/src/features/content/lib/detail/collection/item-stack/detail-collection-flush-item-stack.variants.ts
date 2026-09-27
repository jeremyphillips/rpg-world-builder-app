import { cva } from 'class-variance-authority'

/** Matches prose section inset (`py-4`) at stack top; bottom inset on the last item. */
export const detailCollectionFlushItemStackVariants = cva('pt-4')

export const detailCollectionFlushItemStackItemVariants = cva(
  'border-b border-border-subtle px-4 pb-4 mb-4 last:mb-0 last:border-b-0',
)
