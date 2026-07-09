import * as React from 'react'

import {
  countPickerItemsByTab,
  filterPickerItemsByTab,
  rankPickerItems,
} from './catalog-picker-sheet.lib'
import type { CatalogPickerSheetProps } from './catalog-picker-sheet.types'

export function useCatalogPickerSheetState<TItem>({
  open,
  items,
  getSearchText,
  getItemTab,
  tabs,
  defaultTabId,
}: Pick<
  CatalogPickerSheetProps<TItem>,
  'open' | 'items' | 'getSearchText' | 'getItemTab' | 'tabs' | 'defaultTabId'
>) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeTabId, setActiveTabId] = React.useState(() => defaultTabId ?? tabs?.[0]?.id ?? '')

  React.useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setActiveTabId(defaultTabId ?? tabs?.[0]?.id ?? '')
    }
  }, [defaultTabId, open, tabs])

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
  const hasActiveFilters = searchQuery.trim().length > 0 || Boolean(tabs?.length)

  return {
    searchQuery,
    setSearchQuery,
    activeTabId,
    setActiveTabId,
    tabCounts,
    visibleItems,
    hasActiveFilters,
  }
}
