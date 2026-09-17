import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { iconGlyphDirectChildClasses, iconGlyphRootClasses } from './icon-glyph.variants'

export const richTextTableEmbedCardClasses = cva(
  'rounded-md border bg-card px-3 py-2 shadow-sm transition-colors',
  {
    variants: {
      selected: {
        true: 'border-primary ring-2 ring-primary/20',
        false: 'border-border',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

export const richTextTableEmbedCardContentClasses =
  'flex flex-wrap items-center justify-between gap-3'

export const richTextTableEmbedCardHeaderClasses = 'flex min-w-0 items-start gap-2'

export const richTextTableEmbedCardTitleClasses = 'truncate font-medium'

export const richTextTableEmbedCardMetadataClasses = 'truncate text-sm'

export const richTextTableEmbedCardActionsClasses = 'flex shrink-0 items-center gap-1'

export const richTextTableEmbedCardIconClasses = cn(
  'shrink-0 text-muted-foreground',
  iconGlyphRootClasses.md,
)

export const richTextTableEmbedEditIconClasses = iconGlyphDirectChildClasses.sm

export const richTextTableEmbedRemoveIconClasses = iconGlyphDirectChildClasses.md

export const richTextTableEmbedRemoveButtonClasses = 'size-8'
