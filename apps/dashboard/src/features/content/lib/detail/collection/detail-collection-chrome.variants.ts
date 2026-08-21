import { cva } from 'class-variance-authority'

/**
 * Shared collection-body chrome — public style contract for grouped and relationship
 * collection grammars inside DetailCollectionPanel.
 */
export const detailCollectionGroupHeaderVariants = cva(
  'mb-1 flex items-center justify-between gap-3',
)

/** Record list-item dividers — used by DetailCollectionRowList (record) and RelationshipList.Group. */
export const detailCollectionRecordSeparatorVariants = cva(
  '[&>li+li]:border-t [&>li+li]:border-border-subtle',
)
