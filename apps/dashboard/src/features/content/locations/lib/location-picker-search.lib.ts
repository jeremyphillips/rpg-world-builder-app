import type { Location } from '@rpg/contracts'
import type { SearchDocument, SearchField } from '@rpg/search'

import { buildLocationEntitySummaryVm, buildLocationPickerSearchText } from './location-display'

type LocationPickerSearchContext = {
  locationsById: ReadonlyMap<string, Location>
  campaignId: string
}

/**
 * Location picker search document.
 * Name is primary, classification parts are keywords, and ancestor names are
 * secondary so a name hit outranks a classification hit, which outranks an
 * ancestor hit. Combined text stays equal to `buildLocationPickerSearchText`.
 */
export function assembleLocationPickerSearchDocument(
  location: Location,
  context: LocationPickerSearchContext,
): SearchDocument {
  const summary = buildLocationEntitySummaryVm(location, context)
  const fields: SearchField[] = [
    { key: 'name', text: location.name, role: 'primary' },
    ...summary.classification.parts.map((part, index) => ({
      key: `class:${index}`,
      text: part,
      role: 'keyword' as const,
    })),
    ...summary.ancestry.items.map((item, index) => ({
      key: `ancestor:${index}`,
      text: item.name,
      role: 'secondary' as const,
    })),
    {
      key: 'combined',
      text: buildLocationPickerSearchText(location, context),
      role: 'secondary',
    },
  ]

  return { id: location.id, fields }
}
