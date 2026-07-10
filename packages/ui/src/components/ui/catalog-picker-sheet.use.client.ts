import * as React from 'react'

import {
  countPickerItemsByTab,
  filterPickerItemsByTab,
  rankPickerItems,
} from './catalog-picker-sheet.lib'
import type { CatalogPickerSheetProps } from './catalog-picker-sheet.types'

export function useCatalogPickerSheetState<TItem>({
  items,
  getSearchText,
  getItemTab,
  tabs,
  defaultTabId,
  hasStructuredFilters = false,
}: Pick<
  CatalogPickerSheetProps<TItem>,
  'items' | 'getSearchText' | 'getItemTab' | 'tabs' | 'defaultTabId' | 'hasStructuredFilters'
>) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeTabId, setActiveTabId] = React.useState(() => defaultTabId ?? tabs?.[0]?.id ?? '')

  // Browse context (search, tab) is preserved across close/reopen within a builder session.
  // Reset only via explicit Clear filters or a future context-key change (character, method, budget).

  const tabIds = React.useMemo(() => tabs?.map((tab) => tab.id) ?? [], [tabs])
  const tabCounts = React.useMemo(
    () => countPickerItemsByTab(items, tabIds, getItemTab),
    [getItemTab, items, tabIds],
  )

  const tabFilteredItems = React.useMemo(
    () => filterPickerItemsByTab(items, activeTabId, getItemTab),
    [activeTabId, getItemTab, items],
  )
  const visibleItems = React.useMemo(
    () => rankPickerItems(tabFilteredItems, searchQuery, getSearchText),
    [getSearchText, searchQuery, tabFilteredItems],
  )

  const hasSearchOrFilters = searchQuery.trim().length > 0 || Boolean(hasStructuredFilters)
  const isScopedView = activeTabId.length > 0 && Boolean(tabs?.length)

  return {
    searchQuery,
    setSearchQuery,
    activeTabId,
    setActiveTabId,
    tabCounts,
    visibleItems,
    hasSearchOrFilters,
    isScopedView,
  }
}
