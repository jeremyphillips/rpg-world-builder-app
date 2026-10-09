import { resolveLocationClassificationDisplay, type Location } from '@rpg/contracts'
import { scoreSearchDocument, type SearchDocument } from '@rpg/search'
import { normalizeSearchQuery } from '@rpg/ui'

import { comparePickerName } from '@/lib/catalog-picker/compare-picker-name'

import { getResidenceLocationSearchText } from '../../../lib/connections/residence-location-connection.lib'
import {
  chainComparators,
  scoreAndFilterPickerItems,
} from '../../picker/sort/catalog-picker-sort.lib'

type ResidencePickerItem = { location: Location; selected: boolean }

function assembleResidencePickerSearchDocument(location: Location): SearchDocument {
  const parts = resolveLocationClassificationDisplay(location).parts
  return {
    id: location.id,
    fields: [
      { key: 'name', text: location.name, role: 'primary' },
      ...parts.map((part, index) => ({
        key: `class:${index}`,
        text: part,
        role: 'keyword' as const,
      })),
      {
        key: 'combined',
        text: getResidenceLocationSearchText(location),
        role: 'secondary' as const,
      },
    ],
  }
}

function scoreResidencePickerItem(item: ResidencePickerItem, searchQuery: string): number {
  return scoreSearchDocument(assembleResidencePickerSearchDocument(item.location), searchQuery, {
    profile: 'forgiving',
  })
}

export function filterAndSortResidencePickerItems(
  items: readonly ResidencePickerItem[],
  options: { searchQuery: string },
) {
  const hasQuery = normalizeSearchQuery(options.searchQuery).length > 0
  const scored = scoreAndFilterPickerItems(items, {
    searchQuery: options.searchQuery,
    scoreItem: scoreResidencePickerItem,
  })

  return scored
    .toSorted(
      chainComparators(
        (left, right) => (hasQuery ? right.searchScore - left.searchScore : 0),
        (left, right) =>
          comparePickerName(
            { name: left.item.location.name, id: left.item.location.id },
            { name: right.item.location.name, id: right.item.location.id },
          ),
      ),
    )
    .map((row) => row.item)
}
