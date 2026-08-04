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
  transformVisibleItems,
  initialSearchQuery = '',
  toolbarStateKey,
}: Pick<
  CatalogPickerSheetProps<TItem>,
  | 'items'
  | 'getSearchText'
  | 'getItemTab'
  | 'tabs'
  | 'defaultTabId'
  | 'hasStructuredFilters'
  | 'transformVisibleItems'
  | 'initialSearchQuery'
  | 'toolbarStateKey'
>) {
  const resolvedDefaultTabId = defaultTabId ?? tabs?.[0]?.id ?? ''
  const [searchQuery, setSearchQuery] = React.useState(initialSearchQuery)
  const [activeTabId, setActiveTabId] = React.useState(resolvedDefaultTabId)
  const [prevToolbarStateKey, setPrevToolbarStateKey] = React.useState(toolbarStateKey)

  if (toolbarStateKey !== undefined && toolbarStateKey !== prevToolbarStateKey) {
    setPrevToolbarStateKey(toolbarStateKey)
    setSearchQuery(initialSearchQuery)
    setActiveTabId(resolvedDefaultTabId)
  }

  // Browse context (search, tab) is preserved across close/reopen within a builder session.
  // Reset only via explicit Clear filters / Reset view or a future context-key change.

  const resetActiveTab = React.useCallback(() => {
    setActiveTabId(resolvedDefaultTabId)
  }, [resolvedDefaultTabId])

  const tabIds = React.useMemo(() => tabs?.map((tab) => tab.id) ?? [], [tabs])
  const tabCounts = React.useMemo(
    () => countPickerItemsByTab(items, tabIds, getItemTab),
    [getItemTab, items, tabIds],
  )

  const tabFilteredItems = React.useMemo(
    () => filterPickerItemsByTab(items, activeTabId, getItemTab),
    [activeTabId, getItemTab, items],
  )
  const visibleItems = React.useMemo(() => {
    if (transformVisibleItems) {
      return transformVisibleItems(tabFilteredItems, { searchQuery })
    }
    return rankPickerItems(tabFilteredItems, searchQuery, getSearchText)
  }, [getSearchText, searchQuery, tabFilteredItems, transformVisibleItems])

  const hasSearchOrFilters = searchQuery.trim().length > 0 || Boolean(hasStructuredFilters)
  const isScopedView = activeTabId.length > 0 && Boolean(tabs?.length)

  return {
    searchQuery,
    setSearchQuery,
    activeTabId,
    setActiveTabId,
    resetActiveTab,
    tabCounts,
    visibleItems,
    hasSearchOrFilters,
    isScopedView,
  }
}
