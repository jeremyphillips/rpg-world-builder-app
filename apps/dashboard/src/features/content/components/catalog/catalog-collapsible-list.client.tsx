'use client'

import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { catalogCollapsibleListClasses } from './catalog-collapsible-list.variants'

export type CatalogCollapsibleListProps<TCard> = {
  items: readonly TCard[]
  getItemId: (item: TCard) => string
  renderItem: (item: TCard) => ReactNode
  className?: string
}

/** Semantic catalog list wrapper — owns `<ul>/<li>` layout, not domain rendering. */
export function CatalogCollapsibleList<TCard>({
  items,
  getItemId,
  renderItem,
  className,
}: CatalogCollapsibleListProps<TCard>) {
  return (
    <ul className={cn(catalogCollapsibleListClasses, className)}>
      {items.map((item) => (
        <li key={getItemId(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
