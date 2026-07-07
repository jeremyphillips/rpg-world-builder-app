import { normalizeSearchQuery, rankItems, type SearchableItem } from '../../lib/search'

export type CatalogPickerSearchableItem<TItem> = SearchableItem & {
  item: TItem
}

/** Ranks picker rows by a plain-text search accessor. */
export function rankPickerItems<TItem>(
  items: readonly TItem[],
  query: string,
  getSearchText: (item: TItem) => string,
): TItem[] {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return [...items]

  const searchable = items.map((item) => ({
    item,
    fields: [{ text: getSearchText(item), weight: 1, role: 'label' as const }],
  }))

  return rankItems(searchable, query).map((entry) => entry.item)
}

/** Keeps rows whose tab id matches the active tab when tab routing is configured. */
export function filterPickerItemsByTab<TItem>(
  items: readonly TItem[],
  activeTabId: string | undefined,
  getItemTab: ((item: TItem) => string) | undefined,
): TItem[] {
  if (!activeTabId || !getItemTab) return [...items]
  return items.filter((item) => getItemTab(item) === activeTabId)
}

/** Counts rows per tab id for optional tab badges. */
export function countPickerItemsByTab<TItem>(
  items: readonly TItem[],
  tabIds: readonly string[],
  getItemTab: ((item: TItem) => string) | undefined,
): Record<string, number> {
  if (!getItemTab) {
    return Object.fromEntries(tabIds.map((tabId) => [tabId, items.length]))
  }

  return Object.fromEntries(
    tabIds.map((tabId) => [tabId, items.filter((item) => getItemTab(item) === tabId).length]),
  )
}
