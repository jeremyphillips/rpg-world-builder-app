/** Minimal row state shared by spell and proficiency picker items from contracts resolvers. */
export type CatalogPickerSelectableRowState = {
  isAlreadySelected: boolean
  canSelect: boolean
  disabledReasons: readonly string[]
}

export function isCatalogPickerRowDimmed(state: CatalogPickerSelectableRowState): boolean {
  return !state.isAlreadySelected && !state.canSelect
}

export function getCatalogPickerDisabledNote(
  state: CatalogPickerSelectableRowState,
): string | undefined {
  if (state.canSelect || state.isAlreadySelected) return undefined
  return state.disabledReasons[0]
}
