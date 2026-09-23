import * as React from 'react'

import { Button, Input, Text } from '@rpg/ui'
import { CatalogEntityRow } from '@/features/content'

export type ConnectionEntityPickerItem<TItem> = {
  item: TItem
  key: string
  heading: string
  description?: string
  searchText: string
  disabled?: boolean
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
              <CatalogEntityRow
                toolbarLabel={entry.heading}
                domIds={{
                  itemId: entry.key,
                  titleId: `${entry.key}-title`,
                  bodyId: `${entry.key}-body`,
                }}
                collapsible={false}
                collapsed={false}
                onToggleCollapse={() => undefined}
                entity={{
                  heading: entry.heading,
                  description: entry.description,
                }}
                trailing={{
                  kind: 'action',
                  content: (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={entry.disabled}
                      onClick={() => onSelect(entry.item)}
                    >
                      Select
                    </Button>
                  ),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
