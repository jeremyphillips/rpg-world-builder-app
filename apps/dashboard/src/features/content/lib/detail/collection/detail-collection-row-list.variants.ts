import { cva } from 'class-variance-authority'

export type DetailCollectionRowListSeparatorKind = 'structural' | 'record'

/** Structural sibling dividers — DetailCollectionRowList only (nested div children). */
export const detailCollectionRowListStructuralSeparatorVariants = cva(
  '[&>*+*]:border-t [&>*+*]:border-border-subtle',
)
