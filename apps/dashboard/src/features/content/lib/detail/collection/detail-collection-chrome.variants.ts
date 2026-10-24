/**
 * Shared collection-body chrome — public style contract for grouped and relationship
 * collection grammars inside DetailCollectionPanel.
 */
export const detailCollectionGroupHeaderVariants = 'mb-1 flex items-center justify-between gap-3'

/** Record list-item dividers — used by DetailCollectionRowList (record) and EntityRowList.Group. */
export const detailCollectionRecordSeparatorVariants =
  '[&>li+li]:border-t [&>li+li]:border-border-subtle'
