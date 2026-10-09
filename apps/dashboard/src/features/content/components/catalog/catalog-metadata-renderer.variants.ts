import { cva } from 'class-variance-authority'

import type { CatalogMetadataTextEmphasis } from './catalog-metadata.types'

export const CATALOG_METADATA_WRAPPER_CLASSES = 'flex flex-col gap-1'

export const CATALOG_METADATA_LINE_CLASSES = 'min-w-0'

export const CATALOG_METADATA_TEXT_CLASSES = 'text-muted-foreground'

export const catalogMetadataTextPartVariants = cva('', {
  variants: {
    emphasis: {
      default: CATALOG_METADATA_TEXT_CLASSES,
      strong: 'font-body-emphasis text-foreground',
    } satisfies Record<CatalogMetadataTextEmphasis, string>,
  },
  defaultVariants: {
    emphasis: 'default',
  },
})
