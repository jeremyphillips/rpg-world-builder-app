export const LOCATION_UNCONTAINED_LABEL = 'Not contained within another location.' as const

export const LOCATION_PARENT_REPLACEMENT_DRAWER = {
  changeTitle: 'Change parent location',
  setTitle: 'Set parent location',
  changeSubmit: 'Change parent location',
  setSubmit: 'Set parent location',
  newHelper: 'Choose a valid parent location.',
  searchPlaceholder: 'Search locations…',
  noResultsMessage: 'No matches for this search.',
  noItemsMessage: 'No valid parent locations are available.',
} as const

export function resolveLocationParentReplacementDrawerTitle(mode: 'change' | 'set'): string {
  return mode === 'change'
    ? LOCATION_PARENT_REPLACEMENT_DRAWER.changeTitle
    : LOCATION_PARENT_REPLACEMENT_DRAWER.setTitle
}

export function resolveLocationParentReplacementDrawerSubmitLabel(mode: 'change' | 'set'): string {
  return mode === 'change'
    ? LOCATION_PARENT_REPLACEMENT_DRAWER.changeSubmit
    : LOCATION_PARENT_REPLACEMENT_DRAWER.setSubmit
}
