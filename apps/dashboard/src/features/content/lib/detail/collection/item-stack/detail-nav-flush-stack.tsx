import type { ReactNode } from 'react'

import { contentDetailNavItemId } from '../../page/content-detail-nav-anchor-id'
import { ContentDetailSectionItem } from '../../page/content-detail-section'

import {
  DetailCollectionFlushItemStack,
  DetailCollectionFlushItemStackItem,
} from './detail-collection-flush-item-stack'

export type DetailNavFlushStackProps<T extends { id: string }> = {
  navPrefix: string
  items: readonly T[]
  getLabel: (item: T) => string
  navLabel?: (item: T) => string
  renderItem: (item: T) => ReactNode
}

/** Flush stack + per-item leaf nav registration — parent owns the section shell. */
export function DetailNavFlushStack<T extends { id: string }>({
  navPrefix,
  items,
  getLabel,
  navLabel,
  renderItem,
}: DetailNavFlushStackProps<T>) {
  return (
    <DetailCollectionFlushItemStack>
      {items.map((item) => (
        <DetailCollectionFlushItemStackItem key={item.id}>
          <ContentDetailSectionItem
            id={contentDetailNavItemId(navPrefix, item.id)}
            label={getLabel(item)}
            navLabel={navLabel?.(item)}
          >
            {renderItem(item)}
          </ContentDetailSectionItem>
        </DetailCollectionFlushItemStackItem>
      ))}
    </DetailCollectionFlushItemStack>
  )
}
