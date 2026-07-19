import {
  EQUIPMENT_PICKER_SUPPORTED_KINDS,
  getEquipmentKindLabel,
  isEquipmentPickerSupportedKind,
  type EquipmentPickerSupportedKind,
} from '@rpg/contracts'
import { normalizeSearchQuery } from '@rpg/ui'

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

/** Show search once the inventory is large enough to benefit from it. */
export const CHARACTER_DETAIL_EQUIPMENT_SEARCH_MIN_ITEMS = 6

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

export function countCharacterDetailEquipmentStructuredFilters(
  selectedKind: CharacterDetailEquipmentKindFilter,
): number {
  return selectedKind === CHARACTER_DETAIL_EQUIPMENT_KIND_ALL ? 0 : 1
}

function matchesEquipmentSearchQuery(
  card: CharacterSheetEquipmentCard,
  normalizedQuery: string,
): boolean {
  if (normalizedQuery.length === 0) return true
  return normalizeSearchQuery(card.displayName).includes(normalizedQuery)
}

export function filterCharacterDetailEquipmentCards(
  cards: readonly CharacterSheetEquipmentCard[],
  options: {
    selectedKind: CharacterDetailEquipmentKindFilter
    searchQuery: string
  },
): CharacterSheetEquipmentCard[] {
  const normalizedQuery = normalizeSearchQuery(options.searchQuery)

  return cards.filter((card) => {
    if (!matchesEquipmentSearchQuery(card, normalizedQuery)) return false

    if (options.selectedKind === CHARACTER_DETAIL_EQUIPMENT_KIND_ALL) return true
    if (card.status !== 'resolved') return false

    return (
      isEquipmentPickerSupportedKind(card.equipment.kind) &&
      card.equipment.kind === options.selectedKind
    )
  })
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

export function buildCharacterDetailEquipmentKindChipOptions(
  kinds: readonly EquipmentPickerSupportedKind[],
): readonly { value: string; label: string }[] {
  return [
    { value: CHARACTER_DETAIL_EQUIPMENT_KIND_ALL, label: 'All' },
    ...kinds.map((kind) => ({
      value: kind,
      label: getEquipmentKindLabel(kind),
    })),
  ]
}
