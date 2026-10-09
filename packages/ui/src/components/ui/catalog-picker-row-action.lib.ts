const PICKER_ACTION_FAILURE_FALLBACK = 'Action failed'

export type CatalogPickerRowActionPhase = 'pending' | 'remove' | 'add'

/** Single-word imperatives pass through. Empty and multi-word labels use the fallback. */
export function resolvePickerActionFailureStatus(actionLabel: string): string {
  if (/^[A-Za-z]+$/.test(actionLabel)) return `${actionLabel} failed`
  return PICKER_ACTION_FAILURE_FALLBACK
}

/** Row action precedence: pending → remove → add. */
export function resolveCatalogPickerRowActionPhase(input: {
  isPending?: boolean
  isSelected?: boolean
}): CatalogPickerRowActionPhase {
  if (input.isPending) return 'pending'
  if (input.isSelected) return 'remove'
  return 'add'
}
