export type CollectionSummaryItem = {
  id: string
  label: string
  secondary?: string
  group?: string
  href?: string
}

export type CollectionSummaryCellProps = {
  items: CollectionSummaryItem[]
  singularLabel: string
  pluralLabel: string
  emptyLabel?: string
  maxVisibleItems?: number
  sortItems?: boolean
}
