import type { ReactNode } from 'react'

import type { CollapsibleListItemShellTone } from './collapsible-list-item/collapsible-list-item-shell.client'

export type CatalogPickerTab = {
  id: string
  label: string
  count?: number
}

/** Coordinated toolbar actions (e.g. clear search, reset tab) — not for implementing search inside toolbar controls. */
export type CatalogPickerSheetToolbarContext = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  clearSearchQuery: () => void
  activeTabId: string
  resetActiveTab: () => void
}
export type CatalogPickerSheetProps<TItem> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** Merged onto the sheet headline — defaults to card title (19px). */
  headlineClassName?: string
  items: readonly TItem[]
  getItemKey: (item: TItem) => string
  getSearchText: (item: TItem) => string
  renderItemHeader: (item: TItem) => ReactNode
  renderItemSummary?: (item: TItem) => ReactNode
  renderItemActions?: (item: TItem) => ReactNode
  renderItemDetails?: (item: TItem) => ReactNode
  /** Collapse button label suffix; defaults to `getItemKey`. */
  getItemToolbarLabel?: (item: TItem) => string
  tabs?: readonly CatalogPickerTab[]
  defaultTabId?: string
  getItemTab?: (item: TItem) => string
  toolbarControls?: ReactNode | ((context: CatalogPickerSheetToolbarContext) => ReactNode)
  /** Trailing actions rendered inline with the tab row (e.g. Reset view). */
  tabToolbarActions?: ReactNode | ((context: CatalogPickerSheetToolbarContext) => ReactNode)
  transformVisibleItems?: (
    items: readonly TItem[],
    context: { searchQuery: string },
  ) => readonly TItem[]
  /** Domain-structured filters (category, affordability, etc.) — excludes search and tabs. */
  hasStructuredFilters?: boolean
  headerExtra?: ReactNode
  footer?: ReactNode
  emptyState?: ReactNode
  loading?: boolean
  searchPlaceholder?: string
  noResultsMessage?: string
  noScopedItemsMessage?: string
  noItemsMessage?: string
  /** Collapsible row shell tone — defaults to `main`; equipment picker uses `catalog`. */
  rowTone?: CollapsibleListItemShellTone
  /** Top-align caret/grip with the first header line for multi-line headers. */
  toolbarCompact?: boolean
  /** Optional class merged onto the sheet content panel. */
  sheetContentClassName?: string
  /** Optional class merged onto the scrollable sheet body. */
  sheetBodyClassName?: string
  /** Optional class merged onto each collapsible row expanded body. */
  rowBodyClassName?: string
  /** Optional class merged onto each collapsible row shell (`role="group"`). */
  rowShellClassName?: string
}
