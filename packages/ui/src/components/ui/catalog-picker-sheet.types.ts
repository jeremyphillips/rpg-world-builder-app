import type { ReactNode } from 'react'

export type CatalogPickerTab = {
  id: string
  label: string
  count?: number
}

/** Coordinated toolbar actions (e.g. Clear filters) — not for implementing search inside filter components. */
export type CatalogPickerSheetFilterContext = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  clearSearchQuery: () => void
}

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
  filters?: ReactNode | ((context: CatalogPickerSheetFilterContext) => ReactNode)
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
