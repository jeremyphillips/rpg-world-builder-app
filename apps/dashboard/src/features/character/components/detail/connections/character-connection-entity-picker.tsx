import * as React from 'react'

import { isEmptySearchQuery, normalizeSearchQuery } from '@rpg/search'
import { SearchBar, rankLegacySearchItems, Text } from '@rpg/ui'

import { scoreAndFilterPickerItems } from '../../picker/sort/catalog-picker-sort.lib'
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
  /** When set, this picker scores each row instead of ranking the flat search text. */
  scoreItem?: (item: ConnectionEntityPickerItem<TItem>, searchQuery: string) => number
  filterControls?: React.ReactNode
}

export function ConnectionEntityPicker<TItem>({
  items,
  searchPlaceholder,
  noResultsMessage,
  noItemsMessage,
  onSelect,
  scoreItem,
  filterControls,
}: ConnectionEntityPickerProps<TItem>) {
  const [query, setQuery] = React.useState('')

  const filteredItems = React.useMemo(() => {
    if (!scoreItem) {
      return rankLegacySearchItems(
        items.map((entry) => ({
          entry,
          fields: [{ text: entry.searchText, weight: 1, role: 'label' as const }],
        })),
        query,
        'forgiving',
      ).map((row) => row.entry)
    }

    const hasQuery = !isEmptySearchQuery(normalizeSearchQuery(query))
    return scoreAndFilterPickerItems(items, { searchQuery: query, scoreItem })
      .toSorted((left, right) => (hasQuery ? right.searchScore - left.searchScore : 0))
      .map((row) => row.item)
  }, [items, query, scoreItem])

  if (items.length === 0) {
    return <Text variant="muted">{noItemsMessage}</Text>
  }

  return (
    <div className="flex flex-col gap-3">
      <SearchBar
        id="connection-entity-picker-search"
        value={query}
        onValueChange={setQuery}
        placeholder={searchPlaceholder}
        ariaLabel={searchPlaceholder}
      />
      {filterControls}
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
