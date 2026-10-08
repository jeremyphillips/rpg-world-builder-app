export type CatalogPickerRowActionPhase = 'pending' | 'remove' | 'add'

/** Row action precedence: pending → remove → add. */
export function resolveCatalogPickerRowActionPhase(input: {
  isPending?: boolean
  isSelected?: boolean
}): CatalogPickerRowActionPhase {
  if (input.isPending) return 'pending'
  if (input.isSelected) return 'remove'
  return 'add'
}
