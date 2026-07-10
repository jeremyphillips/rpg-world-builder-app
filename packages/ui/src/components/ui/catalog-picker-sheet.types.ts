import type { ReactNode } from 'react'

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

/** @deprecated Use {@link CatalogPickerSheetToolbarContext}. */
export type CatalogPickerSheetFilterContext = CatalogPickerSheetToolbarContext

type CatalogPickerSheetBaseProps<TItem> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  items: readonly TItem[]
  getItemKey: (item: TItem) => string
  getSearchText: (item: TItem) => string
  tabs?: readonly CatalogPickerTab[]
  defaultTabId?: string
  getItemTab?: (item: TItem) => string
  toolbarControls?: ReactNode | ((context: CatalogPickerSheetToolbarContext) => ReactNode)
  /** Trailing actions rendered inline with the tab row (e.g. Reset view). */
  tabToolbarActions?: ReactNode | ((context: CatalogPickerSheetToolbarContext) => ReactNode)
  /** @deprecated Use {@link CatalogPickerSheetBaseProps.toolbarControls}. */
  filters?: ReactNode | ((context: CatalogPickerSheetToolbarContext) => ReactNode)
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
}

/** Legacy row API — right-side chevron expander; used until spell/proficiency pickers migrate. */
export type CatalogPickerSheetLegacyRowProps<TItem> = {
  renderItem: (item: TItem) => ReactNode
  renderItemDetails?: (item: TItem) => ReactNode
  renderItemHeader?: never
  renderItemSummary?: never
  renderItemActions?: never
  getItemToolbarLabel?: never
}

/** Preferred row API — `CollapsibleListItem` with leading caret and actions rail. */
export type CatalogPickerSheetCollapsibleRowProps<TItem> = {
  renderItemHeader: (item: TItem) => ReactNode
  renderItemSummary?: (item: TItem) => ReactNode
  renderItemActions?: (item: TItem) => ReactNode
  renderItemDetails?: (item: TItem) => ReactNode
  /** Collapse button label suffix; defaults to `getItemKey`. */
  getItemToolbarLabel?: (item: TItem) => string
  renderItem?: never
}

export type CatalogPickerSheetProps<TItem> = CatalogPickerSheetBaseProps<TItem> &
  (CatalogPickerSheetLegacyRowProps<TItem> | CatalogPickerSheetCollapsibleRowProps<TItem>)

export function usesCatalogPickerCollapsibleRows<TItem>(
  props: Pick<CatalogPickerSheetProps<TItem>, 'renderItem' | 'renderItemHeader'>,
): props is CatalogPickerSheetCollapsibleRowProps<TItem> {
  return typeof props.renderItemHeader === 'function'
}
