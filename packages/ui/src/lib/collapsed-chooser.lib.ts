export type CollapsedChooserVisibilityInput = {
  value: string | null | undefined
  expanded: boolean
}

export function shouldShowChooserSummary({
  value,
  expanded,
}: CollapsedChooserVisibilityInput): boolean {
  return Boolean(value) && !expanded
}

export function resolveDefaultChooserExpanded(value: string | null | undefined): boolean {
  return !value
}
