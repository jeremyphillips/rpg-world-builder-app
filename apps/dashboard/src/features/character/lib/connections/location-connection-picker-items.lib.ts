import type { Location } from '@rpg/contracts'

import { buildLocationPickerSearchText } from '@/features/content'
import { comparePickerName, type PickerNameKey } from '@/lib/catalog-picker/compare-picker-name'

export type LocationConnectionPickerSearchContext = {
  locationsById: ReadonlyMap<string, Location>
  campaignId: string
}

/** Name, then id. Shared by location relationship add and the connection modal's place and property sections. */
export function sortLocationConnectionPickerRows<T extends PickerNameKey>(rows: readonly T[]): T[] {
  return rows.toSorted(comparePickerName)
}

/** Sorted location rows plus the shared location picker search text. */
export function buildLocationConnectionPickerEntries<T extends Location>(
  locations: readonly T[],
  searchContext: LocationConnectionPickerSearchContext,
): Array<{ location: T; searchText: string }> {
  return sortLocationConnectionPickerRows(locations).map((location) => ({
    location,
    searchText: buildLocationPickerSearchText(location, searchContext),
  }))
}
