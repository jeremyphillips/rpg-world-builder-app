import type { Location } from '@rpg/contracts'

import { getResidenceLocationSearchText } from '../../../lib/connections/residence-location-connection.lib'

const locationNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

export function normalizeResidencePickerSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function filterAndSortResidencePickerItems(
  items: readonly { location: Location; selected: boolean }[],
  options: { searchQuery: string },
) {
  const query = normalizeResidencePickerSearchQuery(options.searchQuery)

  return items
    .filter(({ location }) => {
      if (query.length === 0) return true
      return normalizeResidencePickerSearchQuery(getResidenceLocationSearchText(location)).includes(
        query,
      )
    })
    .sort((left, right) => locationNameCollator.compare(left.location.name, right.location.name))
}
