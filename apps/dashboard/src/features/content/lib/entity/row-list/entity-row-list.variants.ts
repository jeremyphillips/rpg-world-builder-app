import { cva } from 'class-variance-authority'

export const entityRowListRootVariants = cva(
  '[&>[data-slot=entity-row-list-group]+[data-slot=entity-row-list-group]]:border-t [&>[data-slot=entity-row-list-group]+[data-slot=entity-row-list-group]]:border-border-subtle',
)

/** Entity row list group shell — no DetailCollectionGroup border-b. */
export const entityRowListGroupVariants = cva('border-b-0 px-4 py-2')

export const entityRowListEmptyVariants = cva(
  'flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2',
)

export const entityRowListFooterVariants = cva(
  'flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-subtle px-4 py-2',
)

export const entityRowListSupplementaryVariants = cva('px-4 py-2')
