import type { ReactNode } from 'react'

export type CatalogPickerTab = {
  id: string
  label: string
  count?: number
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
  filters?: ReactNode
  headerExtra?: ReactNode
  footer?: ReactNode
  emptyState?: ReactNode
  loading?: boolean
  searchPlaceholder?: string
  noResultsMessage?: string
  noItemsMessage?: string
}

/** Legacy row API — right-side chevron expander; used until spell/proficiency pickers migrate. */
export type CatalogPickerSheetLegacyRowProps<TItem> = {
  renderItem: (item: TItem) => ReactNode
  renderItemDetails?: (item: TItem) => ReactNode
  renderItemHeader?: never
  renderItemActions?: never
  getItemToolbarLabel?: never
}

/** Preferred row API — `CollapsibleListItem` with leading caret and actions rail. */
export type CatalogPickerSheetCollapsibleRowProps<TItem> = {
  renderItemHeader: (item: TItem) => ReactNode
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
