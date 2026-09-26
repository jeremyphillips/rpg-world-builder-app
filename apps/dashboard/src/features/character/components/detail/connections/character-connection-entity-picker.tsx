import * as React from 'react'

import { Input, Text } from '@rpg/ui'
import { CatalogEntitySurfaceRow, type EntitySurfaceConfig } from '@/features/content'

export type ConnectionEntityPickerItem<TItem> = {
  item: TItem
  key: string
  searchText: string
  surface: EntitySurfaceConfig
}

export type ConnectionEntityPickerProps<TItem> = {
  items: readonly ConnectionEntityPickerItem<TItem>[]
  searchPlaceholder: string
  noResultsMessage: string
  noItemsMessage: string
  onSelect: (item: TItem) => void
}

export function ConnectionEntityPicker<TItem>({
  items,
  searchPlaceholder,
  noResultsMessage,
  noItemsMessage,
  onSelect,
}: ConnectionEntityPickerProps<TItem>) {
  const [query, setQuery] = React.useState('')
  const normalizedQuery = query.trim().toLowerCase()

  const filteredItems = React.useMemo(() => {
    if (!normalizedQuery) return items
    return items.filter((entry) => entry.searchText.toLowerCase().includes(normalizedQuery))
  }, [items, normalizedQuery])

  if (items.length === 0) {
    return <Text variant="muted">{noItemsMessage}</Text>
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
      />
      {filteredItems.length === 0 ? (
        <Text variant="muted">{noResultsMessage}</Text>
      ) : (
        <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {filteredItems.map((entry) => (
            <li key={entry.key}>
              <CatalogEntitySurfaceRow
                toolbarLabel={entry.surface.identity.heading}
                domIds={{
                  itemId: entry.key,
                  titleId: `${entry.key}-title`,
                  bodyId: `${entry.key}-body`,
                }}
                collapsible={false}
                collapsed={false}
                onToggleCollapse={() => undefined}
                surface={{
                  identity: entry.surface.identity,
                  inlineAction: entry.surface.inlineAction
                    ? {
                        ...entry.surface.inlineAction,
                        onClick: () => onSelect(entry.item),
                      }
                    : undefined,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
