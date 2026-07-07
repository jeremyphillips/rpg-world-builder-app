import type { ReactNode } from 'react'

export type CatalogPickerTab = {
  id: string
  label: string
  count?: number
}

export type CatalogPickerSheetProps<TItem> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  items: readonly TItem[]
  getItemKey: (item: TItem) => string
  getSearchText: (item: TItem) => string
  renderItem: (item: TItem) => ReactNode
  renderItemDetails?: (item: TItem) => ReactNode
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
