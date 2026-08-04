export type CatalogPickerRowActionPhase = 'pending' | 'success' | 'remove' | 'add'

/** Row action precedence: pending → success → remove → add. */
export function resolveCatalogPickerRowActionPhase(input: {
  isPending?: boolean
  isSuccess?: boolean
  isSelected?: boolean
}): CatalogPickerRowActionPhase {
  if (input.isPending) return 'pending'
  if (input.isSuccess) return 'success'
  if (input.isSelected) return 'remove'
  return 'add'
}
