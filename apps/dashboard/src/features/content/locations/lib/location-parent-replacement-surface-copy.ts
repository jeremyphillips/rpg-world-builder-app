export const LOCATION_UNCONTAINED_LABEL = 'Not contained within another location.' as const

export const LOCATION_PARENT_MOVE_ACTION_LABELS = {
  viewLocation: 'View location',
  moveLocation: 'Move location',
} as const

export const LOCATION_PARENT_REPLACEMENT_DRAWER = {
  changeTitle: 'Change parent location',
  setTitle: 'Set parent location',
  changeSubmit: 'Change parent location',
  setSubmit: 'Set parent location',
  moveSubmit: 'Move location',
  searchPlaceholder: 'Search locations…',
  noResultsMessage: 'No matches for this search.',
  noItemsMessage: 'No valid parent locations are available.',
  mismatchStatus:
    'This location’s parent no longer matches this page. Refresh the locations list and try again.',
  mismatchToast: 'Contained locations are out of date. Refreshing…',
} as const

export type LocationParentReplacementDrawerSurface = 'child' | 'move'

export function resolveLocationParentReplacementDrawerTitle(input: {
  surface: LocationParentReplacementDrawerSurface
  mode: 'change' | 'set'
  subjectName: string
}): string {
  if (input.surface === 'move') {
    return `Move ${input.subjectName}`
  }

  return input.mode === 'change'
    ? LOCATION_PARENT_REPLACEMENT_DRAWER.changeTitle
    : LOCATION_PARENT_REPLACEMENT_DRAWER.setTitle
}

export function resolveLocationParentReplacementDrawerSubmitLabel(input: {
  surface: LocationParentReplacementDrawerSurface
  mode: 'change' | 'set'
}): string {
  if (input.surface === 'move') {
    return LOCATION_PARENT_REPLACEMENT_DRAWER.moveSubmit
  }

  return input.mode === 'change'
    ? LOCATION_PARENT_REPLACEMENT_DRAWER.changeSubmit
    : LOCATION_PARENT_REPLACEMENT_DRAWER.setSubmit
}

export function resolveLocationParentReplacementDrawerNewHelper(input: {
  surface: LocationParentReplacementDrawerSurface
  mode: 'change' | 'set'
  subjectName: string
}): string {
  if (input.surface === 'move') {
    return `Choose where to move ${input.subjectName}.`
  }

  if (input.mode === 'change') {
    return 'Choose a new parent for this location.'
  }

  return 'Choose a parent for this location.'
}
