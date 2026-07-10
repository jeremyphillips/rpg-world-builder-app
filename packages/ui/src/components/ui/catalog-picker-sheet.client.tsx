'use client'

import * as React from 'react'

import { Sheet } from './sheet.client'
import { Spinner } from './spinner'
import { CatalogPickerSheetResults } from './catalog-picker-sheet-rows.client'
import { CatalogPickerSheetToolbar } from './catalog-picker-sheet-toolbar.client'
import { useCatalogPickerSheetState } from './catalog-picker-sheet.use.client'
import type { CatalogPickerSheetProps } from './catalog-picker-sheet.types'
import {
  catalogPickerSheetBodyVariants,
  catalogPickerSheetContentVariants,
  catalogPickerSheetEmptyVariants,
  catalogPickerSheetLoadingVariants,
} from './catalog-picker-sheet.variants'

export type { CatalogPickerSheetProps, CatalogPickerTab } from './catalog-picker-sheet.types'

const DEFAULT_SEARCH_PLACEHOLDER = 'Search catalog'
const DEFAULT_NO_RESULTS_MESSAGE = 'No items match your search.'
const DEFAULT_NO_ITEMS_MESSAGE = 'No items are available.'

function CatalogPickerSheetEmpty({
  emptyState,
  hasActiveFilters,
  noResultsMessage,
  noItemsMessage,
}: {
  emptyState?: React.ReactNode
  hasActiveFilters: boolean
  noResultsMessage: string
  noItemsMessage: string
}) {
  if (emptyState) return <>{emptyState}</>

  return (
    <div className={catalogPickerSheetEmptyVariants()} role="status">
      {hasActiveFilters ? noResultsMessage : noItemsMessage}
    </div>
  )
}

/**
 * Domain-agnostic catalog picker shell — Sheet layout, search, tabs, slots, and
 * expandable result rows. Domain wrappers supply item rendering and filters.
 */
export function CatalogPickerSheet<TItem>({
  open,
  onOpenChange,
  title,
  description,
  items,
  getItemKey,
  getSearchText,
  renderItem,
  renderItemHeader,
  renderItemSummary,
  renderItemActions,
  renderItemDetails,
  getItemToolbarLabel,
  tabs,
  defaultTabId,
  getItemTab,
  filters,
  headerExtra,
  footer,
  emptyState,
  loading = false,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  noResultsMessage = DEFAULT_NO_RESULTS_MESSAGE,
  noItemsMessage = DEFAULT_NO_ITEMS_MESSAGE,
}: CatalogPickerSheetProps<TItem>) {
  const {
    searchQuery,
    setSearchQuery,
    activeTabId,
    setActiveTabId,
    tabCounts,
    visibleItems,
    hasActiveFilters,
  } = useCatalogPickerSheetState({
    open,
    items,
    getSearchText,
    getItemTab,
    tabs,
    defaultTabId,
  })

  const rowProps = {
    renderItem,
    renderItemHeader,
    renderItemSummary,
    renderItemActions,
    renderItemDetails,
    getItemToolbarLabel,
  } as CatalogPickerSheetProps<TItem>

  const bodyContent = loading ? (
    <div className={catalogPickerSheetLoadingVariants()}>
      <Spinner size="lg" />
    </div>
  ) : visibleItems.length === 0 ? (
    <CatalogPickerSheetEmpty
      emptyState={emptyState}
      hasActiveFilters={hasActiveFilters}
      noResultsMessage={noResultsMessage}
      noItemsMessage={noItemsMessage}
    />
  ) : (
    <CatalogPickerSheetResults items={visibleItems} getItemKey={getItemKey} rowProps={rowProps} />
  )

  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content className={catalogPickerSheetContentVariants()}>
        <Sheet.Header headline={title} description={description}>
          {headerExtra ? <div className="mt-4">{headerExtra}</div> : null}
        </Sheet.Header>

        <CatalogPickerSheetToolbar
          title={title}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchPlaceholder={searchPlaceholder}
          tabs={tabs}
          activeTabId={activeTabId}
          onActiveTabIdChange={setActiveTabId}
          tabCounts={tabCounts}
          filters={filters}
        />

        <Sheet.Body className={catalogPickerSheetBodyVariants()}>{bodyContent}</Sheet.Body>

        {footer ? <Sheet.Footer>{footer}</Sheet.Footer> : null}
      </Sheet.Content>
    </Sheet.Root>
  )
}
