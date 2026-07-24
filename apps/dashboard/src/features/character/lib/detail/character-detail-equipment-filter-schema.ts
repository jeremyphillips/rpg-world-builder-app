import {
  getEquipmentKindLabel,
  isEquipmentPickerSupportedKind,
  type EquipmentPickerSupportedKind,
} from '@rpg/contracts'

import {
  countModifiedFilters,
  createChipsFilter,
  createFilterSchema,
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import {
  CHARACTER_DETAIL_EQUIPMENT_CATEGORY_LABEL,
  CHARACTER_DETAIL_EQUIPMENT_KIND_ALL,
  type CharacterDetailEquipmentKindFilter,
} from './character-detail-equipment-filters.lib'
import type { CharacterSheetEquipmentCard } from './character-sheet-catalog'

export type CharacterDetailEquipmentFilterState = {
  selectedKind?: CharacterDetailEquipmentKindFilter
}

export const CHARACTER_DETAIL_EQUIPMENT_FILTER_LAYOUT = {
  primaryFieldIds: ['selectedKind'],
} as const satisfies FilterCatalogLayoutConfig<CharacterDetailEquipmentFilterState>

export type CreateCharacterDetailEquipmentFilterSchemaArgs = {
  kindOptions: readonly EquipmentPickerSupportedKind[]
  showCategoryFilter: boolean
}

export function createCharacterDetailEquipmentFilterSchema(
  args: CreateCharacterDetailEquipmentFilterSchemaArgs,
): FilterSchema<CharacterSheetEquipmentCard, CharacterDetailEquipmentFilterState> {
  const fields = []

  if (args.showCategoryFilter) {
    fields.push(
      createChipsFilter<
        CharacterSheetEquipmentCard,
        CharacterDetailEquipmentFilterState,
        'selectedKind'
      >({
        id: 'selectedKind',
        label: CHARACTER_DETAIL_EQUIPMENT_CATEGORY_LABEL,
        selectionMode: 'single-required',
        defaultValue: CHARACTER_DETAIL_EQUIPMENT_KIND_ALL,
        isValueConstraining: (value) => value !== CHARACTER_DETAIL_EQUIPMENT_KIND_ALL,
        options: [
          { value: CHARACTER_DETAIL_EQUIPMENT_KIND_ALL, label: 'All' },
          ...args.kindOptions.map((kind) => ({
            value: kind,
            label: getEquipmentKindLabel(kind),
          })),
        ],
        matches: (card, value) => {
          if (value === CHARACTER_DETAIL_EQUIPMENT_KIND_ALL) return true
          if (card.status !== 'resolved') return false
          return (
            isEquipmentPickerSupportedKind(card.equipment.kind) && card.equipment.kind === value
          )
        },
      }),
    )
  }

  return createFilterSchema(fields, {
    sanitizeState: (state) => ({
      selectedKind:
        state.selectedKind &&
        args.kindOptions.includes(state.selectedKind as EquipmentPickerSupportedKind)
          ? state.selectedKind
          : CHARACTER_DETAIL_EQUIPMENT_KIND_ALL,
    }),
  })
}

export function countCharacterDetailEquipmentStructuredFilters(
  schema: FilterSchema<CharacterSheetEquipmentCard, CharacterDetailEquipmentFilterState>,
  state: CharacterDetailEquipmentFilterState,
): number {
  return countModifiedFilters(schema, state)
}

export function toCharacterDetailEquipmentFilterState(args: {
  selectedKind: CharacterDetailEquipmentKindFilter
}): CharacterDetailEquipmentFilterState {
  return { selectedKind: args.selectedKind }
}
