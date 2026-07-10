import type { Equipment } from '../../../../content/equipment'
import type { CharacterProficiencies } from '../../../character/proficiencies'
import type { EquipmentPickerItem } from '../picker/equipment-picker-item'
import { isEquipmentPickerSupportedKind } from '../picker/equipment-picker-supported-kinds'
import type { EquipmentBudgetSummary } from './equipment-budget'
import { isEquipmentAffordable } from './equipment-budget'
import { buildEquipmentPickerSearchText } from './format-equipment-picker-metadata'
import { isEquipmentProficient } from './is-equipment-proficient'

export type ResolveEquipmentPickerItemsArgs = {
  equipment: readonly Equipment[]
  proficiencies: CharacterProficiencies
  recommendedEquipmentIds: ReadonlySet<string>
  budget?: EquipmentBudgetSummary
}

/** Annotates available equipment rows with orthogonal picker state for the drawer. */
export function resolveEquipmentPickerItems({
  equipment,
  proficiencies,
  recommendedEquipmentIds,
  budget,
}: ResolveEquipmentPickerItemsArgs): EquipmentPickerItem[] {
  return equipment
    .filter((row) => isEquipmentPickerSupportedKind(row.kind))
    .map((row) => ({
      equipment: row,
      searchText: buildEquipmentPickerSearchText(row),
      state: {
        isAvailable: true,
        isRecommended: recommendedEquipmentIds.has(row.id),
        isProficient: isEquipmentProficient(row, proficiencies),
        isAffordable: budget ? isEquipmentAffordable(row, budget) : true,
        disabledReasons: [],
      },
    }))
}
