import { resultCountSizerLabels } from '@/lib/data-table/format-result-count.lib'

/** Total clearable criteria — structured filters + non-empty search. */
export function countCatalogPickerClearableCriteria(args: {
  structuredFilterCount: number
  searchQuery: string
}): number {
  return args.structuredFilterCount + Number(args.searchQuery.trim().length > 0)
}

export function hasCatalogPickerClearableCriteria(count: number): boolean {
  return count > 0
}

export function hasCatalogPickerNarrowingCriteria(args: {
  structuredFilterCount: number
  searchQuery: string
  activeTabId?: string
  defaultTabId?: string
}): boolean {
  if (args.searchQuery.trim().length > 0) return true
  if (args.structuredFilterCount > 0) return true
  if (
    args.activeTabId !== undefined &&
    args.defaultTabId !== undefined &&
    args.activeTabId !== args.defaultTabId
  ) {
    return true
  }
  return false
}

export function hasCatalogPickerResetViewCriteria(args: {
  structuredFilterCount: number
  searchQuery: string
  /** Omit both when the toolbar has no sort. Do not pass the default mode as a stand-in. */
  sortMode?: string
  defaultSortMode?: string
  activeTabId?: string
  defaultTabId?: string
}): boolean {
  if (hasCatalogPickerNarrowingCriteria(args)) return true
  return (
    args.sortMode !== undefined &&
    args.defaultSortMode !== undefined &&
    args.sortMode !== args.defaultSortMode
  )
}

export function resolveCatalogPickerResultSummary(args: { visible: number; total: number }): {
  summaryVisibleCount: number
  summaryReserveLabels: readonly string[]
} {
  return {
    summaryVisibleCount: args.visible,
    summaryReserveLabels: resultCountSizerLabels(args.total),
  }
}
