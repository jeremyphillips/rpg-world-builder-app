import { catalogNounFromContentType, formatCatalogPickerCopy, type Location } from '@rpg/contracts'

export const LOCATION_CATALOG_COPY = formatCatalogPickerCopy(
  catalogNounFromContentType('locations'),
)

export const LOCATION_CATALOG_SEARCH_PLACEHOLDER = LOCATION_CATALOG_COPY.searchPlaceholder

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
