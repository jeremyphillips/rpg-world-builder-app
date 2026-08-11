import { cva } from 'class-variance-authority'

export const relationshipListRootVariants = cva(
  '[&>[data-slot=relationship-list-group]+[data-slot=relationship-list-group]]:border-t [&>[data-slot=relationship-list-group]+[data-slot=relationship-list-group]]:border-border-subtle',
)

/** Relationship list group shell — no DetailSectionGroup border-b. */
export const relationshipListGroupVariants = cva('border-b-0 px-4 py-2')

export const relationshipListEmptyVariants = cva(
  'flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2',
)

export const relationshipListFooterVariants = cva(
  'flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-subtle px-4 py-2',
)

export const relationshipListSupplementaryVariants = cva('px-4 py-2')
