/** Collapses a list to `first, second + n more` when longer than `visibleCount`. */
export function formatPreviewRailOverflowList(items: readonly string[], visibleCount = 2): string {
  if (items.length === 0) {
    return ''
  }

  if (items.length <= visibleCount) {
    return items.join(', ')
  }

  const visible = items.slice(0, visibleCount).join(', ')
  const remaining = items.length - visibleCount

  return `${visible} + ${remaining} more`
}
