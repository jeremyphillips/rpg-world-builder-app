'use client'

import * as React from 'react'
import { ChevronDown, Search } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Input } from './input.client'
import { Sheet } from './sheet.client'
import { Spinner } from './spinner'
import { Tabs, TabsList, TabsTrigger } from './tabs.client'
import { Text } from './text'
import {
  countPickerItemsByTab,
  filterPickerItemsByTab,
  rankPickerItems,
} from './catalog-picker-sheet.lib'
import type { CatalogPickerSheetProps } from './catalog-picker-sheet.types'
import {
  catalogPickerSheetBodyVariants,
  catalogPickerSheetContentVariants,
  catalogPickerSheetEmptyVariants,
  catalogPickerSheetItemDetailsVariants,
  catalogPickerSheetItemMainVariants,
  catalogPickerSheetItemVariants,
  catalogPickerSheetListVariants,
  catalogPickerSheetLoadingVariants,
  catalogPickerSheetSearchRowVariants,
  catalogPickerSheetToolbarVariants,
} from './catalog-picker-sheet.variants'

export type { CatalogPickerSheetProps, CatalogPickerTab } from './catalog-picker-sheet.types'

const DEFAULT_SEARCH_PLACEHOLDER = 'Search catalog'
const DEFAULT_NO_RESULTS_MESSAGE = 'No items match your search.'
const DEFAULT_NO_ITEMS_MESSAGE = 'No items are available.'

function CatalogPickerItemRow<TItem>({
  item,
  itemKey,
  renderItem,
  renderItemDetails,
}: {
  item: TItem
  itemKey: string
  renderItem: (item: TItem) => React.ReactNode
  renderItemDetails?: (item: TItem) => React.ReactNode
}) {
  const detailsId = `${itemKey}-details`
  const [expanded, setExpanded] = React.useState(false)
  const hasDetails = Boolean(renderItemDetails)

  return (
    <article className={catalogPickerSheetItemVariants()} data-picker-item-key={itemKey}>
      <div className={catalogPickerSheetItemMainVariants()}>
        <div className="min-w-0 flex-1">{renderItem(item)}</div>
        {hasDetails ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-expanded={expanded}
            aria-controls={detailsId}
            aria-label={expanded ? 'Hide details' : 'Show details'}
            onClick={() => setExpanded((current) => !current)}
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-200',
                expanded ? 'rotate-180' : undefined,
              )}
              aria-hidden
            />
          </Button>
        ) : null}
      </div>
      {hasDetails && expanded ? (
        <div id={detailsId} className={catalogPickerSheetItemDetailsVariants()}>
          {renderItemDetails?.(item)}
        </div>
      ) : null}
    </article>
  )
}

function CatalogPickerResults<TItem>({
  items,
  getItemKey,
  renderItem,
  renderItemDetails,
  emptyState,
  noResultsMessage,
  noItemsMessage,
  hasActiveFilters,
}: {
  items: readonly TItem[]
  getItemKey: (item: TItem) => string
  renderItem: (item: TItem) => React.ReactNode
  renderItemDetails?: (item: TItem) => React.ReactNode
  emptyState?: React.ReactNode
  noResultsMessage: string
  noItemsMessage: string
  hasActiveFilters: boolean
}) {
  if (items.length === 0) {
    if (emptyState) return <>{emptyState}</>
    return (
      <div className={catalogPickerSheetEmptyVariants()} role="status">
        {hasActiveFilters ? noResultsMessage : noItemsMessage}
      </div>
    )
  }

  return (
    <div className={catalogPickerSheetListVariants()} role="list">
      {items.map((item) => {
        const itemKey = getItemKey(item)
        return (
          <div key={itemKey} role="listitem">
            <CatalogPickerItemRow
              item={item}
              itemKey={itemKey}
              renderItem={renderItem}
              renderItemDetails={renderItemDetails}
            />
          </div>
        )
      })}
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
  renderItemDetails,
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

  const results = (
    <CatalogPickerResults
      items={visibleItems}
      getItemKey={getItemKey}
      renderItem={renderItem}
      renderItemDetails={renderItemDetails}
      emptyState={emptyState}
      noResultsMessage={noResultsMessage}
      noItemsMessage={noItemsMessage}
      hasActiveFilters={hasActiveFilters}
    />
  )

  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content className={catalogPickerSheetContentVariants()}>
        <Sheet.Header headline={title} description={description}>
          {headerExtra ? <div className="mt-4">{headerExtra}</div> : null}
        </Sheet.Header>

        <div className={catalogPickerSheetToolbarVariants()}>
          <div className={catalogPickerSheetSearchRowVariants()}>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="pl-9"
            />
          </div>

          {tabs && tabs.length > 0 ? (
            <Tabs value={activeTabId} onValueChange={setActiveTabId}>
              <TabsList aria-label={`${title} views`}>
                {tabs.map((tab) => {
                  const count = tab.count ?? tabCounts[tab.id] ?? 0
                  return (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                      <Text as="span" variant="muted" className="tabular-nums">
                        ({count})
                      </Text>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          ) : null}

          {filters ? <div>{filters}</div> : null}
        </div>

        <Sheet.Body className={catalogPickerSheetBodyVariants()}>
          {loading ? (
            <div className={catalogPickerSheetLoadingVariants()}>
              <Spinner size="lg" />
            </div>
          ) : (
            results
          )}
        </Sheet.Body>

        {footer ? <Sheet.Footer>{footer}</Sheet.Footer> : null}
      </Sheet.Content>
    </Sheet.Root>
  )
}
