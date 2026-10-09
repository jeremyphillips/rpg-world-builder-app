import { resolveCatalogSortSections } from '@/lib/catalog-sort'
import type { SortMenuSection } from '@rpg/ui'

import {
  EQUIPMENT_PICKER_SORT_AXES,
  EQUIPMENT_PICKER_SORT_BEST_MATCH,
  EQUIPMENT_PICKER_SORT_PRESETS,
  type EquipmentPickerSortMode,
} from './equipment-picker-drawer.types'

/** Grouped SortMenu sections for the equipment picker from the catalog-sort registry. */
export function buildEquipmentPickerSortSections(
  modes: readonly EquipmentPickerSortMode[],
): SortMenuSection<EquipmentPickerSortMode>[] {
  return resolveCatalogSortSections({
    axes: EQUIPMENT_PICKER_SORT_AXES,
    presets: EQUIPMENT_PICKER_SORT_PRESETS,
    availableValues: modes,
  }) as SortMenuSection<EquipmentPickerSortMode>[]
}

/** When workflow removes modes (e.g. price on magic items), coerce to a valid value. */
export function normalizeEquipmentPickerSortMode(
  sortMode: EquipmentPickerSortMode,
  availableModes: readonly EquipmentPickerSortMode[],
  fallback: EquipmentPickerSortMode = EQUIPMENT_PICKER_SORT_BEST_MATCH,
): EquipmentPickerSortMode {
  return availableModes.includes(sortMode) ? sortMode : fallback
}
