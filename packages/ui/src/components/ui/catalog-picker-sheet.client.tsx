'use client'

import * as React from 'react'

import { InsetPanel } from './inset-panel.client'
import { Sheet } from './sheet.client'
import { Spinner } from './spinner'
import { CatalogToolbar } from './catalog-toolbar.client'
import { CatalogPickerAuxiliaryActionSlot } from './catalog-picker-auxiliary-action.client'
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
  catalogPickerSheetLoadingVariants,
  catalogPickerToolbarWithAuxiliaryActionVariants,
} from './catalog-picker-sheet.variants'
import { cn } from '../../lib/utils'
import {
  dialogPanelActionRowClasses,
  dialogPanelScrollRegionTopInsetClasses,
  dialogPanelSectionInsetXClasses,
} from './dialog-panel.variants'

export type {
  CatalogPickerSheetProps,
  CatalogPickerSheetActionsHelpers,
  CatalogPickerTab,
  CatalogPickerRowLayout,
  CatalogPickerAuxiliaryAction,
  CatalogPickerCollapsibleRowRenderArgs,
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

/** Matches sheet close `duration-150` so a reopen still defers after the exit slide. */
const CATALOG_PICKER_RESULTS_RESET_DELAY_MS = 150

function useCatalogPickerResultsReady(open: boolean): boolean {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      const resetTimer = window.setTimeout(() => {
        setReady(false)
      }, CATALOG_PICKER_RESULTS_RESET_DELAY_MS)
      return () => window.clearTimeout(resetTimer)
    }

    React.startTransition(() => {
      setReady(true)
    })
    return undefined
  }, [open])

  return ready
}

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

function shouldDeferCatalogPickerResults({
  open,
  pickerEnabled,
  hasBodyReplacement,
  loading,
  hasVisibleItems,
  resultsReady,
}: {
  open: boolean
  pickerEnabled: boolean
  hasBodyReplacement: boolean
  loading: boolean
  hasVisibleItems: boolean
  resultsReady: boolean
}): boolean {
  return (
    open && pickerEnabled && !hasBodyReplacement && !loading && hasVisibleItems && !resultsReady
  )
}

function resolveCatalogPickerSheetBodyContent({
  loading,
  deferResults,
  isEmpty,
  emptyState,
  emptyMessage,
  results,
}: {
  loading: boolean
  deferResults: boolean
  isEmpty: boolean
  emptyState?: React.ReactNode
  emptyMessage: string
  results: React.ReactNode
}): React.ReactNode {
  if (loading || deferResults) {
    return (
      <div className={catalogPickerSheetLoadingVariants()}>
        <Spinner size="lg" />
      </div>
    )
  }
  if (isEmpty) {
    return <CatalogPickerSheetEmpty emptyState={emptyState} message={emptyMessage} />
  }
  return results
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
    <InsetPanel borderStyle="dashed" size="md" align="center" className="py-8">
      <InsetPanel.PassiveMessage>{message}</InsetPanel.PassiveMessage>
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
  renderCollapsibleRow,
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
  auxiliaryAction,
  footer,
  bodyReplacement,
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
  rowBodyClassName,
  rowShellClassName,
  expandedItemId,
  onExpandedItemChange,
}: CatalogPickerSheetProps<TItem>) {
  const resultsReady = useCatalogPickerResultsReady(open)
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
    renderCollapsibleRow,
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
    expandedItemId,
    onExpandedItemChange,
  } as CatalogPickerSheetProps<TItem>

  const bodyContent = resolveCatalogPickerSheetBodyContent({
    loading,
    deferResults: shouldDeferCatalogPickerResults({
      open,
      pickerEnabled,
      hasBodyReplacement: bodyReplacement !== undefined,
      loading,
      hasVisibleItems: visibleItems.length > 0,
      resultsReady,
    }),
    isEmpty: visibleItems.length === 0,
    emptyState,
    emptyMessage,
    results: (
      <CatalogPickerSheetResults items={visibleItems} getItemKey={getItemKey} rowProps={rowProps} />
    ),
  })

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
      <Sheet.Content surface="background" size="lg">
        <Sheet.Header
          headline={title}
          description={description}
          headlineClassName={headlineClassName}
        >
          {headerExtra ? <div className="mt-4">{headerExtra}</div> : null}
        </Sheet.Header>

        {headerBelowDescription ? (
          <div
            className={cn(
              dialogPanelSectionInsetXClasses,
              dialogPanelScrollRegionTopInsetClasses,
              'pb-4',
            )}
          >
            {headerBelowDescription}
          </div>
        ) : null}

        {bodyReplacement !== undefined ? (
          <Sheet.Body className={catalogPickerSheetBodyVariants()}>{bodyReplacement}</Sheet.Body>
        ) : pickerEnabled ? (
          <>
            <CatalogToolbar
              className={catalogPickerToolbarWithAuxiliaryActionVariants({
                hasAuxiliaryAction: Boolean(auxiliaryAction),
              })}
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

            {auxiliaryAction ? <CatalogPickerAuxiliaryActionSlot action={auxiliaryAction} /> : null}

            <Sheet.Body className={catalogPickerSheetBodyVariants()}>{bodyContent}</Sheet.Body>
          </>
        ) : null}

        {footer ? (
          <Sheet.Footer>
            <div className={dialogPanelActionRowClasses}>{footer}</div>
          </Sheet.Footer>
        ) : null}
      </Sheet.Content>
    </Sheet.Root>
  )
}
