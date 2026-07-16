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

export function hasCatalogPickerResetViewCriteria(args: {
  structuredFilterCount: number
  searchQuery: string
  sortMode: string
  defaultSortMode: string
  activeTabId?: string
  defaultTabId?: string
}): boolean {
  if (args.searchQuery.trim().length > 0) return true
  if (args.structuredFilterCount > 0) return true
  if (args.sortMode !== args.defaultSortMode) return true
  if (
    args.activeTabId !== undefined &&
    args.defaultTabId !== undefined &&
    args.activeTabId !== args.defaultTabId
  ) {
    return true
  }
  return false
}
