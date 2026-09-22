import type { Location } from '@rpg/contracts'

export const RESIDENCE_PICKER_TITLE = 'Choose residence'
export const RESIDENCE_PICKER_DESCRIPTION = 'Choose a location where this character lives.'
export const RESIDENCE_PICKER_NO_RESULTS_MESSAGE = 'No locations match this search.'
export const RESIDENCE_PICKER_NO_ITEMS_MESSAGE = 'No residence locations are available.'

export type ResidenceLocationPickerItem = {
  location: Location
  selected: boolean
}

export type ResidenceLocationSelection = {
  locationId: string
}

export type ResidenceLocationPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly ResidenceLocationPickerItem[]
  onAdd: (selection: ResidenceLocationSelection) => void | Promise<void>
}
