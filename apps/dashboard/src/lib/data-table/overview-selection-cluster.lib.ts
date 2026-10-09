export type ResolvePageSelectionActionLabelInput = {
  isAllPageRowsSelected: boolean
  pageSelectableCount: number
  remainingSelectionCapacity: number
}

/** Cap-aware page selection action label — "Select page", "Select N", or "Clear page". */
export function resolvePageSelectionActionLabel({
  isAllPageRowsSelected,
  pageSelectableCount,
  remainingSelectionCapacity,
}: ResolvePageSelectionActionLabelInput): string {
  if (isAllPageRowsSelected) return 'Clear page'

  const cappedCount = Math.min(pageSelectableCount, remainingSelectionCapacity)
  if (cappedCount > 0 && cappedCount < pageSelectableCount) {
    return `Select ${cappedCount}`
  }

  return 'Select page'
}

export function shouldShowPageSelectionAction(
  pageSelectableCount: number,
  isAllPageRowsSelected: boolean,
): boolean {
  return isAllPageRowsSelected || pageSelectableCount > 0
}
