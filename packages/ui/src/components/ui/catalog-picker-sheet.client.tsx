'use client'

import * as React from 'react'

import { InsetPanel } from './inset-panel.client'
import { Sheet } from './sheet.client'
import { Spinner } from './spinner'
import { CatalogToolbar } from './catalog-toolbar.client'
import { CatalogPickerSheetResults } from './catalog-picker-sheet-rows.client'
import {
  resolveCatalogPickerSheetFilterRow,
  resolveCatalogPickerSheetRenderedActions,
  resolveCatalogPickerSheetToolbarTabs,
} from './catalog-picker-sheet-toolbar.lib'
import { useCatalogPickerSheetState } from './catalog-picker-sheet.use.client'
import type { CatalogPickerSheetProps } from './catalog-picker-sheet.types'
import {
  catalogPickerSheetBodyVariants,
  catalogPickerSheetContentVariants,
  catalogPickerSheetLoadingVariants,
} from './catalog-picker-sheet.variants'

export type {
  CatalogPickerSheetProps,
  CatalogPickerSheetActionsHelpers,
  CatalogPickerTab,
  CatalogPickerRowLayout,
} from './catalog-picker-sheet.types'
export type {
  CatalogToolbarProps,
  CatalogToolbarSearch,
  CatalogToolbarTab,
  CatalogToolbarTabs,
} from './catalog-toolbar.types'

const DEFAULT_SEARCH_PLACEHOLDER = 'Search catalog'
const DEFAULT_NO_RESULTS_MESSAGE = 'No items match your search.'
const DEFAULT_NO_SCOPED_ITEMS_MESSAGE = 'No items match this view.'
const DEFAULT_NO_ITEMS_MESSAGE = 'No items are available.'

function resolveEmptyMessage({
  hasSearchOrFilters,
  isScopedView,
  noResultsMessage,
  noScopedItemsMessage,
  noItemsMessage,
}: {
  hasSearchOrFilters: boolean
  isScopedView: boolean
  noResultsMessage: string
  noScopedItemsMessage: string
  noItemsMessage: string
}): string {
  if (hasSearchOrFilters) return noResultsMessage
  if (isScopedView) return noScopedItemsMessage
  return noItemsMessage
}

function CatalogPickerSheetEmpty({
  emptyState,
  message,
}: {
  emptyState?: React.ReactNode
  message: string
}) {
  if (emptyState) return <>{emptyState}</>

  return (
    <InsetPanel
      borderStyle="dashed"
      surface={{}}
      size="md"
      align="center"
      className="py-8"
      role="status"
    >
      <InsetPanel.Text>{message}</InsetPanel.Text>
    </InsetPanel>
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
  headlineClassName,
  items,
  getItemKey,
  getSearchText,
  renderItemHeader,
  renderItemSummary,
  renderItemActions,
  renderItemDetails,
  getItemToolbarLabel,
  tabs,
  defaultTabId,
  getItemTab,
  recommendationsEnabled = false,
  recommendationTabsPosition = 'before-search',
  headerBelowDescription,
  primaryControls,
  filterRow,
  actions,
  initialSearchQuery,
  toolbarStateKey,
  transformVisibleItems,
  hasStructuredFilters = false,
  headerExtra,
  footer,
  emptyState,
  loading = false,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  searchDisabled = false,
  pickerEnabled = true,
  noResultsMessage = DEFAULT_NO_RESULTS_MESSAGE,
  noScopedItemsMessage = DEFAULT_NO_SCOPED_ITEMS_MESSAGE,
  noItemsMessage = DEFAULT_NO_ITEMS_MESSAGE,
  rowPreset,
  rowLayout,
  rowSurface,
  toolbarCompact,
  sheetContentClassName,
  sheetBodyClassName,
  rowBodyClassName,
  rowShellClassName,
}: CatalogPickerSheetProps<TItem>) {
  const {
    searchQuery,
    setSearchQuery,
    activeTabId,
    setActiveTabId,
    resetActiveTab,
    tabCounts,
    visibleItems,
    hasSearchOrFilters,
    isScopedView,
  } = useCatalogPickerSheetState({
    items,
    getSearchText,
    getItemTab: recommendationsEnabled ? getItemTab : undefined,
    tabs: recommendationsEnabled ? tabs : undefined,
    defaultTabId,
    hasStructuredFilters,
    transformVisibleItems,
    initialSearchQuery,
    toolbarStateKey,
  })

  const emptyMessage = resolveEmptyMessage({
    hasSearchOrFilters,
    isScopedView,
    noResultsMessage,
    noScopedItemsMessage,
    noItemsMessage,
  })

  const rowProps = {
    renderItemHeader,
    renderItemSummary,
    renderItemActions,
    renderItemDetails,
    getItemToolbarLabel,
    rowPreset,
    rowLayout,
    rowSurface,
    toolbarCompact,
    rowBodyClassName,
    rowShellClassName,
  } as CatalogPickerSheetProps<TItem>

  const bodyContent = loading ? (
    <div className={catalogPickerSheetLoadingVariants()}>
      <Spinner size="lg" />
    </div>
  ) : visibleItems.length === 0 ? (
    <CatalogPickerSheetEmpty emptyState={emptyState} message={emptyMessage} />
  ) : (
    <CatalogPickerSheetResults items={visibleItems} getItemKey={getItemKey} rowProps={rowProps} />
  )

  const actionHelpers = React.useMemo(
    () => ({
      searchQuery,
      activeTabId,
      resetSearchQuery: () => setSearchQuery(''),
      resetActiveTab,
    }),
    [activeTabId, resetActiveTab, searchQuery, setSearchQuery],
  )

  const renderedActions = resolveCatalogPickerSheetRenderedActions(actions, actionHelpers)
  const renderedFilterRow = resolveCatalogPickerSheetFilterRow(filterRow, actionHelpers)
  const toolbarTabs = resolveCatalogPickerSheetToolbarTabs({
    title,
    tabs,
    recommendationsEnabled,
    recommendationTabsPosition,
    activeTabId,
    onActiveTabIdChange: setActiveTabId,
    tabCounts,
  })

  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content
        className={catalogPickerSheetContentVariants({ className: sheetContentClassName })}
      >
        <Sheet.Header
          headline={title}
          description={description}
          headlineClassName={headlineClassName}
        >
          {headerExtra ? <div className="mt-4">{headerExtra}</div> : null}
        </Sheet.Header>

        {headerBelowDescription ? <div className="px-6 pb-4">{headerBelowDescription}</div> : null}

        {pickerEnabled ? (
          <>
            <CatalogToolbar
              search={{
                query: searchQuery,
                onQueryChange: setSearchQuery,
                placeholder: searchPlaceholder,
                ariaLabel: searchPlaceholder,
                disabled: searchDisabled,
              }}
              tabs={toolbarTabs}
              primaryControls={primaryControls}
              filterRow={renderedFilterRow}
              actions={renderedActions}
            />

            <Sheet.Body
              className={catalogPickerSheetBodyVariants({
                hasFooter: Boolean(footer),
                className: sheetBodyClassName,
              })}
            >
              {bodyContent}
            </Sheet.Body>
          </>
        ) : null}

        {footer ? <Sheet.Footer>{footer}</Sheet.Footer> : null}
      </Sheet.Content>
    </Sheet.Root>
  )
}
