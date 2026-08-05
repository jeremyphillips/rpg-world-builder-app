import { cva } from 'class-variance-authority'

export const crossContentRelationshipRowVariants = cva(
  'flex items-center justify-between gap-4 py-1',
)

export const crossContentRelationshipRowContentVariants = cva('min-w-0 flex-1')

export const crossContentRelationshipRowEyebrowVariants = cva(
  'text-xs font-medium text-muted-foreground',
)

export const crossContentRelationshipRowHeadingVariants = cva('text-sm font-medium text-foreground')

export const crossContentRelationshipRowSubheadingVariants = cva('text-xs text-muted-foreground')

export const crossContentRelationshipRowSecondaryTextVariants =
  crossContentRelationshipRowSubheadingVariants
