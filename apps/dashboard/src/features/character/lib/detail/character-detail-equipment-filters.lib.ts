import {
  EQUIPMENT_PICKER_SUPPORTED_KINDS,
  isEquipmentPickerSupportedKind,
  type EquipmentPickerSupportedKind,
} from '@rpg/contracts'
import { normalizeSearchQuery } from '@rpg/ui'
import { applyFilterSchema, type FilterSchema } from '@rpg/ui/filters'

import {
  CHARACTER_DETAIL_CATALOG_SEARCH_MIN_ITEMS,
  matchesCharacterDetailCatalogSearchQuery,
} from './character-detail-catalog-filters.lib'
import type { CharacterDetailEquipmentFilterState } from './character-detail-equipment-filter-schema'
import type { CharacterSheetEquipmentCard } from './character-sheet-catalog'

export const CHARACTER_DETAIL_EQUIPMENT_KIND_ALL = '__all__' as const

export const CHARACTER_DETAIL_EQUIPMENT_CATEGORY_LABEL = 'Category'
export const CHARACTER_DETAIL_EQUIPMENT_SORT_LABEL = 'Sort'
export const CHARACTER_DETAIL_EQUIPMENT_RESET_VIEW_LABEL = 'Reset view'
export const CHARACTER_DETAIL_EQUIPMENT_SEARCH_PLACEHOLDER = 'Search equipment'

export const CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_ASC = 'name_asc' as const
export const CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_DESC = 'name_desc' as const

export type CharacterDetailEquipmentSortMode =
  | typeof CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_ASC
  | typeof CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_DESC

export type CharacterDetailEquipmentKindFilter =
  | typeof CHARACTER_DETAIL_EQUIPMENT_KIND_ALL
  | EquipmentPickerSupportedKind

export const CHARACTER_DETAIL_EQUIPMENT_SORT_MODES = [
  CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_ASC,
  CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_DESC,
] as const satisfies readonly CharacterDetailEquipmentSortMode[]

export const CHARACTER_DETAIL_EQUIPMENT_SORT_LABELS: Record<
  CharacterDetailEquipmentSortMode,
  string
> = {
  [CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_ASC]: 'Name: A–Z',
  [CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_DESC]: 'Name: Z–A',
}

export const CHARACTER_DETAIL_EQUIPMENT_VIEW_DEFAULTS = {
  selectedKind: CHARACTER_DETAIL_EQUIPMENT_KIND_ALL,
  sortMode: CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_ASC,
  searchQuery: '',
} as const

export const CHARACTER_DETAIL_EQUIPMENT_SEARCH_MIN_ITEMS = CHARACTER_DETAIL_CATALOG_SEARCH_MIN_ITEMS

const equipmentNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

export function resolveCharacterDetailEquipmentKindOptions(
  cards: readonly CharacterSheetEquipmentCard[],
): EquipmentPickerSupportedKind[] {
  const kindsInCards = new Set<EquipmentPickerSupportedKind>()

  for (const card of cards) {
    if (card.status !== 'resolved') continue
    if (!isEquipmentPickerSupportedKind(card.equipment.kind)) continue
    kindsInCards.add(card.equipment.kind)
  }

  return EQUIPMENT_PICKER_SUPPORTED_KINDS.filter((kind) => kindsInCards.has(kind))
}

export function filterCharacterDetailEquipmentCards(
  cards: readonly CharacterSheetEquipmentCard[],
  options: {
    schema: FilterSchema<CharacterSheetEquipmentCard, CharacterDetailEquipmentFilterState>
    filterState: CharacterDetailEquipmentFilterState
    searchQuery: string
  },
): CharacterSheetEquipmentCard[] {
  const normalizedQuery = normalizeSearchQuery(options.searchQuery)
  const searchFiltered = cards.filter((card) =>
    matchesCharacterDetailCatalogSearchQuery(card, normalizedQuery),
  )

  return applyFilterSchema(options.schema, options.filterState, searchFiltered)
}

export function sortCharacterDetailEquipmentCards(
  cards: readonly CharacterSheetEquipmentCard[],
  sortMode: CharacterDetailEquipmentSortMode,
): CharacterSheetEquipmentCard[] {
  const direction = sortMode === CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_DESC ? -1 : 1

  return [...cards].sort(
    (left, right) => direction * equipmentNameCollator.compare(left.displayName, right.displayName),
  )
}
