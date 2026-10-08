import { getContentTypeSentenceForm, type Location } from '@rpg/contracts'

const locationPlural = getContentTypeSentenceForm('locations', 2)
const locationSingular = getContentTypeSentenceForm('locations', 1)

export const LOCATION_CATALOG_SEARCH_PLACEHOLDER = `Search ${locationPlural}`
export const LOCATION_CATALOG_NO_RESULTS_MESSAGE = `No ${locationPlural} match your search.`
export const LOCATION_CATALOG_NO_ITEMS_MESSAGE = `No ${locationPlural} are available.`
export const RESIDENCE_PICKER_TITLE = 'Choose residence'
export const RESIDENCE_PICKER_DESCRIPTION = `Choose a ${locationSingular} where this character lives.`
export const RESIDENCE_PICKER_NO_RESULTS_MESSAGE = `No ${locationPlural} match this search.`
export const RESIDENCE_PICKER_NO_ITEMS_MESSAGE = 'No residence locations are available.'
export const RESIDENCE_PICKER_ADD_SUBMIT_LABEL = 'Add residence'

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
