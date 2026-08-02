export type CollectionSummaryItem = {
  id: string
  label: string
  secondary?: string
  group?: string
  href?: string
}

export type CollectionSummaryCellProps = {
  items: CollectionSummaryItem[]
  /** When set, overrides `items.length` for the count trigger and +N more math. */
  count?: number
  singularLabel: string
  pluralLabel: string
  emptyLabel?: string
  maxVisibleItems?: number
  sortItems?: boolean
}
