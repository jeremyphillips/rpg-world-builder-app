import { collectCatalogSortValues, resolveCatalogSortSections } from '@/lib/catalog-sort'

import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'

import {
  EQUIPMENT_PICKER_SORT_AXES,
  EQUIPMENT_PICKER_SORT_BEST_MATCH,
  EQUIPMENT_PICKER_SORT_MODES,
  EQUIPMENT_PICKER_SORT_PRESETS,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
  EQUIPMENT_PICKER_SORT_PRICE_DESC,
  type EquipmentPickerSortMode,
} from './equipment-picker-drawer.types'

/** Sort modes enabled for the current equipment workflow, in menu order. */
export function resolveEquipmentPickerAvailableSortModes(
  workflowMode: EquipmentPickerWorkflowMode,
): EquipmentPickerSortMode[] {
  const hidePriceSort = workflowMode === 'magic_items' || workflowMode === 'loadout'
  const availableValues = hidePriceSort
    ? EQUIPMENT_PICKER_SORT_MODES.filter(
        (mode) =>
          mode !== EQUIPMENT_PICKER_SORT_PRICE_ASC && mode !== EQUIPMENT_PICKER_SORT_PRICE_DESC,
      )
    : EQUIPMENT_PICKER_SORT_MODES

  return collectCatalogSortValues(
    resolveCatalogSortSections({
      axes: EQUIPMENT_PICKER_SORT_AXES,
      presets: EQUIPMENT_PICKER_SORT_PRESETS,
      availableValues,
    }),
  ) as EquipmentPickerSortMode[]
}

/** When workflow removes modes (e.g. price on magic items), coerce to a valid value. */
export function normalizeEquipmentPickerSortMode(
  sortMode: EquipmentPickerSortMode,
  availableModes: readonly EquipmentPickerSortMode[],
  fallback: EquipmentPickerSortMode = EQUIPMENT_PICKER_SORT_BEST_MATCH,
): EquipmentPickerSortMode {
  return availableModes.includes(sortMode) ? sortMode : fallback
}
